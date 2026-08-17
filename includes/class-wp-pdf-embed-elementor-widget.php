<?php
/**
 * Elementor integration.
 *
 * @package WP_PDF_Embed
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class WP_PDF_Embed_Elementor_Widget extends \Elementor\Widget_Base {
	public function get_name() {
		return 'wp-pdf-embed';
	}

	public function get_title() {
		return __( 'PDF Embed', 'wp-pdf-embed' );
	}

	public function get_icon() {
		return 'eicon-document-file';
	}

	public function get_categories() {
		return array( 'general' );
	}

	protected function register_controls() {
		$this->start_controls_section( 'document', array( 'label' => __( 'PDF document', 'wp-pdf-embed' ) ) );
		$this->add_control(
			'pdf',
			array(
				'label'       => __( 'PDF', 'wp-pdf-embed' ),
				'type'        => \Elementor\Controls_Manager::MEDIA,
				'media_types' => array( 'application/pdf' ),
			)
		);
		$this->add_control( 'height', array( 'label' => __( 'Height', 'wp-pdf-embed' ), 'type' => \Elementor\Controls_Manager::NUMBER, 'default' => 700, 'min' => 300, 'max' => 2000 ) );
		$this->add_control( 'page', array( 'label' => __( 'Initial page', 'wp-pdf-embed' ), 'type' => \Elementor\Controls_Manager::NUMBER, 'default' => 1, 'min' => 1 ) );
		$this->add_control( 'continuous', array( 'label' => __( 'Continuous scrolling', 'wp-pdf-embed' ), 'type' => \Elementor\Controls_Manager::SWITCHER, 'default' => 'yes' ) );
		$this->add_control( 'search', array( 'label' => __( 'Search', 'wp-pdf-embed' ), 'type' => \Elementor\Controls_Manager::SWITCHER, 'default' => 'yes' ) );
		$this->add_control( 'download', array( 'label' => __( 'Download button', 'wp-pdf-embed' ), 'type' => \Elementor\Controls_Manager::SWITCHER, 'default' => 'yes' ) );
		$this->add_control( 'track', array( 'label' => __( 'Track views and downloads', 'wp-pdf-embed' ), 'type' => \Elementor\Controls_Manager::SWITCHER, 'default' => '' ) );
		$this->end_controls_section();
	}

	protected function render() {
		$settings = $this->get_settings_for_display();
		$pdf      = isset( $settings['pdf'] ) ? $settings['pdf'] : array();
		$id       = isset( $pdf['id'] ) ? absint( $pdf['id'] ) : 0;
		if ( ! $id ) {
			if ( \Elementor\Plugin::$instance->editor->is_edit_mode() ) {
				echo '<p>' . esc_html__( 'Choose a PDF in the widget settings.', 'wp-pdf-embed' ) . '</p>';
			}
			return;
		}

		echo do_shortcode(
			sprintf(
				'[wp_pdf_embed id="%1$d" height="%2$d" page="%3$d" continuous="%4$s" search="%5$s" download="%6$s" track="%7$s"]',
				$id,
				absint( $settings['height'] ),
				absint( $settings['page'] ),
				'yes' === $settings['continuous'] ? 'true' : 'false',
				'yes' === $settings['search'] ? 'true' : 'false',
				'yes' === $settings['download'] ? 'true' : 'false',
				'yes' === $settings['track'] ? 'true' : 'false'
			)
		);
	}
}
