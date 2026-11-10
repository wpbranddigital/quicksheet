<?php
/**
 * Uninstall: remove tables, options and scheduled events.
 *
 * @package QuickSheetWP
 */

defined( 'WP_UNINSTALL_PLUGIN' ) || exit;

global $wpdb;

foreach ( array( 'qswp_feeds', 'qswp_logs', 'qswp_accounts' ) as $qswp_table ) {
	$wpdb->query( $wpdb->prepare( 'DROP TABLE IF EXISTS %i', $wpdb->prefix . $qswp_table ) ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.DirectDatabaseQuery.SchemaChange
}

foreach ( array( 'qswp_google', 'qswp_settings', 'qswp_db_version' ) as $qswp_option ) {
	delete_option( $qswp_option );
}
delete_transient( 'qswp_elementor_forms' );
wp_clear_scheduled_hook( 'qswp_cleanup_logs' );
wp_unschedule_hook( 'qswp_retry_log' );
