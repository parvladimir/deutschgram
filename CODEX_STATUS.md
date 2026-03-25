# Codex Status

Last update: 2026-03-25

Completed:
- Main app page no longer contains the admin UI.
- Separate admin area is available at /admin.
- Invite list now exposes personal links like /mama after the first sign-in.
- Personal route login works through the new login_path flow.
- Main app routes like /mama resolve through .htaccess.
- Browser notifications for messages and incoming calls are wired into the web app.
- Service worker file is present for notification display/focus behavior.

Verified locally:
- PHP syntax passes for index.php, admin/index.php, api/auth.php, api/index.php.
- JS syntax passes for assets/app.js and assets/admin.js.
- HTTP 200 for /, /admin/, /mama, and /service-worker.js.
- login_path for mama returns the linked invite and path link.
- sync via login_path works.

Important note:
- Current notifications cover the browser while the site is open or in a background tab.
- True closed-browser Web Push still needs subscription storage + server-side push sending.