<?php
/**
 * Main plugin class.
 *
 * @package WP_PDF_Embed
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class WP_PDF_Embed {
	/** @var WP_PDF_Embed|null */
	private static $instance = null;

	/**
	 * Return the plugin instance.
	 *
	 * @return WP_PDF_Embed
	 */
	public static function instance() {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}

		return self::$instance;
	}

	private function __construct() {
		add_action( 'init', array( $this, 'register' ) );
		add_action( 'media_buttons', array( $this, 'classic_editor_button' ), 20 );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_classic_editor_assets' ) );
		add_action( 'wp_ajax_wp_pdf_embed_track', array( $this, 'track_event' ) );
		add_action( 'wp_ajax_nopriv_wp_pdf_embed_track', array( $this, 'track_event' ) );
		add_action( 'elementor/widgets/register', array( $this, 'register_elementor_widget' ) );
		add_filter( 'attachment_fields_to_edit', array( $this, 'attachment_stats' ), 10, 2 );
		add_shortcode( 'wp_pdf_embed', array( $this, 'shortcode' ) );
	}

	/**
	 * Register scripts, styles, and the dynamic block.
	 *
	 * @return void
	 */
	public function register() {
		wp_register_script(
			'wp-pdf-embed-pdfjs',
			WP_PDF_EMBED_URL . 'assets/vendor/pdf.min.js',
			array(),
			'3.11.174',
			true
		);

		wp_add_inline_script(
			'wp-pdf-embed-pdfjs',
			'window.pdfjsLib.GlobalWorkerOptions.workerSrc = ' . wp_json_encode( WP_PDF_EMBED_URL . 'assets/vendor/pdf.worker.min.js' ) . ';',
			'after'
		);

		wp_register_script(
			'wp-pdf-embed-viewer',
			WP_PDF_EMBED_URL . 'assets/js/viewer.js',
			array( 'wp-pdf-embed-pdfjs' ),
			WP_PDF_EMBED_VERSION,
			true
		);

		wp_localize_script(
			'wp-pdf-embed-viewer',
			'wpPdfEmbedL10n',
			array(
				'loading'         => __( 'Loading PDF…', 'wp-pdf-embed' ),
				'loadError'       => __( 'The PDF could not be loaded.', 'wp-pdf-embed' ),
				'passwordPrompt'  => __( 'Enter the password for this PDF:', 'wp-pdf-embed' ),
				'passwordError'   => __( 'A password is required to open this PDF.', 'wp-pdf-embed' ),
				'previousPage'    => __( 'Previous page', 'wp-pdf-embed' ),
				'nextPage'        => __( 'Next page', 'wp-pdf-embed' ),
				'zoomOut'         => __( 'Zoom out', 'wp-pdf-embed' ),
				'zoomIn'          => __( 'Zoom in', 'wp-pdf-embed' ),
				'download'        => __( 'Download PDF', 'wp-pdf-embed' ),
				'open'            => __( 'Open PDF in a new tab', 'wp-pdf-embed' ),
				'page'            => __( 'Page', 'wp-pdf-embed' ),
				'of'              => __( 'of', 'wp-pdf-embed' ),
				'search'          => __( 'Search document', 'wp-pdf-embed' ),
				'searchPlaceholder' => __( 'Search in PDF…', 'wp-pdf-embed' ),
				'nextMatch'       => __( 'Next match', 'wp-pdf-embed' ),
				'previousMatch'   => __( 'Previous match', 'wp-pdf-embed' ),
				'noMatches'       => __( 'No matches found', 'wp-pdf-embed' ),
				'match'           => __( 'match', 'wp-pdf-embed' ),
				'matches'         => __( 'matches', 'wp-pdf-embed' ),
				'fullscreen'      => __( 'Full screen', 'wp-pdf-embed' ),
				'exitFullscreen'  => __( 'Exit full screen', 'wp-pdf-embed' ),
				'ajaxUrl'         => admin_url( 'admin-ajax.php' ),
			)
		);

		wp_register_style(
			'wp-pdf-embed-viewer',
			WP_PDF_EMBED_URL . 'assets/css/viewer.css',
			array(),
			WP_PDF_EMBED_VERSION
		);

		register_block_type(
			WP_PDF_EMBED_DIR . 'block',
			array( 'render_callback' => array( $this, 'render_block' ) )
		);
	}

	/**
	 * Render the PDF block.
	 *
	 * @param array $attributes Block attributes.
	 * @return string
	 */
	public function render_block( $attributes ) {
		return $this->render_viewer( $attributes, true );
	}

	/**
	 * Render the shortcode.
	 *
	 * @param array|string $atts Shortcode attributes.
	 * @return string
	 */
	public function shortcode( $atts ) {
		$atts = shortcode_atts(
			array(
				'id'             => 0,
				'url'            => '',
				'title'          => '',
				'width'          => '100%',
				'height'         => 700,
				'page'           => 1,
				'toolbar'        => 'true',
				'download'       => 'true',
				'continuous'     => 'true',
				'search'         => 'true',
				'newwindow'      => 'true',
				'track'          => 'false',
				'mobilewidth'    => 500,
				'mobiletext'     => __( 'View PDF full screen', 'wp-pdf-embed' ),
				'disablezoom'    => 'false',
			),
			$atts,
			'wp_pdf_embed'
		);

		$attachment_id = absint( $atts['id'] );
		if ( $attachment_id ) {
			$url = wp_get_attachment_url( $attachment_id );
			if ( $url ) {
				$atts['url'] = $url;
			}
			if ( empty( $atts['title'] ) ) {
				$atts['title'] = get_the_title( $attachment_id );
			}
		}

		return $this->render_viewer(
			array(
				'url'           => $atts['url'],
				'title'         => $atts['title'],
				'width'         => $atts['width'],
				'height'        => $atts['height'],
				'initialPage'   => absint( $atts['page'] ),
				'showToolbar'   => $this->to_bool( $atts['toolbar'] ),
				'allowDownload' => $this->to_bool( $atts['download'] ),
				'continuousScroll' => $this->to_bool( $atts['continuous'] ),
				'showSearch'       => $this->to_bool( $atts['search'] ),
				'openLinksNewTab'  => $this->to_bool( $atts['newwindow'] ),
				'trackEvents'      => $this->to_bool( $atts['track'] ),
				'mobileWidth'      => absint( $atts['mobilewidth'] ),
				'mobileText'       => sanitize_text_field( $atts['mobiletext'] ),
				'disableDeviceZoom' => $this->to_bool( $atts['disablezoom'] ),
				'attachmentId'     => $attachment_id,
			)
		);
	}

	/**
	 * Build a viewer instance shared by blocks and shortcodes.
	 *
	 * @param array $attributes Viewer attributes.
	 * @param bool  $is_block   Whether block wrapper attributes should be applied.
	 * @return string
	 */
	private function render_viewer( $attributes, $is_block = false ) {
		$attachment_id = absint( $attributes['attachmentId'] ?? 0 );
		if ( $attachment_id ) {
			if ( 'application/pdf' !== get_post_mime_type( $attachment_id ) ) {
				return '';
			}
			$attributes['url'] = wp_get_attachment_url( $attachment_id );
		}

		$url = isset( $attributes['url'] ) ? esc_url_raw( $attributes['url'] ) : '';
		if ( empty( $url ) ) {
			return '';
		}

		wp_enqueue_script( 'wp-pdf-embed-viewer' );
		wp_enqueue_style( 'wp-pdf-embed-viewer' );

		$title          = isset( $attributes['title'] ) ? sanitize_text_field( $attributes['title'] ) : '';
		$width          = $this->sanitize_dimension( $attributes['width'] ?? '100%', '100%' );
		$height         = $this->sanitize_height( $attributes['height'] ?? 700 );
		$initial_page   = max( 1, absint( $attributes['initialPage'] ?? 1 ) );
		$show_toolbar   = ! isset( $attributes['showToolbar'] ) || $this->to_bool( $attributes['showToolbar'] );
		$allow_download = ! isset( $attributes['allowDownload'] ) || $this->to_bool( $attributes['allowDownload'] );
		$continuous     = ! isset( $attributes['continuousScroll'] ) || $this->to_bool( $attributes['continuousScroll'] );
		$show_search    = ! isset( $attributes['showSearch'] ) || $this->to_bool( $attributes['showSearch'] );
		$new_window     = ! isset( $attributes['openLinksNewTab'] ) || $this->to_bool( $attributes['openLinksNewTab'] );
		$track_events   = isset( $attributes['trackEvents'] ) && $this->to_bool( $attributes['trackEvents'] );
		$mobile_width   = min( 1000, absint( $attributes['mobileWidth'] ?? 500 ) );
		$mobile_text    = sanitize_text_field( $attributes['mobileText'] ?? __( 'View PDF full screen', 'wp-pdf-embed' ) );
		$disable_zoom   = isset( $attributes['disableDeviceZoom'] ) && $this->to_bool( $attributes['disableDeviceZoom'] );
		$label          = $title ? sprintf( __( 'PDF viewer: %s', 'wp-pdf-embed' ), $title ) : __( 'PDF viewer', 'wp-pdf-embed' );

		$wrapper_values = array(
			'class'         => 'wp-pdf-embed',
			'style'         => sprintf( 'width:%s;height:%s', $width, $height ),
			'data-url'      => $url,
			'data-title'    => $title,
			'data-page'     => (string) $initial_page,
			'data-toolbar'  => $show_toolbar ? 'true' : 'false',
			'data-download' => $allow_download ? 'true' : 'false',
			'data-continuous' => $continuous ? 'true' : 'false',
			'data-search'     => $show_search ? 'true' : 'false',
			'data-new-window' => $new_window ? 'true' : 'false',
			'data-track'      => $track_events ? 'true' : 'false',
			'data-attachment-id' => (string) $attachment_id,
			'data-mobile-width'  => (string) $mobile_width,
			'data-mobile-text'   => $mobile_text,
			'data-disable-zoom'  => $disable_zoom ? 'true' : 'false',
			'role'          => 'region',
			'aria-label'    => $label,
		);

		if ( $is_block ) {
			$wrapper_attributes = get_block_wrapper_attributes( $wrapper_values );
		} else {
			$wrapper_attributes = '';
			foreach ( $wrapper_values as $name => $value ) {
				$wrapper_attributes .= sprintf( ' %s="%s"', esc_attr( $name ), esc_attr( $value ) );
			}
		}

		return sprintf(
			'<div %1$s><div class="wp-pdf-embed__status" role="status">%2$s</div></div>',
			$wrapper_attributes,
			esc_html__( 'Loading PDF…', 'wp-pdf-embed' )
		);
	}

	/**
	 * Record a public view or download for a local PDF attachment.
	 *
	 * Counts are informational analytics, not security or billing data.
	 *
	 * @return void
	 */
	public function track_event() {
		$attachment_id = isset( $_POST['attachment_id'] ) ? absint( $_POST['attachment_id'] ) : 0;
		$event         = isset( $_POST['event'] ) ? sanitize_key( wp_unslash( $_POST['event'] ) ) : '';

		if ( ! $attachment_id || 'application/pdf' !== get_post_mime_type( $attachment_id ) || ! in_array( $event, array( 'view', 'download' ), true ) ) {
			wp_send_json_error( array( 'message' => __( 'Invalid PDF tracking event.', 'wp-pdf-embed' ) ), 400 );
		}

		$meta_key = 'view' === $event ? '_wp_pdf_embed_views' : '_wp_pdf_embed_downloads';
		$count    = absint( get_post_meta( $attachment_id, $meta_key, true ) );
		update_post_meta( $attachment_id, $meta_key, $count + 1 );
		wp_send_json_success( array( 'count' => $count + 1 ) );
	}

	/**
	 * Display PDF activity totals in Media Library attachment details.
	 *
	 * @param array   $fields Attachment fields.
	 * @param WP_Post $post   Attachment post.
	 * @return array
	 */
	public function attachment_stats( $fields, $post ) {
		if ( 'application/pdf' !== get_post_mime_type( $post ) ) {
			return $fields;
		}

		$fields['wp_pdf_embed_stats'] = array(
			'label' => __( 'PDF Embed activity', 'wp-pdf-embed' ),
			'input' => 'html',
			'html'  => sprintf(
				'<p>%1$s: <strong>%2$d</strong><br>%3$s: <strong>%4$d</strong></p>',
				esc_html__( 'Views', 'wp-pdf-embed' ),
				absint( get_post_meta( $post->ID, '_wp_pdf_embed_views', true ) ),
				esc_html__( 'Downloads', 'wp-pdf-embed' ),
				absint( get_post_meta( $post->ID, '_wp_pdf_embed_downloads', true ) )
			),
		);

		return $fields;
	}

	/**
	 * Register the optional Elementor widget when Elementor is active.
	 *
	 * @param object $widgets_manager Elementor widget manager.
	 * @return void
	 */
	public function register_elementor_widget( $widgets_manager ) {
		if ( ! class_exists( '\\Elementor\\Widget_Base' ) ) {
			return;
		}

		require_once WP_PDF_EMBED_DIR . 'includes/class-wp-pdf-embed-elementor-widget.php';
		$widgets_manager->register( new WP_PDF_Embed_Elementor_Widget() );
	}

	/**
	 * Add an insert button beside Add Media in the classic editor.
	 *
	 * @return void
	 */
	public function classic_editor_button() {
		if ( ! current_user_can( 'upload_files' ) ) {
			return;
		}

		printf(
			'<button type="button" class="button wp-pdf-embed-insert"><span class="dashicons dashicons-pdf" aria-hidden="true"></span> %s</button>',
			esc_html__( 'Add PDF Embed', 'wp-pdf-embed' )
		);
	}

	/**
	 * Load the media modal integration only on post editing screens.
	 *
	 * @param string $hook_suffix Current admin page.
	 * @return void
	 */
	public function enqueue_classic_editor_assets( $hook_suffix ) {
		if ( ! in_array( $hook_suffix, array( 'post.php', 'post-new.php' ), true ) || ! current_user_can( 'upload_files' ) ) {
			return;
		}

		wp_enqueue_media();
		wp_enqueue_script(
			'wp-pdf-embed-classic-editor',
			WP_PDF_EMBED_URL . 'assets/js/classic-editor.js',
			array( 'jquery', 'media-editor' ),
			WP_PDF_EMBED_VERSION,
			true
		);
		wp_localize_script(
			'wp-pdf-embed-classic-editor',
			'wpPdfEmbedEditorL10n',
			array(
				'title'  => __( 'Select a PDF', 'wp-pdf-embed' ),
				'button' => __( 'Embed PDF', 'wp-pdf-embed' ),
			)
		);
	}

	/**
	 * Sanitize a CSS dimension without allowing arbitrary style injection.
	 *
	 * @param mixed  $value    Candidate value.
	 * @param string $fallback Fallback value.
	 * @return string
	 */
	private function sanitize_dimension( $value, $fallback ) {
		$value = trim( (string) $value );
		if ( preg_match( '/^(?:\d+(?:\.\d+)?)(?:px|%|rem|em|vw|vh)$/', $value ) ) {
			return $value;
		}
		if ( is_numeric( $value ) ) {
			return max( 1, (float) $value ) . 'px';
		}

		return $fallback;
	}

	/**
	 * Normalize viewer height and keep it usable.
	 *
	 * @param mixed $value Candidate height.
	 * @return string
	 */
	private function sanitize_height( $value ) {
		if ( is_numeric( $value ) ) {
			return max( 200, min( 2000, absint( $value ) ) ) . 'px';
		}

		return $this->sanitize_dimension( $value, '700px' );
	}

	/**
	 * Interpret common shortcode boolean values.
	 *
	 * @param mixed $value Candidate value.
	 * @return bool
	 */
	private function to_bool( $value ) {
		return filter_var( $value, FILTER_VALIDATE_BOOLEAN );
	}
}
