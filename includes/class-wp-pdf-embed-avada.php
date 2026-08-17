<?php
/**
 * Avada Builder integration.
 *
 * @package WP_PDF_Embed
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class WP_PDF_Embed_Avada {
	/** @var WP_PDF_Embed_Avada|null */
	private static $instance = null;

	/** @var bool */
	private $registered = false;

	/** @var bool */
	private $assets_enqueued = false;

	/**
	 * Return the integration instance.
	 *
	 * @return WP_PDF_Embed_Avada
	 */
	public static function instance() {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}

		return self::$instance;
	}

	private function __construct() {
		add_shortcode( 'wp_pdf_embed_avada', array( $this, 'render' ) );
		add_action( 'fusion_builder_before_init', array( $this, 'register_element' ) );
		add_action( 'fusion_builder_admin_scripts_hook', array( $this, 'enqueue_builder_assets' ) );
		add_action( 'fusion_builder_enqueue_live_scripts', array( $this, 'enqueue_builder_assets' ) );
	}

	/**
	 * Register PDF Embed in Avada Builder's Design Elements list.
	 *
	 * @return void
	 */
	public function register_element() {
		if ( $this->registered || ! function_exists( 'fusion_builder_map' ) ) {
			return;
		}

		$this->registered = true;
		$boolean_options  = array(
			'true'  => esc_attr__( 'Yes', 'wp-pdf-embed' ),
			'false' => esc_attr__( 'No', 'wp-pdf-embed' ),
		);

		fusion_builder_map(
			array(
				'name'            => esc_attr__( 'PDF Embed', 'wp-pdf-embed' ),
				'shortcode'       => 'wp_pdf_embed_avada',
				'icon'            => 'fusiona-file',
				'description'     => esc_attr__( 'Display a PDF from the WordPress Media Library.', 'wp-pdf-embed' ),
				'allow_generator' => true,
				'params'          => array(
					array(
						'type'         => 'upload',
						'heading'      => esc_attr__( 'PDF document', 'wp-pdf-embed' ),
						'description'  => esc_attr__( 'Choose or upload a PDF from the Media Library.', 'wp-pdf-embed' ),
						'param_name'   => 'pdf_url',
						'value'        => '',
						'dynamic_data' => true,
					),
					array(
						'type'        => 'textfield',
						'heading'     => esc_attr__( 'Document title', 'wp-pdf-embed' ),
						'param_name'  => 'title',
						'value'       => '',
					),
					array(
						'type'        => 'textfield',
						'heading'     => esc_attr__( 'Width', 'wp-pdf-embed' ),
						'description' => esc_attr__( 'Use a CSS dimension such as 100% or 800px.', 'wp-pdf-embed' ),
						'param_name'  => 'width',
						'value'       => '100%',
						'group'       => esc_attr__( 'Layout', 'wp-pdf-embed' ),
					),
					array(
						'type'        => 'textfield',
						'heading'     => esc_attr__( 'Height in pixels', 'wp-pdf-embed' ),
						'param_name'  => 'height',
						'value'       => '700',
						'group'       => esc_attr__( 'Layout', 'wp-pdf-embed' ),
					),
					array(
						'type'        => 'textfield',
						'heading'     => esc_attr__( 'Initial page', 'wp-pdf-embed' ),
						'param_name'  => 'page',
						'value'       => '1',
						'group'       => esc_attr__( 'Viewer', 'wp-pdf-embed' ),
					),
					$this->boolean_parameter( 'toolbar', esc_attr__( 'Show toolbar', 'wp-pdf-embed' ), 'true', $boolean_options, 'Viewer' ),
					$this->boolean_parameter( 'download', esc_attr__( 'Show download button', 'wp-pdf-embed' ), 'true', $boolean_options, 'Viewer' ),
					$this->boolean_parameter( 'continuous', esc_attr__( 'Continuous page scrolling', 'wp-pdf-embed' ), 'true', $boolean_options, 'Viewer' ),
					$this->boolean_parameter( 'search', esc_attr__( 'Enable text search', 'wp-pdf-embed' ), 'true', $boolean_options, 'Viewer' ),
					$this->boolean_parameter( 'newwindow', esc_attr__( 'Open external links in a new tab', 'wp-pdf-embed' ), 'true', $boolean_options, 'Viewer' ),
					$this->boolean_parameter( 'track', esc_attr__( 'Track views and downloads', 'wp-pdf-embed' ), 'false', $boolean_options, 'Activity' ),
					array(
						'type'        => 'textfield',
						'heading'     => esc_attr__( 'Full-screen prompt threshold', 'wp-pdf-embed' ),
						'description' => esc_attr__( 'Show the mobile prompt below this width. Use 0 to disable it.', 'wp-pdf-embed' ),
						'param_name'  => 'mobilewidth',
						'value'       => '500',
						'group'       => esc_attr__( 'Mobile', 'wp-pdf-embed' ),
					),
					array(
						'type'        => 'textfield',
						'heading'     => esc_attr__( 'Full-screen button text', 'wp-pdf-embed' ),
						'param_name'  => 'mobiletext',
						'value'       => esc_attr__( 'View PDF full screen', 'wp-pdf-embed' ),
						'group'       => esc_attr__( 'Mobile', 'wp-pdf-embed' ),
					),
					$this->boolean_parameter( 'disablezoom', esc_attr__( 'Disable pinch zoom inside viewer', 'wp-pdf-embed' ), 'false', $boolean_options, 'Mobile' ),
					array(
						'type'        => 'textfield',
						'heading'     => esc_attr__( 'CSS class', 'wp-pdf-embed' ),
						'param_name'  => 'class',
						'value'       => '',
						'group'       => esc_attr__( 'Extras', 'wp-pdf-embed' ),
					),
					array(
						'type'        => 'textfield',
						'heading'     => esc_attr__( 'CSS ID', 'wp-pdf-embed' ),
						'param_name'  => 'element_id',
						'value'       => '',
						'group'       => esc_attr__( 'Extras', 'wp-pdf-embed' ),
					),
				),
			)
		);
	}

	/**
	 * Replace Avada's image-only upload preview with a PDF document tile.
	 *
	 * @return void
	 */
	public function enqueue_builder_assets() {
		if ( $this->assets_enqueued ) {
			return;
		}

		$this->assets_enqueued = true;
		wp_enqueue_script(
			'wp-pdf-embed-avada-builder',
			WP_PDF_EMBED_URL . 'assets/js/avada-builder.js',
			array(),
			WP_PDF_EMBED_VERSION,
			true
		);
		wp_localize_script(
			'wp-pdf-embed-avada-builder',
			'wpPdfEmbedAvada',
			array(
				'previewUrl' => WP_PDF_EMBED_URL . 'assets/images/pdf-preview.svg',
				'previewAlt' => __( 'Selected PDF document', 'wp-pdf-embed' ),
			)
		);
	}

	/**
	 * Render an Avada element through the plugin's shared shortcode path.
	 *
	 * @param array|string $atts Avada shortcode attributes.
	 * @return string
	 */
	public function render( $atts ) {
		$atts = shortcode_atts(
			array(
				'pdf_url'    => '',
				'title'      => '',
				'width'      => '100%',
				'height'     => 700,
				'page'       => 1,
				'toolbar'    => 'true',
				'download'   => 'true',
				'continuous' => 'true',
				'search'     => 'true',
				'newwindow'  => 'true',
				'track'      => 'false',
				'mobilewidth' => 500,
				'mobiletext'  => __( 'View PDF full screen', 'wp-pdf-embed' ),
				'disablezoom' => 'false',
				'class'       => '',
				'element_id'  => '',
			),
			$atts,
			'wp_pdf_embed_avada'
		);

		$pdf_url       = esc_url_raw( $atts['pdf_url'] );
		$attachment_id = $pdf_url ? attachment_url_to_postid( $pdf_url ) : 0;
		if ( ! $pdf_url ) {
			return '';
		}

		$viewer = WP_PDF_Embed::instance()->shortcode(
			array(
				'id'          => $attachment_id,
				'url'         => $pdf_url,
				'title'       => $atts['title'],
				'width'       => $atts['width'],
				'height'      => $atts['height'],
				'page'        => $atts['page'],
				'toolbar'     => $atts['toolbar'],
				'download'    => $atts['download'],
				'continuous'  => $atts['continuous'],
				'search'      => $atts['search'],
				'newwindow'   => $atts['newwindow'],
				'track'       => $atts['track'],
				'mobilewidth' => $atts['mobilewidth'],
				'mobiletext'  => $atts['mobiletext'],
				'disablezoom' => $atts['disablezoom'],
			)
		);

		$custom_classes = preg_split( '/\s+/', trim( (string) $atts['class'] ) );
		$custom_classes = array_filter( array_map( 'sanitize_html_class', $custom_classes ) );
		$classes        = trim( 'fusion-wp-pdf-embed ' . implode( ' ', $custom_classes ) );
		$id      = sanitize_html_class( $atts['element_id'] );

		return sprintf(
			'<div class="%1$s"%2$s>%3$s</div>',
			esc_attr( $classes ),
			$id ? ' id="' . esc_attr( $id ) . '"' : '',
			$viewer
		);
	}

	/**
	 * Create a consistent Avada yes/no parameter.
	 *
	 * @param string $name    Parameter name.
	 * @param string $heading Field heading.
	 * @param string $default Default value.
	 * @param array  $options Available values.
	 * @param string $group   Field group.
	 * @return array
	 */
	private function boolean_parameter( $name, $heading, $default, $options, $group ) {
		$group_labels = array(
			'Viewer'   => esc_attr__( 'Viewer', 'wp-pdf-embed' ),
			'Activity' => esc_attr__( 'Activity', 'wp-pdf-embed' ),
			'Mobile'   => esc_attr__( 'Mobile', 'wp-pdf-embed' ),
		);

		return array(
			'type'       => 'radio_button_set',
			'heading'    => $heading,
			'param_name' => $name,
			'value'      => $options,
			'default'    => $default,
			'group'      => isset( $group_labels[ $group ] ) ? $group_labels[ $group ] : esc_attr( $group ),
		);
	}
}
