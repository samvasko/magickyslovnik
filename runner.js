/**
 * Samuel Vasko 2013
 * samvasko@gmail.com | samuelvasko.tk
 * Dictionary magic
 */

$(function() {

var showMagic = {

	letterKey : 83, // S
	element : $('<div/>', { 'id': 'magician', 'class': 'disabled' }),
	inputField : {},
	lastVal : '',
	from : 'anglicko',
	to : 'slovensky',
	url : 'http://slovnik.azet.sk/preklad/',
	words : [],
	list : {},
	lang : {},

	init : function() {

		// Create elements!
		this.inputField = $('<input />', {
			'name': 'searchmagic',
			'type': 'text',
			'id': 'searchmagic'}).appendTo(this.element);
		this.list = this.element.append( $('<ul/>', {'id': 'results' }) );
		this.languages = this.element.append( $('<ul/>', {'id':'lang'}) );

		// bind keys
		$(document).keydown(function(event){
			console.log(event.keyCode);
			if (event.keyCode == 83 && event.altKey) {
				this.open();
				return false;
			}
			if (event.keyCode == 27) {
				this.element.toggleClass('disabled');
			}
		}.bind(this));

		// bind typing
		$(this.inputField).on('keyup keydown', this.fetch.bind(this));
	},

	open : function() {
		this.element.toggleClass('disabled');
		if ( ! this.element.hasClass('disabled') ) {
			$(document.body).prepend(this.element);
			this.element = $('#magician');
			this.list = this.element.find('ul');
		}
		this.inputField.focus();
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

			console.log(rawWords.length);
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
};

showMagic.init();
}());