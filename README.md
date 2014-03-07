# Slide Load
Slide Load is a jQuery plugin that loads AJAX content into an element which already contains content, and then animates the initial content away, replacing it with the new content.

## Basic Usage

Include Slide Load in your project, and then replacing content is as easy as this:

```html
<div id="cool-element"></ul>
    <p>Lorem ipsum dolor sit amet</p>
</div>
```

```js
$("#cool-element").pushLoad("/cooler-content.html");
```

## Additional options

Other available options for the pushLoad call include:

```js
$("#cool-element").pushLoad("/cooler-content.html", "left");
```
This code will animate the existing content to the left, instead of the default which is to animate to the bottom.

```js
$("#cool-element").pushLoad({
    transition: "right",
	ajax: {
		url: "/cooler-content.html",
		dataType: 'html',
		type: 'POST',
		data: {
            testing: true,
		},
	},
});
```
When passing an object to the pushLoad call there are two main properties to set.  The first is the transition property (which defaults to "bottom") and the second is the ajax object.  The ajax object accepts all properties that are accepted by the [jQuery.ajax()](https://api.jquery.com/jQuery.ajax/) method.  You'll want to be sure to include the url property of the ajax object, or else it defaults to load the root.

##Events

Slide Load has three events that you can hook into.  They are `clone`, `animate` and  `complete`.  `Clone` and `complete` are triggered on the `Document`, while `animate` is triggered on the called element. They are namespaced with the prefix `pl.` Here's how to use them:

```js
$(Document).on("pl.clone", function(e, $el) {
	console.log("You're content has been loaded!");
});
```

```js
$(Document).on("pl.animate", function(e, $el) {
    console.log("About to start animating the old content away!");
});
```

```js
$(Document).on("pl.complete", function(e, $el) {
    console.log("All finished loading");
});
```

Currently, the `$el` variable is the jQuery object pushLoad was originally called on.

##Methods

There are currently no methods available to use outside of the loader.

##Todo

* Abstract transition method so that additional transitions can be added from outside the loader.

