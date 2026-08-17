( function () {
	'use strict';

	var l10n = window.wpPdfEmbedL10n || {};
	var icons = { previous: '&#9664;', next: '&#9654;', zoomOut: '&#8722;', zoomIn: '&#43;', download: '&#8681;', open: '&#8599;', search: '&#128269;', fullscreen: '&#9974;' };

	function text( key, fallback ) { return l10n[ key ] || fallback; }

	function makeButton( className, label, icon ) {
		var control = document.createElement( 'button' );
		control.type = 'button';
		control.className = 'wp-pdf-embed__button ' + className;
		control.setAttribute( 'aria-label', label );
		control.setAttribute( 'title', label );
		control.innerHTML = '<span aria-hidden="true">' + icon + '</span>';
		return control;
	}

	function makeLink( className, label, icon, url, download ) {
		var control = document.createElement( 'a' );
		control.className = 'wp-pdf-embed__button ' + className;
		control.href = url;
		control.target = '_blank';
		control.rel = 'noopener noreferrer';
		control.setAttribute( 'aria-label', label );
		control.setAttribute( 'title', label );
		if ( download ) { control.setAttribute( 'download', '' ); }
		control.innerHTML = '<span aria-hidden="true">' + icon + '</span>';
		return control;
	}

	function safeExternalUrl( value ) {
		try {
			var parsed = new URL( value, window.location.href );
			return [ 'http:', 'https:', 'mailto:', 'tel:' ].indexOf( parsed.protocol ) !== -1 ? parsed.href : '';
		} catch ( error ) {
			return '';
		}
	}

	function Viewer( container ) {
		this.container = container;
		this.url = container.getAttribute( 'data-url' );
		this.pageNumber = parseInt( container.getAttribute( 'data-page' ), 10 ) || 1;
		this.continuous = container.getAttribute( 'data-continuous' ) === 'true';
		this.scaleMultiplier = 1;
		this.pageViews = [];
		this.pdf = null;
		this.searchMatches = [];
		this.searchIndex = -1;
		this.build();
		this.load();
	}

	Viewer.prototype.build = function () {
		var self = this;
		this.container.innerHTML = '';
		if ( this.container.getAttribute( 'data-disable-zoom' ) === 'true' ) { this.container.classList.add( 'wp-pdf-embed--device-zoom-disabled' ); }

		this.toolbar = document.createElement( 'div' );
		this.toolbar.className = 'wp-pdf-embed__toolbar';
		this.toolbar.setAttribute( 'role', 'toolbar' );
		this.toolbar.setAttribute( 'aria-label', text( 'page', 'Page' ) + ' controls' );
		this.previousButton = makeButton( 'wp-pdf-embed__previous', text( 'previousPage', 'Previous page' ), icons.previous );
		this.nextButton = makeButton( 'wp-pdf-embed__next', text( 'nextPage', 'Next page' ), icons.next );
		this.zoomOutButton = makeButton( 'wp-pdf-embed__zoom-out', text( 'zoomOut', 'Zoom out' ), icons.zoomOut );
		this.zoomInButton = makeButton( 'wp-pdf-embed__zoom-in', text( 'zoomIn', 'Zoom in' ), icons.zoomIn );
		this.searchButton = makeButton( 'wp-pdf-embed__search-toggle', text( 'search', 'Search document' ), icons.search );
		this.fullscreenButton = makeButton( 'wp-pdf-embed__fullscreen', text( 'fullscreen', 'Full screen' ), icons.fullscreen );
		this.pageInput = document.createElement( 'input' );
		this.pageInput.className = 'wp-pdf-embed__page-input';
		this.pageInput.type = 'number';
		this.pageInput.min = '1';
		this.pageInput.value = String( this.pageNumber );
		this.pageInput.setAttribute( 'aria-label', text( 'page', 'Page' ) );
		this.pageCount = document.createElement( 'span' );
		this.pageCount.className = 'wp-pdf-embed__page-count';
		this.pageCount.textContent = text( 'of', 'of' ) + ' –';

		[ this.previousButton, this.pageInput, this.pageCount, this.nextButton, this.zoomOutButton, this.zoomInButton ].forEach( function ( control ) { self.toolbar.appendChild( control ); } );
		if ( this.container.getAttribute( 'data-search' ) === 'true' ) { this.toolbar.appendChild( this.searchButton ); }
		var spacer = document.createElement( 'span' );
		spacer.className = 'wp-pdf-embed__spacer';
		this.toolbar.appendChild( spacer );
		this.toolbar.appendChild( this.fullscreenButton );
		if ( this.container.getAttribute( 'data-download' ) === 'true' ) {
			this.downloadLink = makeLink( 'wp-pdf-embed__download', text( 'download', 'Download PDF' ), icons.download, this.url, true );
			this.toolbar.appendChild( this.downloadLink );
		}
		this.toolbar.appendChild( makeLink( 'wp-pdf-embed__open', text( 'open', 'Open PDF in a new tab' ), icons.open, this.url, false ) );
		if ( this.container.getAttribute( 'data-toolbar' ) !== 'true' ) { this.toolbar.hidden = true; }

		this.searchBar = document.createElement( 'form' );
		this.searchBar.className = 'wp-pdf-embed__search';
		this.searchBar.hidden = true;
		this.searchInput = document.createElement( 'input' );
		this.searchInput.type = 'search';
		this.searchInput.className = 'wp-pdf-embed__search-input';
		this.searchInput.placeholder = text( 'searchPlaceholder', 'Search in PDF…' );
		this.searchInput.setAttribute( 'aria-label', text( 'search', 'Search document' ) );
		this.searchPrevious = makeButton( 'wp-pdf-embed__search-previous', text( 'previousMatch', 'Previous match' ), icons.previous );
		this.searchNext = makeButton( 'wp-pdf-embed__search-next', text( 'nextMatch', 'Next match' ), icons.next );
		this.searchStatus = document.createElement( 'span' );
		this.searchStatus.className = 'wp-pdf-embed__search-status';
		this.searchStatus.setAttribute( 'aria-live', 'polite' );
		[ this.searchInput, this.searchPrevious, this.searchNext, this.searchStatus ].forEach( function ( control ) { self.searchBar.appendChild( control ); } );

		this.viewport = document.createElement( 'div' );
		this.viewport.className = 'wp-pdf-embed__viewport';
		this.pages = document.createElement( 'div' );
		this.pages.className = 'wp-pdf-embed__pages';
		this.status = document.createElement( 'div' );
		this.status.className = 'wp-pdf-embed__status';
		this.status.setAttribute( 'role', 'status' );
		this.status.textContent = text( 'loading', 'Loading PDF…' );
		this.mobilePrompt = document.createElement( 'button' );
		this.mobilePrompt.type = 'button';
		this.mobilePrompt.className = 'wp-pdf-embed__mobile-prompt';
		this.mobilePrompt.textContent = this.container.getAttribute( 'data-mobile-text' ) || 'View PDF full screen';
		this.mobilePrompt.hidden = true;
		[ this.pages, this.status, this.mobilePrompt ].forEach( function ( control ) { self.viewport.appendChild( control ); } );
		this.container.appendChild( this.toolbar );
		this.container.appendChild( this.searchBar );
		this.container.appendChild( this.viewport );

		this.previousButton.addEventListener( 'click', function () { self.goTo( self.pageNumber - 1 ); } );
		this.nextButton.addEventListener( 'click', function () { self.goTo( self.pageNumber + 1 ); } );
		this.zoomOutButton.addEventListener( 'click', function () { self.zoom( -0.15 ); } );
		this.zoomInButton.addEventListener( 'click', function () { self.zoom( 0.15 ); } );
		this.pageInput.addEventListener( 'change', function () { self.goTo( parseInt( self.pageInput.value, 10 ) ); } );
		this.searchButton.addEventListener( 'click', function () { self.toggleSearch(); } );
		this.searchBar.addEventListener( 'submit', function ( event ) { event.preventDefault(); self.findNext( 1 ); } );
		this.searchInput.addEventListener( 'input', function () { window.clearTimeout( self.searchTimer ); self.searchTimer = window.setTimeout( function () { self.performSearch(); }, 250 ); } );
		this.searchPrevious.addEventListener( 'click', function () { self.findNext( -1 ); } );
		this.searchNext.addEventListener( 'click', function () { self.findNext( 1 ); } );
		this.fullscreenButton.addEventListener( 'click', function () { self.toggleFullscreen(); } );
		this.mobilePrompt.addEventListener( 'click', function () { self.toggleFullscreen(); } );
		if ( this.downloadLink ) { this.downloadLink.addEventListener( 'click', function () { self.track( 'download' ); } ); }
		this.viewport.addEventListener( 'scroll', function () { self.handleScroll(); }, { passive: true } );
		document.addEventListener( 'fullscreenchange', function () { self.fullscreenChanged(); } );
		if ( window.ResizeObserver ) {
			this.resizeObserver = new ResizeObserver( function () { window.clearTimeout( self.resizeTimer ); self.resizeTimer = window.setTimeout( function () { self.resize(); }, 180 ); } );
			this.resizeObserver.observe( this.viewport );
		}
	};

	Viewer.prototype.load = function () {
		var self = this;
		var task = window.pdfjsLib.getDocument( { url: this.url } );
		task.onPassword = function ( updatePassword ) {
			var password = window.prompt( text( 'passwordPrompt', 'Enter the password for this PDF:' ) );
			if ( password !== null ) { updatePassword( password ); } else { self.showError( text( 'passwordError', 'A password is required to open this PDF.' ) ); }
		};
		task.promise.then( function ( pdf ) {
			self.pdf = pdf;
			self.pageNumber = Math.min( self.pageNumber, pdf.numPages );
			self.pageInput.max = String( pdf.numPages );
			self.pageCount.textContent = text( 'of', 'of' ) + ' ' + pdf.numPages;
			self.createPageViews();
			self.updateControls();
			self.track( 'view' );
		} ).catch( function () { self.showError( text( 'loadError', 'The PDF could not be loaded.' ) ); } );
	};

	Viewer.prototype.createPageViews = function () {
		var self = this;
		var preparations = [];
		for ( var number = 1; number <= this.pdf.numPages; number++ ) {
			var element = document.createElement( 'div' );
			element.className = 'wp-pdf-embed__page';
			element.setAttribute( 'data-page-number', String( number ) );
			var canvas = document.createElement( 'canvas' );
			canvas.className = 'wp-pdf-embed__canvas';
			var highlights = document.createElement( 'div' );
			highlights.className = 'wp-pdf-embed__highlights';
			var annotations = document.createElement( 'div' );
			annotations.className = 'wp-pdf-embed__annotations';
			[ canvas, highlights, annotations ].forEach( function ( control ) { element.appendChild( control ); } );
			this.pages.appendChild( element );
			this.pageViews.push( { number: number, element: element, canvas: canvas, highlights: highlights, annotations: annotations, page: null, baseViewport: null, viewport: null, renderTask: null, renderedScale: 0, textContent: null } );
		}
		this.pageViews.forEach( function ( view ) {
			preparations.push( self.pdf.getPage( view.number ).then( function ( page ) { view.page = page; view.baseViewport = page.getViewport( { scale: 1 } ); self.sizePage( view ); } ) );
		} );
		Promise.all( preparations ).then( function () {
			self.status.hidden = true;
			if ( ! self.continuous ) { self.showSinglePage( self.pageNumber ); }
			self.setupPageObserver();
			self.goTo( self.pageNumber, true );
			self.updateMobilePrompt();
		} ).catch( function () { self.showError( text( 'loadError', 'The PDF could not be loaded.' ) ); } );
	};

	Viewer.prototype.sizePage = function ( view ) {
		var availableWidth = Math.max( 100, this.viewport.clientWidth - 32 );
		var scale = ( availableWidth / view.baseViewport.width ) * this.scaleMultiplier;
		view.viewport = view.page.getViewport( { scale: scale } );
		view.element.style.width = Math.floor( view.viewport.width ) + 'px';
		view.element.style.height = Math.floor( view.viewport.height ) + 'px';
	};

	Viewer.prototype.setupPageObserver = function () {
		var self = this;
		if ( window.IntersectionObserver ) {
			this.pageObserver = new IntersectionObserver( function ( entries ) {
				entries.forEach( function ( entry ) { if ( entry.isIntersecting ) { self.renderPage( self.pageViews[ parseInt( entry.target.getAttribute( 'data-page-number' ), 10 ) - 1 ] ); } } );
			}, { root: this.viewport, rootMargin: '700px 0px' } );
			this.pageViews.forEach( function ( view ) { self.pageObserver.observe( view.element ); } );
		} else { this.renderVisiblePages(); }
	};

	Viewer.prototype.renderPage = function ( view ) {
		var self = this;
		if ( ! view || ! view.page || view.renderedScale === view.viewport.scale ) { return; }
		if ( view.renderTask ) { view.renderTask.cancel(); }
		var outputScale = Math.min( window.devicePixelRatio || 1, 2 );
		var context = view.canvas.getContext( '2d' );
		view.canvas.width = Math.floor( view.viewport.width * outputScale );
		view.canvas.height = Math.floor( view.viewport.height * outputScale );
		view.canvas.style.width = Math.floor( view.viewport.width ) + 'px';
		view.canvas.style.height = Math.floor( view.viewport.height ) + 'px';
		view.renderTask = view.page.render( { canvasContext: context, viewport: view.viewport, transform: outputScale !== 1 ? [ outputScale, 0, 0, outputScale, 0, 0 ] : null } );
		view.renderTask.promise.then( function () { view.renderedScale = view.viewport.scale; self.renderAnnotations( view ); self.drawHighlights( view ); } ).catch( function ( error ) {
			if ( ! error || error.name !== 'RenderingCancelledException' ) { self.showError( text( 'loadError', 'The PDF could not be loaded.' ) ); }
		} );
	};

	Viewer.prototype.renderAnnotations = function ( view ) {
		var self = this;
		view.annotations.innerHTML = '';
		view.page.getAnnotations( { intent: 'display' } ).then( function ( annotations ) {
			annotations.forEach( function ( annotation ) {
				if ( ! annotation.rect || ( ! annotation.url && ! annotation.dest ) ) { return; }
				var rectangle = view.viewport.convertToViewportRectangle( annotation.rect );
				var anchor = document.createElement( 'a' );
				anchor.className = 'wp-pdf-embed__annotation-link';
				anchor.style.left = Math.min( rectangle[ 0 ], rectangle[ 2 ] ) + 'px';
				anchor.style.top = Math.min( rectangle[ 1 ], rectangle[ 3 ] ) + 'px';
				anchor.style.width = Math.abs( rectangle[ 0 ] - rectangle[ 2 ] ) + 'px';
				anchor.style.height = Math.abs( rectangle[ 1 ] - rectangle[ 3 ] ) + 'px';
				anchor.setAttribute( 'aria-label', annotation.title || annotation.url || text( 'page', 'Page' ) );
				if ( annotation.url ) {
					var safeUrl = safeExternalUrl( annotation.url );
					if ( ! safeUrl ) { return; }
					anchor.href = safeUrl;
					if ( self.container.getAttribute( 'data-new-window' ) === 'true' ) { anchor.target = '_blank'; anchor.rel = 'noopener noreferrer'; }
				} else {
					anchor.href = '#';
					anchor.addEventListener( 'click', function ( event ) { event.preventDefault(); self.goToDestination( annotation.dest ); } );
				}
				view.annotations.appendChild( anchor );
			} );
		} );
	};

	Viewer.prototype.goToDestination = function ( destination ) {
		var self = this;
		var destinationPromise = typeof destination === 'string' ? this.pdf.getDestination( destination ) : Promise.resolve( destination );
		destinationPromise.then( function ( explicitDestination ) {
			if ( ! explicitDestination || explicitDestination[ 0 ] === undefined ) { return; }
			var reference = explicitDestination[ 0 ];
			if ( typeof reference === 'number' ) { self.goTo( reference + 1 ); }
			else { self.pdf.getPageIndex( reference ).then( function ( index ) { self.goTo( index + 1 ); } ); }
		} );
	};

	Viewer.prototype.showSinglePage = function ( pageNumber ) { this.pageViews.forEach( function ( view ) { view.element.hidden = view.number !== pageNumber; } ); };

	Viewer.prototype.goTo = function ( pageNumber, immediate ) {
		if ( ! this.pdf || ! pageNumber || pageNumber < 1 || pageNumber > this.pdf.numPages ) { this.pageInput.value = String( this.pageNumber ); return; }
		this.pageNumber = pageNumber;
		this.pageInput.value = String( pageNumber );
		this.updateControls();
		var view = this.pageViews[ pageNumber - 1 ];
		if ( ! view ) { return; }
		if ( ! this.continuous ) { this.showSinglePage( pageNumber ); }
		this.renderPage( view );
		this.viewport.scrollTo( { top: view.element.offsetTop - this.pages.offsetTop, behavior: immediate ? 'auto' : 'smooth' } );
	};

	Viewer.prototype.handleScroll = function () {
		var self = this;
		if ( ! this.continuous || this.scrollFrame ) { return; }
		this.scrollFrame = window.requestAnimationFrame( function () {
			self.scrollFrame = null;
			var viewportTop = self.viewport.getBoundingClientRect().top;
			var closest = self.pageNumber;
			var distance = Infinity;
			self.pageViews.forEach( function ( view ) {
				var currentDistance = Math.abs( view.element.getBoundingClientRect().top - viewportTop - 8 );
				if ( currentDistance < distance ) { distance = currentDistance; closest = view.number; }
			} );
			if ( closest !== self.pageNumber ) { self.pageNumber = closest; self.pageInput.value = String( closest ); self.updateControls(); }
			if ( ! window.IntersectionObserver ) { self.renderVisiblePages(); }
		} );
	};

	Viewer.prototype.renderVisiblePages = function () {
		var viewportRect = this.viewport.getBoundingClientRect();
		var self = this;
		this.pageViews.forEach( function ( view ) { var rect = view.element.getBoundingClientRect(); if ( rect.bottom > viewportRect.top - 700 && rect.top < viewportRect.bottom + 700 ) { self.renderPage( view ); } } );
	};

	Viewer.prototype.zoom = function ( delta ) {
		this.scaleMultiplier = Math.max( 0.4, Math.min( 3, Math.round( ( this.scaleMultiplier + delta ) * 100 ) / 100 ) );
		this.zoomOutButton.disabled = this.scaleMultiplier <= 0.4;
		this.zoomInButton.disabled = this.scaleMultiplier >= 3;
		this.resize();
	};

	Viewer.prototype.resize = function () {
		var self = this;
		if ( ! this.pdf || ! this.pageViews.length ) { return; }
		this.pageViews.forEach( function ( view ) { self.sizePage( view ); view.renderedScale = 0; } );
		if ( this.continuous ) { this.renderVisiblePages(); } else { this.renderPage( this.pageViews[ this.pageNumber - 1 ] ); }
		this.updateMobilePrompt();
	};

	Viewer.prototype.toggleSearch = function () { this.searchBar.hidden = ! this.searchBar.hidden; this.searchButton.setAttribute( 'aria-pressed', this.searchBar.hidden ? 'false' : 'true' ); if ( ! this.searchBar.hidden ) { this.searchInput.focus(); } };

	Viewer.prototype.performSearch = function () {
		var self = this;
		var query = this.searchInput.value.trim().toLocaleLowerCase();
		this.searchMatches = [];
		this.searchIndex = -1;
		if ( ! query || ! this.pdf ) { this.searchStatus.textContent = ''; this.clearHighlights(); return; }
		this.searchStatus.textContent = text( 'loading', 'Loading…' );
		Promise.all( this.pageViews.map( function ( view ) {
			var promise = view.textContent ? Promise.resolve( view.textContent ) : view.page.getTextContent().then( function ( content ) { view.textContent = content; return content; } );
			return promise.then( function ( content ) {
				content.items.forEach( function ( item, itemIndex ) {
					var haystack = item.str.toLocaleLowerCase();
					var offset = haystack.indexOf( query );
					while ( offset !== -1 ) { self.searchMatches.push( { page: view.number, itemIndex: itemIndex, offset: offset, length: query.length } ); offset = haystack.indexOf( query, offset + Math.max( 1, query.length ) ); }
				} );
			} );
		} ) ).then( function () {
			self.pageViews.forEach( function ( view ) { self.drawHighlights( view ); } );
			if ( self.searchMatches.length ) { self.searchIndex = 0; self.goToSearchMatch(); } else { self.searchStatus.textContent = text( 'noMatches', 'No matches found' ); }
		} );
	};

	Viewer.prototype.findNext = function ( direction ) { if ( ! this.searchMatches.length ) { this.performSearch(); return; } this.searchIndex = ( this.searchIndex + direction + this.searchMatches.length ) % this.searchMatches.length; this.goToSearchMatch(); };

	Viewer.prototype.goToSearchMatch = function () {
		var match = this.searchMatches[ this.searchIndex ];
		var label = this.searchMatches.length === 1 ? text( 'match', 'match' ) : text( 'matches', 'matches' );
		this.searchStatus.textContent = ( this.searchIndex + 1 ) + ' / ' + this.searchMatches.length + ' ' + label;
		this.goTo( match.page );
		var self = this;
		window.setTimeout( function () {
			self.pageViews.forEach( function ( view ) { self.drawHighlights( view ); } );
			var current = self.pageViews[ match.page - 1 ].highlights.querySelector( '.is-current' );
			if ( current ) {
				self.viewport.scrollTop = self.pageViews[ match.page - 1 ].element.offsetTop + current.offsetTop - ( self.viewport.clientHeight / 2 );
			}
		}, 0 );
	};

	Viewer.prototype.clearHighlights = function () { this.pageViews.forEach( function ( view ) { view.highlights.innerHTML = ''; } ); };

	Viewer.prototype.drawHighlights = function ( view ) {
		var self = this;
		view.highlights.innerHTML = '';
		if ( ! view.textContent || ! view.viewport || ! this.searchMatches.length ) { return; }
		this.searchMatches.forEach( function ( match, matchIndex ) {
			if ( match.page !== view.number ) { return; }
			var item = view.textContent.items[ match.itemIndex ];
			var transform = window.pdfjsLib.Util.transform( view.viewport.transform, item.transform );
			var height = Math.max( 4, Math.hypot( transform[ 2 ], transform[ 3 ] ) );
			var itemWidth = Math.max( 4, item.width * view.viewport.scale );
			var highlight = document.createElement( 'span' );
			highlight.className = 'wp-pdf-embed__highlight' + ( matchIndex === self.searchIndex ? ' is-current' : '' );
			highlight.style.left = ( transform[ 4 ] + itemWidth * ( item.str.length ? match.offset / item.str.length : 0 ) ) + 'px';
			highlight.style.top = ( transform[ 5 ] - height ) + 'px';
			highlight.style.width = Math.max( 3, itemWidth * ( item.str.length ? match.length / item.str.length : 1 ) ) + 'px';
			highlight.style.height = height + 'px';
			view.highlights.appendChild( highlight );
		} );
	};

	Viewer.prototype.toggleFullscreen = function () { if ( document.fullscreenElement === this.container ) { document.exitFullscreen(); } else if ( this.container.requestFullscreen ) { this.container.requestFullscreen(); } else { window.open( this.url, '_blank', 'noopener' ); } };

	Viewer.prototype.fullscreenChanged = function () {
		var active = document.fullscreenElement === this.container;
		var label = active ? text( 'exitFullscreen', 'Exit full screen' ) : text( 'fullscreen', 'Full screen' );
		this.fullscreenButton.setAttribute( 'aria-label', label );
		this.fullscreenButton.setAttribute( 'title', label );
		this.container.classList.toggle( 'is-fullscreen', active );
		this.mobilePrompt.hidden = true;
		this.resize();
	};

	Viewer.prototype.updateMobilePrompt = function () { var threshold = parseInt( this.container.getAttribute( 'data-mobile-width' ), 10 ) || 0; this.mobilePrompt.hidden = ! threshold || this.container.clientWidth >= threshold || document.fullscreenElement === this.container; };

	Viewer.prototype.track = function ( eventName ) {
		var id = parseInt( this.container.getAttribute( 'data-attachment-id' ), 10 );
		if ( this.container.getAttribute( 'data-track' ) !== 'true' || ! id || ! text( 'ajaxUrl', '' ) ) { return; }
		var data = new FormData();
		data.append( 'action', 'wp_pdf_embed_track' );
		data.append( 'attachment_id', String( id ) );
		data.append( 'event', eventName );
		window.fetch( text( 'ajaxUrl', '' ), { method: 'POST', body: data, credentials: 'same-origin', keepalive: true } ).catch( function () {} );
	};

	Viewer.prototype.updateControls = function () { this.previousButton.disabled = this.pageNumber <= 1; this.nextButton.disabled = ! this.pdf || this.pageNumber >= this.pdf.numPages; };
	Viewer.prototype.showError = function ( message ) { this.status.hidden = false; this.status.classList.add( 'wp-pdf-embed__status--error' ); this.status.textContent = message; };

	function initialize() {
		var viewers = document.querySelectorAll( '.wp-pdf-embed:not([data-initialized])' );
		for ( var index = 0; index < viewers.length; index++ ) { viewers[ index ].setAttribute( 'data-initialized', 'true' ); new Viewer( viewers[ index ] ); }
	}

	if ( document.readyState === 'loading' ) { document.addEventListener( 'DOMContentLoaded', initialize ); } else { initialize(); }
} )();
