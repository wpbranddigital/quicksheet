<?php
/**
 * General (non-Google) plugin settings.
 *
 * @package QuickSheetWP
 */

namespace QuickSheetWP;

defined( 'ABSPATH' ) || exit;

/**
 * Options.
 */
class Options {

	const OPTION = 'qswp_settings';

	/**
	 * Default settings.
	 */
	public static function defaults() {
		return array(
			'auto_retry'         => true,
			'max_retries'        => 3,
			'log_retention_days' => 30,
			'escape_formulas'    => true,
			'date_format'        => 'Y-m-d',
			'time_format'        => 'H:i:s',
		);
	}

	/**
	 * All settings.
	 */
	public static function all() {
		return wp_parse_args( (array) get_option( self::OPTION, array() ), self::defaults() );
	}

	/**
	 * One setting.
	 */
	public static function get( $key ) {
		$all = self::all();
		return isset( $all[ $key ] ) ? $all[ $key ] : null;
	}

	/**
	 * Sanitize and save settings.
	 */
	public static function save( array $input ) {
		$current = self::all();
		$clean   = array(
			'auto_retry'         => isset( $input['auto_retry'] ) ? rest_sanitize_boolean( $input['auto_retry'] ) : $current['auto_retry'],
			'max_retries'        => isset( $input['max_retries'] ) ? max( 0, min( 10, (int) $input['max_retries'] ) ) : $current['max_retries'],
			'log_retention_days' => isset( $input['log_retention_days'] ) ? max( 1, min( 365, (int) $input['log_retention_days'] ) ) : $current['log_retention_days'],
			'escape_formulas'    => isset( $input['escape_formulas'] ) ? rest_sanitize_boolean( $input['escape_formulas'] ) : $current['escape_formulas'],
			'date_format'        => isset( $input['date_format'] ) && is_scalar( $input['date_format'] ) && '' !== trim( (string) $input['date_format'] ) ? sanitize_text_field( (string) $input['date_format'] ) : $current['date_format'],
			'time_format'        => isset( $input['time_format'] ) && is_scalar( $input['time_format'] ) && '' !== trim( (string) $input['time_format'] ) ? sanitize_text_field( (string) $input['time_format'] ) : $current['time_format'],
		);
		update_option( self::OPTION, $clean, false );
		return $clean;
	}
}
