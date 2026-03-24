# Deutschgram Call

Invite-only family messenger for browser-based text, audio, and video calls.

## Local setup

1. Start WAMP and make sure Apache and MySQL are running.
2. Open `http://localhost/deutschgram/`.
3. Admin invite management is available in the web UI.
4. The local admin key is configured through `.env`.

## Database

- MySQL is used by default.
- Runtime config is loaded from `.env` or `config.local.php`.
- Migrations are stored in `database/migrations`.
- Run migrations with `database/migrate.php`.

## Invite flow

- Users can enter only through an invite link.
- The first successful login binds the invite to one username.
- Admin can create and revoke invite links from the built-in admin panel.