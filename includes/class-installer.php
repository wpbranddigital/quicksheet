<?php
/**
 * Activation / DB schema.
 *
 * @package QuickSheetWP
 */

namespace QuickSheetWP;

defined( 'ABSPATH' ) || exit;

/**
 * Creates and upgrades the plugin tables.
 */
class Installer {

	/**
	 * Activation hook.
	 */
	public static function activate() {
		self::create_tables();
		// Autoloaded: maybe_upgrade() reads it on every request.
		update_option( 'qswp_db_version', QSWP_DB_VERSION, true );
		if ( ! wp_next_scheduled( 'qswp_cleanup_logs' ) ) {
			wp_schedule_event( time() + HOUR_IN_SECONDS, 'daily', 'qswp_cleanup_logs' );
		}
	}

	/**
	 * Deactivation hook.
	 */
	public static function deactivate() {
		wp_clear_scheduled_hook( 'qswp_cleanup_logs' );
		wp_unschedule_hook( 'qswp_retry_log' );
	}

	/**
	 * Run the installer when the stored schema version differs.
	 */
	public static function maybe_upgrade() {
		if ( get_option( 'qswp_db_version' ) !== QSWP_DB_VERSION ) {
			self::activate();
		}
	}

	/**
	 * Create / update tables with dbDelta.
	 */
	public static function create_tables() {
		global $wpdb;
		require_once ABSPATH . 'wp-admin/includes/upgrade.php';

		$charset  = $wpdb->get_charset_collate();
		$feeds    = $wpdb->prefix . 'qswp_feeds';
		$logs     = $wpdb->prefix . 'qswp_logs';
		$accounts = $wpdb->prefix . 'qswp_accounts';

		dbDelta(
			"CREATE TABLE {$feeds} (
				id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
				name varchar(191) NOT NULL DEFAULT '',
				source varchar(50) NOT NULL DEFAULT '',
				form_id varchar(100) NOT NULL DEFAULT '',
				form_title varchar(191) NOT NULL DEFAULT '',
				action varchar(50) NOT NULL DEFAULT 'google_sheets',
				account_id bigint(20) unsigned NOT NULL DEFAULT 0,
				spreadsheet_id varchar(191) NOT NULL DEFAULT '',
				spreadsheet_name varchar(191) NOT NULL DEFAULT '',
				sheet_name varchar(191) NOT NULL DEFAULT '',
				field_map longtext NULL,
				settings longtext NULL,
				status tinyint(1) NOT NULL DEFAULT 1,
				created_at datetime NOT NULL,
				updated_at datetime NOT NULL,
				PRIMARY KEY  (id),
				KEY source_form (source, form_id)
			) {$charset};"
		);

		dbDelta(
			"CREATE TABLE {$logs} (
				id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
				feed_id bigint(20) unsigned NOT NULL DEFAULT 0,
				source varchar(50) NOT NULL DEFAULT '',
				form_id varchar(100) NOT NULL DEFAULT '',
				action varchar(50) NOT NULL DEFAULT '',
				status varchar(20) NOT NULL DEFAULT 'success',
				message text NULL,
				row_data longtext NULL,
				attempts smallint(5) unsigned NOT NULL DEFAULT 1,
				created_at datetime NOT NULL,
				updated_at datetime NOT NULL,
				PRIMARY KEY  (id),
				KEY feed_id (feed_id),
				KEY status (status),
				KEY created_at (created_at)
			) {$charset};"
		);

		dbDelta(
			"CREATE TABLE {$accounts} (
				id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
				service varchar(50) NOT NULL DEFAULT '',
				name varchar(191) NOT NULL DEFAULT '',
				credentials longtext NULL,
				created_at datetime NOT NULL,
				PRIMARY KEY  (id),
				KEY service (service)
			) {$charset};"
		);
	}
}
