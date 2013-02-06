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
	from : 'anglicko',
	to : 'slovensky',
	url : 'http://slovnik.azet.sk/preklad/',
	words : [],

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
		$(this.inputField).on('keyup keydown', this.fetch.bind(this));
	},

	open : function() {
		this.element = $(document.body).prepend(this.element);
		this.first = false;
		this.visible = true;
	},

	fetch : function(elem) {
		var currentVal = this.inputField.val();
		// value of input is the same, do not care || to short to get something
		if ( currentVal == this.lastVal ||  currentVal.length < 2 ) return true;
		this.lastVal = currentVal;

		console.log( this.inputField.val() );

		jQuery.get(this.url + this.from + '-' + this.to, {q: currentVal }, function(data, textStatus) {
			var words = [];
			$('table.p', data).each(function() {
				var	from = $(this).find('.z a').text(),
					to = [];
				$(this).find('.do a:not(.lupa) span').each(function() {
					to.push($(this).text());
				});

				words.push({
					from:from,
					to:to
				});

			});

			this.words = words;
			this.render();

		}.bind(this));
		return true;
	}

};

showMagic.init();
}());