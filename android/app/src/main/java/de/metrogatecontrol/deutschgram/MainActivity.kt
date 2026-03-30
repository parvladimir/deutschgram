package de.metrogatecontrol.deutschgram

import android.Manifest
import android.annotation.SuppressLint
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.view.View
import android.webkit.CookieManager
import android.webkit.PermissionRequest
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.OnBackPressedCallback
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import de.metrogatecontrol.deutschgram.databinding.ActivityMainBinding

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    private var pendingPermissionRequest: PermissionRequest? = null

    private val mediaPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { result ->
        val cameraGranted = result[Manifest.permission.CAMERA] == true || hasPermission(Manifest.permission.CAMERA)
        val audioGranted = result[Manifest.permission.RECORD_AUDIO] == true || hasPermission(Manifest.permission.RECORD_AUDIO)

        if (cameraGranted && audioGranted) {
            pendingPermissionRequest?.grant(
                arrayOf(
                    PermissionRequest.RESOURCE_VIDEO_CAPTURE,
                    PermissionRequest.RESOURCE_AUDIO_CAPTURE
                )
            )
        } else {
            pendingPermissionRequest?.deny()
        }

        pendingPermissionRequest = null
    }

    private val notificationPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        configureWebView()
        requestNotificationPermissionIfNeeded()
        loadIntentUrl(intent)

        onBackPressedDispatcher.addCallback(
            this,
            object : OnBackPressedCallback(true) {
                override fun handleOnBackPressed() {
                    if (binding.webView.canGoBack()) {
                        binding.webView.goBack()
                    } else {
                        finish()
                    }
                }
            }
        )
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        loadIntentUrl(intent)
    }

    override fun onResume() {
        super.onResume()
        binding.webView.onResume()
    }

    override fun onPause() {
        binding.webView.onPause()
        super.onPause()
    }

    override fun onDestroy() {
        binding.webView.destroy()
        super.onDestroy()
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun configureWebView() {
        CookieManager.getInstance().setAcceptCookie(true)
        CookieManager.getInstance().setAcceptThirdPartyCookies(binding.webView, true)

        binding.webView.apply {
            overScrollMode = View.OVER_SCROLL_NEVER
            isVerticalScrollBarEnabled = false
            isHorizontalScrollBarEnabled = false

            settings.apply {
                javaScriptEnabled = true
                domStorageEnabled = true
                databaseEnabled = true
                mediaPlaybackRequiresUserGesture = false
                allowFileAccess = false
                allowContentAccess = false
                loadsImagesAutomatically = true
                cacheMode = WebSettings.LOAD_NO_CACHE
                mixedContentMode = WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE
            }

            webViewClient = object : WebViewClient() {
                override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
                    val url = request?.url ?: return false
                    return handleExternalNavigation(url)
                }
            }

            webChromeClient = object : WebChromeClient() {
                override fun onPermissionRequest(request: PermissionRequest) {
                    runOnUiThread {
                        handleWebPermissionRequest(request)
                    }
                }
            }
        }
    }

    private fun isInternalUri(uri: Uri): Boolean {
        val host = uri.host?.lowercase() ?: return false
        val scheme = uri.scheme?.lowercase() ?: return false
        val allowedHost = BuildConfig.DEUTSCHGRAM_HOST.lowercase()
        return host == allowedHost && (scheme == "https" || (BuildConfig.DEUTSCHGRAM_ALLOW_HTTP && scheme == "http"))
    }

    private fun handleWebPermissionRequest(request: PermissionRequest) {
        val wantsVideo = request.resources.contains(PermissionRequest.RESOURCE_VIDEO_CAPTURE)
        val wantsAudio = request.resources.contains(PermissionRequest.RESOURCE_AUDIO_CAPTURE)

        if (!wantsVideo && !wantsAudio) {
            request.grant(request.resources)
            return
        }

        val requiredPermissions = buildList {
            if (wantsVideo) add(Manifest.permission.CAMERA)
            if (wantsAudio) add(Manifest.permission.RECORD_AUDIO)
        }

        val missingPermissions = requiredPermissions.filterNot(::hasPermission)
        if (missingPermissions.isEmpty()) {
            request.grant(request.resources)
            return
        }

        pendingPermissionRequest = request
        mediaPermissionLauncher.launch(missingPermissions.toTypedArray())
    }

    private fun hasPermission(permission: String): Boolean {
        return ContextCompat.checkSelfPermission(this, permission) == PackageManager.PERMISSION_GRANTED
    }

    private fun requestNotificationPermissionIfNeeded() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU && !hasPermission(Manifest.permission.POST_NOTIFICATIONS)) {
            notificationPermissionLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
        }
    }

    private fun loadIntentUrl(intent: Intent?) {
        val candidates = buildList {
            intent?.dataString?.let(::add)
            if (intent?.action == Intent.ACTION_SEND) {
                intent.getStringExtra(Intent.EXTRA_TEXT)?.let(::add)
            }
        }

        val targetUrl = candidates.asSequence()
            .mapNotNull(::mapIncomingToAppUrl)
            .firstOrNull()
            ?: BuildConfig.DEUTSCHGRAM_BASE_URL

        binding.webView.loadUrl(targetUrl)
    }

    private fun buildInviteUrl(token: String): String {
        val base = BuildConfig.DEUTSCHGRAM_BASE_URL.removeSuffix("/")
        return base + "/join/" + token
    }

    private fun buildPersonalUrl(username: String): String {
        val base = BuildConfig.DEUTSCHGRAM_BASE_URL.removeSuffix("/")
        return base + "/" + username
    }

    private fun buildAdminUrl(): String {
        val base = BuildConfig.DEUTSCHGRAM_BASE_URL.removeSuffix("/")
        return base + "/admin/"
    }

    private fun extractInviteToken(rawValue: String?): String? {
        val raw = rawValue?.trim().orEmpty()
        if (raw.isBlank()) {
            return null
        }

        Regex("(?i)[?&]invite=([a-f0-9]{32,})").find(raw)?.groupValues?.getOrNull(1)?.let {
            return it.lowercase()
        }

        Regex("(?i)(?:^|/)join/([a-f0-9]{32,})(?:$|[/?#])").find(raw)?.groupValues?.getOrNull(1)?.let {
            return it.lowercase()
        }

        Regex("(?i)\\b([a-f0-9]{32,})\\b").find(raw)?.groupValues?.getOrNull(1)?.let {
            return it.lowercase()
        }

        return runCatching {
            Uri.parse(raw).getQueryParameter("invite")?.trim()?.lowercase()
        }.getOrNull()
    }

    private fun mapIncomingToAppUrl(rawValue: String?): String? {
        val raw = rawValue?.trim().orEmpty()
        if (raw.isBlank()) {
            return null
        }

        val inviteToken = extractInviteToken(raw)
        if (!inviteToken.isNullOrBlank()) {
            return buildInviteUrl(inviteToken)
        }

        val uri = runCatching { Uri.parse(raw) }.getOrNull() ?: return null
        if (isInternalUri(uri)) {
            return uri.toString()
        }

        val host = uri.host?.lowercase().orEmpty()
        if (host == "deutschgram.metro-gatecontrol.de") {
            val segments = uri.pathSegments.orEmpty().filter { it.isNotBlank() }
            if (segments.isEmpty()) {
                return BuildConfig.DEUTSCHGRAM_BASE_URL
            }

            if (segments.size == 1 && segments.first().equals("admin", ignoreCase = true)) {
                return buildAdminUrl()
            }

            if (segments.first().equals("join", ignoreCase = true) && segments.size >= 2) {
                val token = segments[1].trim().lowercase()
                if (token.matches(Regex("[a-f0-9]{32,}"))) {
                    return buildInviteUrl(token)
                }
            }

            if (segments.size == 1) {
                return buildPersonalUrl(segments.first())
            }
        }

        return null
    }

    private fun handleExternalNavigation(uri: Uri): Boolean {
        val mappedUrl = mapIncomingToAppUrl(uri.toString())
        if (!mappedUrl.isNullOrBlank()) {
            if (mappedUrl != uri.toString()) {
                binding.webView.loadUrl(mappedUrl)
                return true
            }
            return false
        }

        startActivity(Intent(Intent.ACTION_VIEW, uri))
        return true
    }
}