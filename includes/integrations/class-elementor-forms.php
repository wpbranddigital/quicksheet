<?php
/**
 * Elementor Pro Forms integration.
 *
 * Elementor forms are widgets inside pages, so they are discovered by
 * scanning _elementor_data. The widget's element ID is used as form ID.
 *
 * @package QuickSheetWP
 */

namespace QuickSheetWP\Integrations;

defined( 'ABSPATH' ) || exit;

/**
 * Elementor Forms.
 */
class Elementor_Forms extends Integration {

	/**
	 * Unique slug.
	 */
	public function slug() {
		return 'elementor';
	}

	/**
	 * Display name.
	 */
	public function label() {
		return 'Elementor Forms';
	}

	/**
	 * Whether the form plugin is active.
	 */
	public function is_active() {
		return defined( 'ELEMENTOR_PRO_VERSION' ) || class_exists( '\ElementorPro\Plugin' );
	}

	/**
	 * @return array element_id => [ title, post_id, fields ]
	 */
	private function discover() {
		$cache = get_transient( 'qswp_elementor_forms' );
		if ( is_array( $cache ) ) {
			return $cache;
		}

		global $wpdb;
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery
		$rows = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT pm.post_id, pm.meta_value, p.post_title FROM {$wpdb->postmeta} pm
				 INNER JOIN {$wpdb->posts} p ON p.ID = pm.post_id
				 WHERE pm.meta_key = %s AND pm.meta_value LIKE %s
				 AND p.post_status IN ('publish','private','draft','future') AND p.post_type <> 'revision'",
				'_elementor_data',
				'%' . $wpdb->esc_like( '"widgetType":"form"' ) . '%'
			)
		);

		$forms = array();
		foreach ( (array) $rows as $row ) {
			$elements = json_decode( $row->meta_value, true );
			if ( is_array( $elements ) ) {
				$this->walk( $elements, (int) $row->post_id, $row->post_title, $forms );
			}
		}

		set_transient( 'qswp_elementor_forms', $forms, 10 * MINUTE_IN_SECONDS );
		return $forms;
	}

	/**
	 * Recursively collect form widgets.
	 */
	private function walk( array $elements, $post_id, $post_title, array &$forms ) {
		foreach ( $elements as $el ) {
			if ( isset( $el['widgetType'] ) && 'form' === $el['widgetType'] && ! empty( $el['id'] ) ) {
				$settings = isset( $el['settings'] ) ? $el['settings'] : array();
				$name     = ! empty( $settings['form_name'] ) ? $settings['form_name'] : __( 'New Form', 'quicksheet' );
				$fields   = array();
				foreach ( isset( $settings['form_fields'] ) ? (array) $settings['form_fields'] : array() as $f ) {
					$type = isset( $f['field_type'] ) ? $f['field_type'] : 'text';
					$key  = ! empty( $f['custom_id'] ) ? $f['custom_id'] : ( isset( $f['_id'] ) ? $f['_id'] : '' );
					if ( '' === $key || $this->is_layout_type( $type ) ) {
						continue;
					}
					$fields[] = array(
						'key'   => $key,
						'label' => ! empty( $f['field_label'] ) ? $f['field_label'] : ( ! empty( $f['placeholder'] ) ? $f['placeholder'] : $key ),
						'type'  => $type,
					);
				}
				$forms[ $el['id'] ] = array(
					'title'  => sprintf( '%s — %s', $name, $post_title ),
					'fields' => $fields,
				);
			}
			if ( ! empty( $el['elements'] ) && is_array( $el['elements'] ) ) {
				$this->walk( $el['elements'], $post_id, $post_title, $forms );
			}
		}
	}

	/**
	 * List forms.
	 */
	public function forms() {
		$out = array();
		foreach ( $this->discover() as $id => $form ) {
			$out[] = array(
				'id'    => (string) $id,
				'title' => $form['title'],
			);
		}
		return $out;
	}

	/**
	 * List fields of a form.
	 */
	public function fields( $form_id ) {
		$forms = $this->discover();
		return isset( $forms[ $form_id ] ) ? $forms[ $form_id ]['fields'] : array();
	}

	/**
	 * Register submission hooks.
	 */
	protected function boot() {
		add_action( 'elementor_pro/forms/new_record', array( $this, 'on_submit' ), 10, 2 );
		// Refresh discovery cache when Elementor saves a document.
		add_action( 'elementor/editor/after_save', array( $this, 'flush_cache' ) );
	}

	/**
	 * Clear the discovery cache.
	 */
	public function flush_cache() {
		delete_transient( 'qswp_elementor_forms' );
	}

	/**
	 * @param \ElementorPro\Modules\Forms\Classes\Form_Record $record
	 */
	public function on_submit( $record ) {
		$form_id = (string) $record->get_form_settings( 'id' );
		$values  = array();
		foreach ( (array) $record->get( 'fields' ) as $id => $field ) {
			$values[ $id ] = isset( $field['value'] ) ? $field['value'] : '';
		}

		$meta     = (array) $record->get( 'meta' );
		$page_url = isset( $meta['page_url']['value'] ) ? $meta['page_url']['value'] : '';

		$this->dispatcher->handle(
			$this->slug(),
			$form_id,
			$values,
			array(
				'form_id'    => $form_id,
				'form_title' => (string) $record->get_form_settings( 'form_name' ),
				'page_url'   => $page_url,
			)
		);
	}
}
