<?php
/**
 * Base class for form-builder integrations.
 *
 * @package QuickSheetWP
 */

namespace QuickSheetWP\Integrations;

use QuickSheetWP\Dispatcher;

defined( 'ABSPATH' ) || exit;

/**
 * Integration.
 */
abstract class Integration {

	/** @var Dispatcher */
	protected $dispatcher;

	/**
	 * Constructor.
	 */
	public function __construct( Dispatcher $dispatcher ) {
		$this->dispatcher = $dispatcher;
	}

	/** Unique key stored with feeds. */
	abstract public function slug();

	/** Human label. */
	abstract public function label();

	/** Whether the form plugin is installed & active. */
	abstract public function is_active();

	/** @return array[] [ [ 'id' => string, 'title' => string ] ] */
	abstract public function forms();

	/** @return array[] [ [ 'key' => string, 'label' => string, 'type' => string ] ] */
	abstract public function fields( $form_id );

	/** Register submission hooks. */
	abstract protected function boot();

	/** wordpress.org slug used for the "Install" link. */
	public function plugin_slug() {
		return '';
	}

	/**
	 * Boot when the form plugin is active.
	 */
	public function maybe_boot() {
		if ( $this->is_active() ) {
			$this->boot();
		}
	}

	/**
	 * Data for the admin app.
	 */
	public function to_array() {
		return array(
			'slug'        => $this->slug(),
			'label'       => $this->label(),
			'active'      => $this->is_active(),
			'install_url' => $this->plugin_slug() ? admin_url( 'plugin-install.php?s=' . rawurlencode( $this->plugin_slug() ) . '&tab=search&type=term' ) : '',
		);
	}

	/** Field types that never carry user data. */
	protected function is_layout_type( $type ) {
		return in_array( $type, array( 'submit', 'html', 'divider', 'pagebreak', 'step', 'section', 'recaptcha', 'captcha', 'honeypot', 'acceptance_text', 'content', 'entry-preview', 'turnstile' ), true );
	}
}
