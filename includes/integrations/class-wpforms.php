<?php
/**
 * WPForms (Lite & Pro) integration.
 *
 * @package QuickSheetWP
 */

namespace QuickSheetWP\Integrations;

defined( 'ABSPATH' ) || exit;

/**
 * Wpforms.
 */
class Wpforms extends Integration {

	/**
	 * Unique slug.
	 */
	public function slug() {
		return 'wpforms';
	}

	/**
	 * Display name.
	 */
	public function label() {
		return 'WPForms';
	}

	/**
	 * WordPress.org slug used for the install link.
	 */
	public function plugin_slug() {
		return 'wpforms-lite';
	}

	/**
	 * Whether the form plugin is active.
	 */
	public function is_active() {
		return function_exists( 'wpforms' );
	}

	/**
	 * List forms.
	 */
	public function forms() {
		$posts = get_posts(
			array(
				'post_type'      => 'wpforms',
				'posts_per_page' => -1,
				'post_status'    => 'publish',
				'orderby'        => 'title',
				'order'          => 'ASC',
			)
		);
		return array_map(
			static function ( $p ) {
				return array(
					'id'    => (string) $p->ID,
					'title' => $p->post_title,
				);
			},
			$posts
		);
	}

	/**
	 * Decoded form configuration.
	 */
	private function form_data( $form_id ) {
		$post = get_post( (int) $form_id );
		if ( ! $post || 'wpforms' !== $post->post_type ) {
			return array();
		}
		$data = function_exists( 'wpforms_decode' ) ? wpforms_decode( $post->post_content ) : json_decode( $post->post_content, true );
		return is_array( $data ) ? $data : array();
	}

	/**
	 * List fields of a form.
	 */
	public function fields( $form_id ) {
		$data   = $this->form_data( $form_id );
		$fields = array();
		foreach ( isset( $data['fields'] ) ? (array) $data['fields'] : array() as $field ) {
			$type = isset( $field['type'] ) ? $field['type'] : '';
			if ( ! isset( $field['id'] ) || $this->is_layout_type( $type ) ) {
				continue;
			}
			$label    = ! empty( $field['label'] ) ? $field['label'] : ucfirst( $type ) . ' #' . $field['id'];
			$fields[] = array(
				'key'   => (string) $field['id'],
				'label' => $label,
				'type'  => $type,
			);

			// Name field: expose its parts too.
			if ( 'name' === $type && ( empty( $field['format'] ) || 'simple' !== $field['format'] ) ) {
				foreach ( array(
					'first' => __( 'First', 'quicksheet' ),
					'last'  => __( 'Last', 'quicksheet' ),
				) as $part => $part_label ) {
					$fields[] = array(
						'key'   => $field['id'] . '.' . $part,
						'label' => $label . ' (' . $part_label . ')',
						'type'  => 'text',
					);
				}
			}
		}
		return $fields;
	}

	/**
	 * Register submission hooks.
	 */
	protected function boot() {
		add_action( 'wpforms_process_complete', array( $this, 'on_submit' ), 10, 4 );
	}

	/**
	 * Handle a submission.
	 */
	public function on_submit( $fields, $entry, $form_data, $entry_id ) {
		$values = array();
		foreach ( (array) $fields as $id => $field ) {
			$values[ (string) $id ] = isset( $field['value'] ) ? $field['value'] : '';
			if ( isset( $field['type'] ) && 'name' === $field['type'] ) {
				$values[ $id . '.first' ] = isset( $field['first'] ) ? $field['first'] : '';
				$values[ $id . '.last' ]  = isset( $field['last'] ) ? $field['last'] : '';
			}
		}

		$form_id = isset( $form_data['id'] ) ? (string) $form_data['id'] : '';
		$this->dispatcher->handle(
			$this->slug(),
			$form_id,
			$values,
			array(
				'form_id'    => $form_id,
				'form_title' => isset( $form_data['settings']['form_title'] ) ? $form_data['settings']['form_title'] : '',
				'entry_id'   => $entry_id,
			)
		);
	}
}
