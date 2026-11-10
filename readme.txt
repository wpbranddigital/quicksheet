=== QuickSheet – Send Form Submissions to Google Sheets & Apps ===
Contributors: wpbranddigital25
Tags: google sheets, contact form 7, whatsapp, discord, automation
Requires at least: 6.5
Tested up to: 7.1
Requires PHP: 7.4
Stable tag: 1.0.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Send Contact Form 7, WPForms and Elementor submissions to Google Sheets, WhatsApp, Discord and Facebook Pages. No code, no Zapier.

== Description ==

QuickSheet connects your WordPress forms to the apps you already use. Every integration is a simple flow: **Trigger** (a form is submitted) → **Action** (do something in an app). Pick a form, pick an app, map the fields – done.

= Triggers =

* Contact Form 7
* WPForms (Lite & Pro)
* Elementor Pro Forms

= Actions =

* **Google Sheets** – add a row for every submission. Browse your spreadsheets, paste a sheet URL or create a new spreadsheet. Map fields to columns visually, auto-map by column name, or create the header row from your form in one click.
* **WhatsApp** (WhatsApp Cloud API) – send a text or an approved template message to yourself (lead alerts) or to the person who submitted the form.
* **Discord** – post to any channel through a webhook, as plain text or as a rich embed card. @everyone / @here mentions are always disabled.
* **Facebook Page** – publish a post (with optional link) on a Page you manage.

= Built for reliability =

* Submission log with status, attempts and the exact data sent for every delivery.
* Automatic background retry (5, 10, 15 … minutes) for temporary problems such as network errors or rate limits. Permanent errors – like an invalid phone number – are marked failed immediately.
* One-click retry for a single entry or for all failed entries. Failed entries are never purged automatically, so no lead gets lost.
* Send test data from the builder or the integrations list.
* Dashboard with a 14-day delivery chart and per-app counts.

= Flexible =

* Conditional logic: run an integration only when **all** or **any** rules match (is, is not, contains, starts with, empty, greater than …).
* Smart tags: `{all_fields}`, date, time, form title, entry ID, page URL, IP, user agent, logged-in user email, site name – combine them with your own text.
* Multiple accounts per app, pause/resume integrations, unlimited integrations.

= Secure by design =

* Only administrators (`manage_options`) can see or change anything; every REST route is capability-checked and nonce-protected.
* Client secrets, OAuth tokens, access tokens and webhook URLs are encrypted at rest (AES-256 + HMAC) and are never sent back to the browser.
* Credentials are verified with the provider before they are saved.
* Discord requests are restricted to genuine Discord webhook URLs and use `wp_safe_remote_post()` (no SSRF). Meta requests only go to `graph.facebook.com` and use an `Authorization` header, never a token in the URL.
* Spreadsheet formula-injection protection (values starting with = + - @ are stored as text).
* No tracking, no ads, no calls home.

== External services ==

This plugin connects to third-party services **only after an administrator connects an account and creates an integration**. Nothing is sent anywhere just by installing or activating the plugin.

= Google (Google Sheets API, Google Drive API, Google OAuth) =

Used to authorize your Google account, list your spreadsheets, read sheet tabs and header rows, create spreadsheets and append a row for each form submission.

* When: when you connect Google, open the integration builder, and every time a form with an active Google Sheets integration is submitted.
* Data sent: your OAuth client ID/secret and authorization code (during connection), access tokens, spreadsheet IDs/names and the mapped form values configured by you.
* Hosts: accounts.google.com, oauth2.googleapis.com, openidconnect.googleapis.com, sheets.googleapis.com, www.googleapis.com
* Terms of Service: https://policies.google.com/terms – Google APIs Terms: https://developers.google.com/terms
* Privacy Policy: https://policies.google.com/privacy

= Meta – WhatsApp Cloud API and Facebook Graph API =

Used to verify your WhatsApp Business phone number or Facebook Page, send WhatsApp messages and publish Facebook Page posts.

* When: when you add or re-check a WhatsApp/Facebook account, and every time a form with an active WhatsApp or Facebook Page integration is submitted.
* Data sent: your access token (as an Authorization header), phone number ID or Page ID, the recipient phone number and the message/post text built from form values as configured by you.
* Host: graph.facebook.com
* Terms of Service: https://www.facebook.com/legal/terms – WhatsApp Business Terms: https://www.whatsapp.com/legal/business-terms
* Privacy Policy: https://www.facebook.com/privacy/policy – WhatsApp: https://www.whatsapp.com/legal/privacy-policy

= Discord =

Used to verify your webhook and post messages to your Discord channel.

* When: when you add or re-check a Discord webhook, and every time a form with an active Discord integration is submitted.
* Data sent: the message (and optional embed) built from form values as configured by you, to the webhook URL you provide.
* Host: discord.com
* Terms of Service: https://discord.com/terms
* Privacy Policy: https://discord.com/privacy

== Installation ==

1. Install and activate the plugin.
2. Go to **QuickSheet → Apps** and connect at least one app:
   * **Google Sheets** – follow the on-screen guide: create a Google Cloud project, enable the Google Sheets API and Google Drive API, configure the OAuth consent screen, create an OAuth client ID (*Web application*) with the redirect URI shown in the plugin, paste the Client ID and Secret and click **Connect with Google**.
   * **WhatsApp** – in Meta for Developers add the WhatsApp product, then paste your *Phone number ID* and a permanent System User access token with `whatsapp_business_messaging`.
   * **Discord** – Server Settings → Integrations → Webhooks → New Webhook → Copy Webhook URL.
   * **Facebook Page** – paste your Page ID and a long-lived Page access token with `pages_manage_posts`.
3. Go to **QuickSheet → Integrations → Create integration**, choose the form (trigger), choose the app (action), configure it and save. Use **Save & send test** to try it.

== Frequently Asked Questions ==

= Do I need a paid service such as Zapier? =
No. The plugin talks directly to Google, Meta and Discord using your own credentials.

= Where are Google Sheets rows added? =
Below the last row of the table that starts in cell A1 of the selected tab.

= Why didn't my WhatsApp text message arrive? =
WhatsApp only delivers free-form text if the recipient messaged your business number within the last 24 hours. To message new leads first, create a message template in WhatsApp Manager and choose **Approved template** in the integration.

= What happens if an app is down? =
The entry is logged as "Retrying" and resent automatically. After the maximum number of retries (Settings) it is marked "Failed" and you can retry it from the Logs page.

= Can I use my own encryption key? =
Yes. Define `QSWP_ENCRYPTION_KEY` in `wp-config.php`. Otherwise the WordPress `AUTH` salt is used. If you change the key, reconnect your apps.

= Is the source code of the admin app available? =
Yes. The React source is in the `src/` folder. Run `npm install && npm run build` to rebuild `build/`.

== Screenshots ==

1. Dashboard with delivery chart, triggers and connected apps.
2. Integrations list.
3. Integration builder – trigger, action and WhatsApp message.
4. Google Sheets field mapping.
5. Apps – connect Google Sheets, WhatsApp, Discord and Facebook Page.
6. Submission logs with payload view and retry.

== Developer hooks ==

* `qswp_integrations` (filter) – register a trigger (extend `QuickSheetWP\Integrations\Integration`).
* `qswp_actions` (filter) – register an action app (extend `QuickSheetWP\Actions\Action`).
* `qswp_submission_fields`, `qswp_merge_tags`, `qswp_payload`, `qswp_row_values` (filters) – change data before it is sent.
* `qswp_is_retryable` (filter) – decide whether an error is retried automatically.
* `qswp_send_success` / `qswp_send_failed` (actions) – react to delivery results.
* `qswp_http_timeout`, `qswp_graph_api_version` (filters).

== Changelog ==

= 1.0.0 =
* Initial release: Contact Form 7, WPForms and Elementor Forms triggers; Google Sheets, WhatsApp, Discord and Facebook Page actions; conditional logic; logs with automatic retry.
