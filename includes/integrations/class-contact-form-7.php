<?php
/**
 * Contact Form 7 integration.
 *
 * @package QuickSheetWP
 */

namespace QuickSheetWP\Integrations;

defined( 'ABSPATH' ) || exit;

/**
 * Contact Form 7.
 */
class Contact_Form_7 extends Integration {

	/**
	 * Unique slug.
	 */
	public function slug() {
		return 'cf7';
	}

	/**
	 * Display name.
	 */
	public function label() {
		return 'Contact Form 7';
	}

	/**
	 * WordPress.org slug used for the install link.
	 */
	public function plugin_slug() {
		return 'contact-form-7';
	}

	/**
	 * Whether the form plugin is active.
	 */
	public function is_active() {
		return defined( 'WPCF7_VERSION' ) && class_exists( 'WPCF7_ContactForm' );
	}

	/**
	 * List forms.
	 */
	public function forms() {
		$posts = get_posts(
			array(
				'post_type'      => 'wpcf7_contact_form',
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
	 * List fields of a form.
	 */
	public function fields( $form_id ) {
		$form = \WPCF7_ContactForm::get_instance( (int) $form_id );
		if ( ! $form ) {
			return array();
		}
		$fields = array();
		foreach ( $form->scan_form_tags() as $tag ) {
			if ( empty( $tag->name ) || $this->is_layout_type( $tag->basetype ) || in_array( $tag->basetype, array( 'quiz' ), true ) ) {
				continue;
			}
			$fields[ $tag->name ] = array(
				'key'   => $tag->name,
				'label' => $tag->name,
				'type'  => $tag->basetype,
			);
		}
		return array_values( $fields );
	}

	/**
	 * Register submission hooks.
	 */
	protected function boot() {
		// Fire whether or not the notification mail succeeded – a lead is a lead.
		add_action( 'wpcf7_mail_sent', array( $this, 'on_submit' ) );
		add_action( 'wpcf7_mail_failed', array( $this, 'on_submit' ) );
	}

	/**
	 * @param \WPCF7_ContactForm $form
	 */
	public function on_submit( $form ) {
		$submission = \WPCF7_Submission::get_instance();
		if ( ! $submission ) {
			return;
		}
		$data = $submission->get_posted_data();

		// Uploaded files: store file names.
		foreach ( (array) $submission->uploaded_files() as $name => $paths ) {
			$data[ $name ] = implode( ', ', array_map( 'wp_basename', (array) $paths ) );
		}

		$this->dispatcher->handle(
			$this->slug(),
			(string) $form->id(),
			(array) $data,
			array(
				'form_id'    => $form->id(),
				'form_title' => $form->title(),
				'page_url'   => $submission->get_meta( 'url' ),
			)
		);
	}
}
