<?php
/**
 * Conditional logic: run an integration only when rules match.
 *
 * @package QuickSheetWP
 */

namespace QuickSheetWP;

defined( 'ABSPATH' ) || exit;

/**
 * Condition helpers.
 */
class Conditions {

	const OPERATORS = array( 'equals', 'not_equals', 'contains', 'not_contains', 'starts_with', 'empty', 'not_empty', 'greater_than', 'less_than' );

	/**
	 * Sanitize a condition block.
	 *
	 * @param mixed $raw Raw input.
	 * @return array
	 */
	public static function sanitize( $raw ) {
		$raw   = is_array( $raw ) ? $raw : array();
		$rules = array();
		foreach ( isset( $raw['rules'] ) && is_array( $raw['rules'] ) ? $raw['rules'] : array() as $rule ) {
			if ( ! is_array( $rule ) || empty( $rule['field'] ) ) {
				continue;
			}
			$operator = isset( $rule['operator'] ) ? sanitize_key( $rule['operator'] ) : 'equals';
			$rules[]  = array(
				'field'    => sanitize_text_field( (string) $rule['field'] ),
				'operator' => in_array( $operator, self::OPERATORS, true ) ? $operator : 'equals',
				'value'    => isset( $rule['value'] ) ? sanitize_text_field( (string) $rule['value'] ) : '',
			);
		}
		return array(
			'enabled' => ! empty( $raw['enabled'] ) && rest_sanitize_boolean( $raw['enabled'] ) && $rules,
			'match'   => isset( $raw['match'] ) && 'any' === $raw['match'] ? 'any' : 'all',
			'rules'   => array_slice( $rules, 0, 20 ),
		);
	}

	/**
	 * Evaluate conditions against rendered merge tags.
	 *
	 * @param array      $condition  Sanitized condition.
	 * @param array      $tags       Merge tags.
	 * @param Dispatcher $dispatcher Renderer.
	 * @return bool
	 */
	public static function passes( $condition, array $tags, Dispatcher $dispatcher ) {
		if ( empty( $condition['enabled'] ) || empty( $condition['rules'] ) ) {
			return true;
		}
		$results = array();
		foreach ( $condition['rules'] as $rule ) {
			$results[] = self::check( $dispatcher->render_template( $rule['field'], $tags ), $rule['operator'], $rule['value'] );
		}
		return 'any' === $condition['match'] ? in_array( true, $results, true ) : ! in_array( false, $results, true );
	}

	/**
	 * Evaluate one rule.
	 *
	 * @param string $actual   Submitted value.
	 * @param string $operator Operator.
	 * @param string $expected Expected value.
	 * @return bool
	 */
	public static function check( $actual, $operator, $expected ) {
		$a = strtolower( trim( (string) $actual ) );
		$e = strtolower( trim( (string) $expected ) );
		switch ( $operator ) {
			case 'not_equals':
				return $a !== $e;
			case 'contains':
				return '' !== $e && false !== strpos( $a, $e );
			case 'not_contains':
				return '' === $e || false === strpos( $a, $e );
			case 'starts_with':
				return '' !== $e && 0 === strpos( $a, $e );
			case 'empty':
				return '' === $a;
			case 'not_empty':
				return '' !== $a;
			case 'greater_than':
				return is_numeric( $a ) && is_numeric( $e ) && (float) $a > (float) $e;
			case 'less_than':
				return is_numeric( $a ) && is_numeric( $e ) && (float) $a < (float) $e;
			case 'equals':
			default:
				return $a === $e;
		}
	}
}
