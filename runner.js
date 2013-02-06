/**
 * Samuel Vasko 2013
 * samvasko@gmail.com | samuelvasko.tk
 * Dictionary magic
 */

$(function() {

var showMagic = {

	letterKey : 83, // S
	element : $('<div/>', { 'id': 'magician' }),
	inputField : {},
	first : true,
	visible : false,
	lastVal : '',

	init : function() {

		// Create elements!
		this.inputField = $('<input/>', {name: 'searchmagic'}).appendTo(this.element);
		console.log( 'Initialized dictionary!' );

		// bind keys
		$(document).keydown(function(event){
			if (event.keyCode == 83 && event.altKey) {
				this.open();
				return false;
			}
		}.bind(this));

		// bind typing
		this.inputField.on('keyup keydown', this.fetch);
	},

	open : function() {
		this.element = $(document.body).prepend(this.element);
		this.first = false;
		this.visible = true;
	},

	fetch : function(elem) {
		console.log( this.inputField.val() );
		var currentVal = this.inputField.val();

		// value of input is the same, do not care || to short to get something
		if ( currentVal == this.lastVal ||  currentVal.lenght < 2 ) return false;



	}

};

showMagic.init();


}());