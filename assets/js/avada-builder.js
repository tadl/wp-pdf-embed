( function () {
	'use strict';

	var settings = window.wpPdfEmbedAvada || {};

	function isPdfUrl( value ) {
		if ( ! value ) {
			return false;
		}

		try {
			return /\.pdf$/i.test( new URL( value, window.location.href ).pathname );
		} catch ( error ) {
			return false;
		}
	}

	function replacePreview( image ) {
		var originalUrl = image.getAttribute( 'data-wp-pdf-original' ) || image.getAttribute( 'src' );
		if ( ! isPdfUrl( originalUrl ) || ! settings.previewUrl ) {
			return;
		}

		image.setAttribute( 'data-wp-pdf-original', originalUrl );
		if ( image.getAttribute( 'src' ) !== settings.previewUrl ) {
			image.setAttribute( 'src', settings.previewUrl );
		}
		image.setAttribute( 'alt', settings.previewAlt || 'Selected PDF document' );
		image.classList.add( 'wp-pdf-embed-avada-preview' );
	}

	function scan( root ) {
		if ( root.nodeType !== 1 ) {
			return;
		}

		if ( root.matches( 'img[src]' ) ) {
			replacePreview( root );
		}

		var images = root.querySelectorAll( 'img[src]' );
		for ( var index = 0; index < images.length; index++ ) {
			replacePreview( images[ index ] );
		}
	}

	function initialize() {
		scan( document.body );
		var observer = new MutationObserver( function ( mutations ) {
			mutations.forEach( function ( mutation ) {
				if ( mutation.type === 'attributes' ) {
					scan( mutation.target );
					return;
				}
				for ( var index = 0; index < mutation.addedNodes.length; index++ ) {
					scan( mutation.addedNodes[ index ] );
				}
			} );
		} );
		observer.observe( document.body, { attributes: true, attributeFilter: [ 'src' ], childList: true, subtree: true } );
	}

	if ( document.readyState === 'loading' ) {
		document.addEventListener( 'DOMContentLoaded', initialize );
	} else {
		initialize();
	}
} )();
