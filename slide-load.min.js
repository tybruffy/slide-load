(function($){

	/**
	 * The pushLoad object creates and manages the AJAX transitions between
	 * all the pages and subpages on the site.
	 *
	 * This object is in charge of loading the new content as well as the 
	 * animated transition between the old content and the new content.  It also
	 * contains logic to determine if the new content should completely replace the
	 * target element, or be places inside the target element.  In most cases it is
	 * placed inside the target element, but in certain special cases it can be used
	 * to replace the invoking element.
	 *
	 * @todo Needs to be refactored with more .apply and .call methods so that it 
	 * can use this instead of referring o the global pushLoad object.
	 * @todo Consider refactoring using the jQueryUI widget factory.
	 * 
	 * @type {Object}
	 */
	var pushLoad = {
		$el:          null,
		offsets:      {},
		farCoords:    {},
		closeCoords:  {},
		transiton:    {},
		defaults:     {
			transition: "bottom",
			ajax: {
				url: "/",
				dataType: 'html',
				type: 'POST',
				data: {},
			},
		},
		
		/**
		 * Initializes the creation of the loader and sets its options.
		 * @param  {Object} config A configuration object for the loader.
		 */
		_init: function( config, el ) {
			config = config || {};
			$("#pl-loader").remove();

			this.$el      = this._proxy_check(el);
			this.settings = $.extend(true, {}, this.defaults, config);
			this.$loader  = $('<div id="pl-loader" class="loading-screen" />');
			this._load();
		},

		/**
		 * Clones the invoking element and positions the clone directly on top of it.
		 */
		_create_loader: function() {
			var $content = this.$el.clone();
			this.$loader.html($content);
			this._set_loader_style();
		
			$(document).trigger("pl.clone", [this.$el]);
		
			this.$loader.appendTo('.faux-body');
		},

		/**
		 * Gets two sets of coordinates for use in animating the loader.
		 */
		_set_coords: function() {
			this.offsets     = this.$el.offset();
			this.farCoords   = this._get_far_coords(this.$el);
			this.closeCoords = this._get_close_coords();
		},

		/**
		 * Gets the close coordinates of the element.
		 *
		 * The close coordinates are the distances from each side of the document 
		 * to that same side of the element. So distance from the left side 
		 * of the document to the left side of the element.
		 * 
		 * @param  {Object} coords An object containing top and left coordinates.
		 * @return {Object}        An object containing all four cooridantes.
		 */
		_get_close_coords: function() {
			var coords = {};
			coords.bottom = $(".faux-body").outerHeight() - this.farCoords.bottom;
			coords.right  = $(".faux-body").outerWidth() - this.farCoords.right;
			coords.top    = this.offsets.top;
			coords.left   = this.offsets.left;
			// $.extend(coords, this.offsets);
			return coords;
		},

		/**
		 * Gets the far coordinates of the element.
		 *
		 * The far coordinates are the distances from each side of the document 
		 * to the opposite side of the element. So distance from the left side 
		 * of the document to the right side of the element.
		 * 
		 * @param  {jQuery} coords The jQuery object to get teh coordinates of.
		 * @return {Object}        An object containing all four cooridantes.
		 */
		_get_far_coords: function($cntr) {
			coords        = {};
			coords.top    = $(".faux-body").outerHeight() - this.offsets.top;
			coords.left   = $(".faux-body").outerWidth() - this.offsets.left;
			coords.bottom = $cntr.outerHeight() + this.offsets.top;
			coords.right  = $cntr.outerWidth() + this.offsets.left;
			return coords;
		},

		/**
		 * This sets additional css properties of the loader clone.
		 */
		_set_loader_style: function() {
			this.$loader.css({
				height: this.$el.height(),
				width:  this.$el.width(),
			});
		},

		/**
		 * This runs the actual AJAX call to get new content, then calls the callback
		 * function.
		 */
		_load: function() {
			var self = this;
			$.ajax(this.settings.ajax).done(function(data) {
				self._show_content.call(self, data);
			});
		},

		/**
		 * This runs all of the necessary functions to add the new content to the
		 * container element, and then reveal it by animating the loader clone.
		 * 
		 * @param  {String} html The new HTML to insert into the container element.
		 */
		_show_content: function(html) {
			var self = this;
			this._set_coords();
			this._create_loader();			
			this._prepare_cntr(html);
			this.transitions[ this.settings.transition ].call(this);
			this.$el.imagesLoaded( function() {
				self.$el.trigger("pl.animate", [self.$el]);
				var fade = self.$el.fadeTo({
						duration: 750, 
						queue: false
					}, 1).animateAuto("height", {
						duration: 500, 
						queue: false
					})

				var slide = self.$loader.animate(
						self.transiton, 
						{
							queue:    false,
							duration: 500, 
						}
					);
				

				$.when(fade, slide).done(function () {
					self.$el.removeAttr('style');
					self._exit();
				});

			});
		},

		/**
		 * Inserts the new content into the container element.
		 *
		 * This sets a few style properties to keep things from showing up before
		 * they're ready.  It sets the height to match the height of the previous content
		 * so that the page doesn't expand in length before we're ready for it.  It also
		 * sets the opacity to 0, which is there primarily to aid the eventual transition,
		 * but has the added bonus of providing a fallback to make sure no new content is
		 * shown behind the loading screen.  In some instances, the new content is meant
		 * to replace the container, instead of being placed inside of it.  (Think team
		 * member to team member navigation.)  This function will determine if that
		 * replacement needs to happen.
		 * 
		 * @param  {String} html The HTML content to load into the element.
		 */
		_prepare_cntr: function(html) {
			var $new    = $(html)
			,	replace = this.$el.data("load-replace")

			$new = replace ? this._find_replacemnt($new) : $new;

			this.$el.css({
				height: this.$el.height(),
				opacity: 0,
			});

			this.$el.html($new);
		},

		/**
		 * Checks for a load proxy on the container element.
		 *
		 * A load proxy allows the content to be loaded into an element that is not
		 * the container element.  If the container element has a data-load="" property
		 * set, then this function attempts to find the new container element.  The 
		 * data-load property can be any valid jQuery selector.  If there is a data-load
		 * property set, but the jQuery selector returns an empty result, the initial 
		 * element is returned.
		 * 
		 * @param  {jQuery} $cntr A jQuery object containing the container element.
		 * 
		 * @return {jQuery}       A jQuery object containing the new elementif found, otherwise the initial object is returned.
		 */
		_proxy_check: function($cntr) {
			var proxy = $cntr.data("load-proxy");
			return $(proxy).length ? $(proxy) : $cntr;
		},

		/**
		 * This function looks for a replacement container in the new content.
		 *
		 * In order to make sure that the new content is placed correctly, the replacement
		 * is dependent on finding an element at the root of the new HTML that has the
		 * data-load-replacement property.  If an element with that property is found,
		 * then the replacement is called, which copies attributes/properties of the replacement
		 * onto the existing container.  Then those properties.attributes are strripped from
		 * the replacement container.  This is done because if we were to wholesale replace 
		 * the existing container, all the events we have bound to it, and triggers in this
		 * plugin would cease to exist, and therefore would fail.
		 * 
		 * @param  {jQuery} $new A jQuery object containing the new HTML object.
		 * 
		 * @return {jQuery}      A jQuery object containing the new HTML with the replacement made.
		 */
		_find_replacemnt: function($new) {
			var self  = this
			,	$copy = $new

			$copy.each(function(i, val) {
				if ($(this).data("load-replacement")) {
					self._replace_container($(this));
					contents = $(this).contents().toArray();
					$new.splice.apply($new, [i, 1].concat(contents))
				}
			});
			return $new;
		},

		/**
		 * This function copies attributes from one jQuery element to the container element.
		 *
		 * This function iterates over the properties of the jQuery element provided, and then
		 * copies them onto the Container jQuery element.
		 * 
		 * @param  {jQuery} $new A jQuery element to copy the properties of.
		 */
		_replace_container: function($new) {
			var	attr = $new.prop("attributes")
				self = this
			$.each(attr, function() {
				self.$el.attr(this.name, this.value);
			});
		},

		/**
		 * Finishes execution of the loader.
		 *
		 * Removes the loading screen element from the page and then triggers the 
		 * completion event on the document.
		 */
		_exit: function() {
			this.$loader.remove();
			$(document).trigger("pl.complete", [this.$el]);
		},

		transitions: {
			top: function() {
				this.$loader.css({
					top: this.closeCoords.top,
				});

				this.transiton = {
					height: 0,
				}
			},

			bottom: function() {
				this.$loader.css({
					top:    this.closeCoords.top,
					bottom: this.closeCoords.bottom,
				});

				this.transiton = {
					top:    this.farCoords.bottom,
					height: 0,
				}
			},

			left: function() {
				this.$loader.css({
					top:  this.closeCoords.top,
					left: this.closeCoords.left,
				});

				this.transiton = {
					left: "-100%",
				}
			},

			right: function() {
				this.$loader.css({
					top:   this.closeCoords.top,
					right: this.closeCoords.right,
				});

				this.transiton = {
					right: "-100%",
				}
			},

		},

	};

	$.fn.pushLoad = function() {
		// The second string is a pushLoad transition method
		if ( pushLoad.transitions[ arguments[1] ] ) {	
			config = {
				transition: arguments[1],
				ajax: {
					url: arguments[0],
				},
			}
			pushLoad._init.call( pushLoad, config, this );
		} else if ( typeof arguments[0] === 'object' ) {
			pushLoad._init.call( pushLoad, arguments[0], this );
		} else {
			$.error( 'pushLoad has no method '+arguments[0] );
		}
		return this;
	};

})( jQuery );