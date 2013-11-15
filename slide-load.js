(function($){

	var pushLoad = {
		$cntr:       null,
		// self:        this,
		$loader:     $('<div id="pl-loader" class="cover loading-screen" />'),
		$stage:      $('<div id="pl-stage" style="visibility: none;" />'),
		offsets:     {},
		farCoords:   {},
		closeCoords: {},
		settings: {
			direction: "bottom",
			ajax: {
				url: "/",
				dataType: 'html',
				type: 'POST',
				// data: {
				// 	'jakejax': true
				// },
			},
		},
		
		_init: function( config ) {
			config = config || {};
			$.extend(true, pushLoad.settings, config);

			pushLoad.$cntr       = this;
			pushLoad.offsets     = pushLoad.$cntr.offset();
			pushLoad.farCoords   = pushLoad._get_far_coords(this, pushLoad.farCoords);
			pushLoad.closeCoords = pushLoad._get_close_coords(this, pushLoad.closeCoords);
			
			pushLoad.$loader.css( pushLoad.closeCoords ).show();
		},

		_get_close_coords: function($cntr, coords) {
			coords.bottom = $(".faux-body").outerHeight() - pushLoad.farCoords.bottom;
			coords.right  = $(".faux-body").outerWidth() - pushLoad.farCoords.right;
			$.extend(coords, pushLoad.offsets);
			return coords;
		},

		_get_far_coords: function($cntr, coords) {
			coords.top    = $(".faux-body").outerHeight() - pushLoad.offsets.top;
			coords.left   = $(".faux-body").outerWidth() - pushLoad.offsets.left;			
			coords.bottom = pushLoad.offsets.top + $cntr.outerHeight()
			coords.right  = pushLoad.offsets.left + $cntr.outerWidth();
			return coords;
		},

		_slide_loader: function($loader, $cntr) {
			$loader.appendTo('.faux-body')
				.stop(true, true)
				.animate(pushLoad.closeCoords, "fast")
		},

		_load: function() {
			$.ajax(pushLoad.settings.ajax).done(pushLoad._show_content);
		},

		_show_content: function(html) {
			pushLoad.$cntr.css("opacity", 0)
				.replaceWith(html)
				.fadeIn()
			pushLoad.$loader.fadeOut(function() {
				pushLoad._exit();
			});
		},

		_exit: function() {
			pushLoad.$loader.remove();
		},

		top: function() {
			pushLoad.$loader.css({
				bottom: pushLoad.farCoords.top,
			})
			pushLoad._slide_loader(pushLoad.$loader, pushLoad.$cntr);
		},

		bottom: function() {
			pushLoad.$loader.css({
				top: pushLoad.farCoords.bottom,
			})
			pushLoad._load()

			pushLoad._slide_loader(pushLoad.$loader, pushLoad.$cntr);
		},

		left: function() {
			pushLoad.$loader.css({
				right: pushLoad.farCoords.left,
			})
			pushLoad._slide_loader(pushLoad.$loader, pushLoad.$cntr);
		},

		right: function() {
			pushLoad.$loader.css({
				left: pushLoad.farCoords.right,
			})
			pushLoad._slide_loader(pushLoad.$loader, pushLoad.$cntr);
		},

	};

	$.fn.pushLoad = function() {

		if ( pushLoad[ arguments[1] ] ) {	
			// The second string is a pushLoad method
			
			config = {
				direction: arguments[1],
				ajax: {
					url: arguments[0],
				},
			}

			pushLoad._init.call( this, config );

			return pushLoad[ arguments[1] ].call( 
				this, 
				Array.prototype.slice.call( arguments, 1 )
			);
			
		} else if ( typeof arguments[0] === 'object' ) {

			pushLoad._init.call( this, arguments[0] );
			return pushLoad[ pushLoad.settings.direction ].call( 
				this, 
				Array.prototype.slice.call( arguments, 1 )
			);

		} else if ( !arguments ) {
			
			// No args passed, return the object
			pushLoad._init.call( this );
			return pushLoad;

		} else {
			$.error( 'pushLoad has no method '+arguments[0] );
		}    
	};


})( jQuery );