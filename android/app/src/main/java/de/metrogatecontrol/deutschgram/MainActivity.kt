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
                cacheMode = WebSettings.LOAD_DEFAULT
                mixedContentMode = WebSettings.MIXED_CONTENT_NEVER_ALLOW
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
        val incomingUrl = intent?.data?.toString()
        val safeUrl = normalizeUrl(incomingUrl) ?: BuildConfig.DEUTSCHGRAM_BASE_URL
        binding.webView.loadUrl(safeUrl)
    }

    private fun normalizeUrl(rawUrl: String?): String? {
        if (rawUrl.isNullOrBlank()) {
            return null
        }

        val uri = Uri.parse(rawUrl)
        val host = uri.host?.lowercase() ?: return null
        if (uri.scheme != "https" || host != BuildConfig.DEUTSCHGRAM_HOST) {
            return null
        }

        return uri.toString()
    }

    private fun handleExternalNavigation(uri: Uri): Boolean {
        val host = uri.host?.lowercase()
        if (uri.scheme == "https" && host == BuildConfig.DEUTSCHGRAM_HOST) {
            return false
        }

        startActivity(Intent(Intent.ACTION_VIEW, uri))
        return true
    }
}