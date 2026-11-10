# QuickSheet – development

## Layout

| Path | What |
| --- | --- |
| `quicksheet.php` | Plugin header, constants, autoloader |
| `includes/class-plugin.php` | Bootstrap: registers triggers (`integrations/`) and actions (`actions/`) |
| `includes/integrations/` | Triggers: Contact Form 7, WPForms, Elementor Pro Forms |
| `includes/actions/` | Actions: Google Sheets, WhatsApp (Cloud API), Discord (webhook), Facebook Page |
| `includes/class-dispatcher.php` | Submission → merge tags → conditions → payload → send → log/retry |
| `includes/class-feeds.php` / `class-accounts.php` / `class-logger.php` | DB repositories (`{prefix}qswp_feeds`, `qswp_accounts`, `qswp_logs`) |
| `includes/class-rest-api.php` | `quicksheet/v1` REST routes for the admin app (all `manage_options`) |
| `src/` | React admin app (uses WordPress core `wp.element`, `wp.components`, `wp.apiFetch`) |
| `build/` | Compiled admin app (committed, shipped) |
| `.wordpress-org/` | Banner, icon and screenshots for the WordPress.org SVN `assets/` folder |
| `tests/` | End-to-end tests (not shipped) |

## Build

```bash
npm install
npm start          # watch mode (wp-scripts start)
npm run build      # production build -> build/
```

## Tests

The tests run inside a real WordPress install with WP-CLI. `tests/mocks/qs-test-stubs.php`
is a must-use plugin that stubs Contact Form 7 and mocks Google, Meta and Discord HTTP calls.

```bash
cp tests/mocks/qs-test-stubs.php /path/to/wp/wp-content/mu-plugins/
wp plugin activate quicksheet
wp eval-file wp-content/plugins/quicksheet/tests/e2e.php           # Google Sheets, OAuth, logs, retry, permissions
wp eval-file wp-content/plugins/quicksheet/tests/integrations.php  # WPForms + Elementor triggers
wp eval-file wp-content/plugins/quicksheet/tests/social.php        # WhatsApp, Discord, Facebook, accounts, conditions, SSRF
python3 tests/audit.py .                                              # static security / WP.org checks
```

## Adding an app

Extend `QuickSheetWP\Actions\Action`, implement `slug`, `label`, `description`, `account_fields`,
`verify_account`, `sanitize_settings`, `validate`, `build_payload`, `send`, and register it with the
`qswp_actions` filter. Add a config component in `src/pages/Editor.jsx`.

## Release

1. Bump `Version` in `quicksheet.php`, `QSWP_VERSION`, `Stable tag` and the changelog in `readme.txt`.
2. Check **Tested up to** against the current WordPress release.
3. `npm run build`, run the tests, then zip without the paths in `.distignore`.
