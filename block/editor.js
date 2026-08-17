( function ( blocks, blockEditor, components, element, i18n ) {
	'use strict';

	var el = element.createElement;
	var __ = i18n.__;
	var MediaUpload = blockEditor.MediaUpload;
	var MediaUploadCheck = blockEditor.MediaUploadCheck;
	var InspectorControls = blockEditor.InspectorControls;
	var useBlockProps = blockEditor.useBlockProps;
	var Button = components.Button;
	var PanelBody = components.PanelBody;
	var Placeholder = components.Placeholder;
	var RangeControl = components.RangeControl;
	var TextControl = components.TextControl;
	var ToggleControl = components.ToggleControl;

	function SelectPdfButton( props ) {
		return el( MediaUploadCheck, {},
			el( MediaUpload, {
				onSelect: function ( media ) {
					props.setAttributes( {
						attachmentId: media.id || 0,
						url: media.url || '',
						title: media.title || media.filename || ''
					} );
				},
				allowedTypes: [ 'application/pdf' ],
				value: props.attachmentId,
				render: function ( mediaProps ) {
					return el( Button, {
						variant: 'primary',
						onClick: mediaProps.open
					}, props.url ? __( 'Replace PDF', 'wp-pdf-embed' ) : __( 'Select PDF', 'wp-pdf-embed' ) );
				}
			} )
		);
	}

	blocks.registerBlockType( 'wp-pdf-embed/pdf', {
		edit: function ( props ) {
			var attributes = props.attributes;
			var setAttributes = props.setAttributes;
			var blockProps = useBlockProps( { className: 'wp-pdf-embed-editor' } );
			var inspector = el( InspectorControls, {},
				el( PanelBody, { title: __( 'PDF settings', 'wp-pdf-embed' ), initialOpen: true },
					el( TextControl, {
						label: __( 'Document title', 'wp-pdf-embed' ),
						value: attributes.title,
						onChange: function ( value ) { setAttributes( { title: value } ); }
					} ),
					el( TextControl, {
						label: __( 'Width', 'wp-pdf-embed' ),
						help: __( 'Examples: 100%, 800px, 60vw', 'wp-pdf-embed' ),
						value: attributes.width,
						onChange: function ( value ) { setAttributes( { width: value } ); }
					} ),
					el( RangeControl, {
						label: __( 'Height (pixels)', 'wp-pdf-embed' ),
						value: attributes.height,
						min: 300,
						max: 1400,
						step: 50,
						onChange: function ( value ) { setAttributes( { height: value } ); }
					} ),
					el( RangeControl, {
						label: __( 'Initial page', 'wp-pdf-embed' ),
						value: attributes.initialPage,
						min: 1,
						max: 999,
						onChange: function ( value ) { setAttributes( { initialPage: value } ); }
					} ),
					el( ToggleControl, {
						label: __( 'Show toolbar', 'wp-pdf-embed' ),
						checked: attributes.showToolbar,
						onChange: function ( value ) { setAttributes( { showToolbar: value } ); }
					} ),
					el( ToggleControl, {
						label: __( 'Allow download', 'wp-pdf-embed' ),
						checked: attributes.allowDownload,
						onChange: function ( value ) { setAttributes( { allowDownload: value } ); }
					} ),
					el( ToggleControl, {
						label: __( 'Continuous page scrolling', 'wp-pdf-embed' ),
						checked: attributes.continuousScroll,
						onChange: function ( value ) { setAttributes( { continuousScroll: value } ); }
					} ),
					el( ToggleControl, {
						label: __( 'Enable text search', 'wp-pdf-embed' ),
						checked: attributes.showSearch,
						onChange: function ( value ) { setAttributes( { showSearch: value } ); }
					} ),
					el( ToggleControl, {
						label: __( 'Open external links in a new tab', 'wp-pdf-embed' ),
						checked: attributes.openLinksNewTab,
						onChange: function ( value ) { setAttributes( { openLinksNewTab: value } ); }
					} ),
					el( ToggleControl, {
						label: __( 'Track views and downloads', 'wp-pdf-embed' ),
						checked: attributes.trackEvents,
						onChange: function ( value ) { setAttributes( { trackEvents: value } ); }
					} )
				),
				el( PanelBody, { title: __( 'Mobile settings', 'wp-pdf-embed' ), initialOpen: false },
					el( RangeControl, {
						label: __( 'Full-screen prompt threshold', 'wp-pdf-embed' ),
						help: __( 'Show the mobile prompt below this viewer width. Set to 0 to disable.', 'wp-pdf-embed' ),
						value: attributes.mobileWidth,
						min: 0,
						max: 1000,
						step: 50,
						onChange: function ( value ) { setAttributes( { mobileWidth: value } ); }
					} ),
					el( TextControl, {
						label: __( 'Full-screen button text', 'wp-pdf-embed' ),
						value: attributes.mobileText,
						onChange: function ( value ) { setAttributes( { mobileText: value } ); }
					} ),
					el( ToggleControl, {
						label: __( 'Disable pinch zoom inside viewer', 'wp-pdf-embed' ),
						checked: attributes.disableDeviceZoom,
						onChange: function ( value ) { setAttributes( { disableDeviceZoom: value } ); }
					} )
				)
			);

			if ( ! attributes.url ) {
				return el( 'div', blockProps, inspector,
					el( Placeholder, {
						icon: 'pdf',
						label: __( 'PDF Embed', 'wp-pdf-embed' ),
						instructions: __( 'Choose a PDF from the Media Library.', 'wp-pdf-embed' )
					}, el( SelectPdfButton, {
						attachmentId: attributes.attachmentId,
						url: attributes.url,
						setAttributes: setAttributes
					} ) )
				);
			}

			return el( 'div', blockProps, inspector,
				el( 'div', { className: 'wp-pdf-embed-editor__preview', style: { height: Math.min( attributes.height, 700 ) + 'px' } },
					el( 'iframe', {
						src: attributes.url + '#page=' + attributes.initialPage,
						title: attributes.title || __( 'PDF preview', 'wp-pdf-embed' )
					} )
				),
				el( 'div', { className: 'wp-pdf-embed-editor__actions' },
					el( SelectPdfButton, {
						attachmentId: attributes.attachmentId,
						url: attributes.url,
						setAttributes: setAttributes
					} ),
					el( Button, {
						variant: 'tertiary',
						isDestructive: true,
						onClick: function () { setAttributes( { attachmentId: 0, url: '', title: '' } ); }
					}, __( 'Remove PDF', 'wp-pdf-embed' ) )
				)
			);
		},
		save: function () {
			return null;
		}
	} );
} )( window.wp.blocks, window.wp.blockEditor, window.wp.components, window.wp.element, window.wp.i18n );
