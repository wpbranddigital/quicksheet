<?php
/**
 * Google Sheets action: append one row per submission.
 *
 * @package QuickSheetWP
 */

namespace QuickSheetWP\Actions;

use QuickSheetWP\Options;
use WP_Error;

defined( 'ABSPATH' ) || exit;

/**
 * Google Sheets.
 */
class Google_Sheets extends Action {

	/** {@inheritDoc} */
	public function slug() {
		return 'google_sheets';
	}

	/** {@inheritDoc} */
	public function label() {
		return 'Google Sheets';
	}

	/** {@inheritDoc} */
	public function description() {
		return __( 'Add a new row to a spreadsheet for every submission.', 'quicksheet' );
	}

	/** {@inheritDoc} */
	public function category() {
		return 'productivity';
	}

	/** {@inheritDoc} */
	public function is_connected() {
		return $this->plugin->google->is_connected();
	}

	/** {@inheritDoc} */
	public function sanitize_settings( array $raw ) {
		return array();
	}

	/** {@inheritDoc} */
	public function validate( array $feed ) {
		if ( '' === $feed['spreadsheet_id'] || '' === $feed['sheet_name'] ) {
			return new WP_Error( 'qswp_invalid', __( 'Please select a spreadsheet and a sheet tab.', 'quicksheet' ) );
		}
		if ( empty( $feed['field_map'] ) ) {
			return new WP_Error( 'qswp_invalid', __( 'Map at least one column.', 'quicksheet' ) );
		}
		return true;
	}

	/** {@inheritDoc} */
	public function build_payload( array $feed, array $tags ) {
		$map = $feed['field_map'];
		if ( ! $map ) {
			return array();
		}
		$max = 0;
		foreach ( $map as $item ) {
			$max = max( $max, (int) $item['col'] );
		}
		$row    = array_fill( 0, $max + 1, '' );
		$escape = (bool) Options::get( 'escape_formulas' );

		foreach ( $map as $item ) {
			$value = $this->plugin->dispatcher->render_template( $item['value'], $tags );
			if ( $escape ) {
				$value = self::escape_formula( $value );
			}
			$row[ (int) $item['col'] ] = $value;
		}
		$row = apply_filters( 'qswp_row_values', $row, $feed, $tags );
		return array_filter( $row, 'strlen' ) ? array_values( $row ) : array();
	}

	/**
	 * Prevents spreadsheet formula injection and keeps values like "+8801…" as text.
	 *
	 * @param string $value Value.
	 * @return string
	 */
	public static function escape_formula( $value ) {
		if ( '' === $value ) {
			return $value;
		}
		$first = $value[0];
		// OWASP CSV-injection list: = + - @ plus leading tab / carriage return.
		if ( in_array( $first, array( '=', '+', '@', "\t", "\r" ), true ) || ( '-' === $first && ! is_numeric( $value ) ) ) {
			return "'" . $value;
		}
		return $value;
	}

	/** {@inheritDoc} */
	public function send( array $feed, array $payload ) {
		$result = $this->plugin->google->append_row( $feed['spreadsheet_id'], $feed['sheet_name'], array_values( $payload ) );
		if ( is_wp_error( $result ) ) {
			return $result;
		}
		return array(
			/* translators: %s: sheet range, e.g. Sheet1!A5:D5 */
			'message' => sprintf( __( 'Row added (%s).', 'quicksheet' ), $result['range'] ),
			'range'   => $result['range'],
		);
	}
}
