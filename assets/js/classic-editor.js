( function ( $ ) {
	'use strict';

	$( document ).on( 'click', '.wp-pdf-embed-insert', function ( event ) {
		event.preventDefault();

		var frame = wp.media( {
			title: wpPdfEmbedEditorL10n.title,
			button: { text: wpPdfEmbedEditorL10n.button },
			library: { type: 'application/pdf' },
			multiple: false
		} );

		frame.on( 'select', function () {
			var attachment = frame.state().get( 'selection' ).first().toJSON();
			wp.media.editor.insert( '[wp_pdf_embed id="' + parseInt( attachment.id, 10 ) + '"]' );
		} );

		frame.open();
	} );
} )( jQuery );
