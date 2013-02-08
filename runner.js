/**
 * Samuel Vasko 2013
 * samvasko@gmail.com | samuelvasko.tk
 * Dictionary magic
 */

$(function() {

var showMagic = {

	letterKey : 83, // S
	element : {}, inputField : {}, list : {}, lang : {},
	lastVal : '',
	from : 'anglicko', to : 'slovensky',
	url : 'http://slovnik.azet.sk/preklad/',
	words : [],

	init : function() {

		// Create elements!
		this.element = $('<div/>', { 'id': 'magician', 'class': 'disabled' });
		this.inputField = $('<input />', {
			'name': 'searchmagic',
			'type': 'text',
			'id': 'searchmagic'}).appendTo(this.element);
		this.element.append( $('<ul/>', {'id': 'results' }) );
		this.element.append( $('<ul/>', {'id':'lang'}) );

		// insert them into body
		this.element = this.element.appendTo($(document.body));
		this.list = this.element.find('#results');

		// bind keys
		$(document).keydown( this.open_key.bind(this) );
		$(document).keyup( this.close_key.bind(this) );
		$(this.inputField).on('keyup keydown', this.fetch.bind(this));
	},

	opencloser : function() {
		this.element.toggleClass('disabled');
		// focus only when opening
		if ( ! this.element.hasClass('disabled')) this.inputField.focus();
	},

	fetch : function(elem) {
		var currentVal = this.inputField.val();
		// value of input is the same, do not care || to short to get something
		if ( currentVal.length < 2 ) this.list.html('');
		if ( currentVal == this.lastVal ||  currentVal.length < 2 ) return true;
		this.lastVal = currentVal;

		jQuery.get(this.url + this.from + '-' + this.to, {q: currentVal }, function(data, textStatus) {
			var words = [],
				rawWords = $('table.p', data);

			if (!rawWords.length) this.list.html('Ziadne vysledky');
			rawWords.each(function() {
				var	from = $(this).find('.z a').text(),
					to = [];

				$(this).find('.do a:not(.lupa) span').each(function() {
					to.push($(this).text());
				});
				words.push({ from:from, to:to });
			});

			this.words = words;
			this.render();

		}.bind(this));
		return true;
	},

	render : function() {
		if (!this.words) console.error('missing words');
		this.list.html('');
		for(var word in this.words ) {
			var current = this.words[word];

			$('<li/>').text( current.to.join(' | ') )
						.prepend($('<b/>').text(current.from))
						.appendTo(this.list);
		}

		this.list.appendTo(this.element);
	},
	open_key : function (event) {
		if (event.keyCode == 83 && event.altKey) {

			event.preventDefault();
			event.stopPropagation();

			this.opencloser();
			return false;
		}
	},
	close_key : function(event) {
		if (event.keyCode == 27 && !this.element.hasClass('disabled')) {
			event.preventDefault();
			event.stopPropagation();

			this.element.toggleClass('disabled');

			return false;
		}
	}
};

showMagic.init();

}());
