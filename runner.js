/**
 * Samuel Vasko 2013
 * samvasko@gmail.com | samuelvasko.tk
 * Dictionary magic
 */

$(function() {

var showMagic = {

	letterKey : 83, // S
	element : {}, inputField : {}, listUl : {}, langUl : {},
	lastVal : '',
	languages : {
		ensk : { from : 'anglicko', to : 'slovensky' },
		sken : { from : 'slovensko', to : 'anglicky' }
	},
	currentLang: 'sken', // default direction
	url : 'http://slovnik.azet.sk/preklad/',
	words : [],

	init : function() {

		// Create elements!
		this.element = $('<div/>', { 'id': 'trans_magician', 'class': 'trans_disabled' });
		this.inputField = $('<input />', {
			'name': 'searchmagic',
			'type': 'text',
			'id': 'searchmagic'}).appendTo(this.element);

		this.langUl = $('<ul/>', {'id':'trans_magician_lang'}).appendTo(this.element);
		this.listUl = $('<ul/>', {'id':'trans_magician_results'}).appendTo(this.element);

		// insert them into body
		this.element = this.element.appendTo($(document.body));

		// bind keys
		$(document).keydown( this.open_key.bind(this) );
		$(document).keyup( this.close_key.bind(this) );
		$(this.inputField).on('keyup keydown', this.fetch.bind(this));
	},

	opencloser : function() {
		this.element.toggleClass('trans_disabled');
		// focus only when opening
		if ( ! this.element.hasClass('trans_disabled')) this.inputField.focus();
	},

	fetch : function(elem) {

		var currentVal = this.inputField.val();
		if ( currentVal.length < 2 ) {
			this.listUl.html('');
			return true;
		}
		if ( currentVal == this.lastVal)
		{
			return true;
		}

		this.lastVal = currentVal;
		var fromto = this.languages[this.currentLang];

		jQuery.get(this.url + fromto.from + '-' + fromto.to, {q: currentVal }, function(data, textStatus) {
			var words = [],
				rawWords = jQuery('table.p', data);
				console.log( rawWords );

			// is this a bug or feature?
			rawWords.each(function() {
				var	from = $(this).find('.z a').text(),
					to = [];

				jQuery(this).find('.do > span').each(function() {
					to.push(jQuery(this).text());
					console.log(jQuery(this).text());
				});
				words.push({ from:from, to:to });

			});
			this.words = words;
			this.render();
		}.bind(this));
	},

	render : function() {
		if (!this.words) console.error('missing words');
		this.listUl.html('');
		for(var word in this.words ) {
			var current = this.words[word];
			$('<li/>').text( current.to.join(' | ') )
						.prepend($('<b/>').text(current.from))
						.appendTo(this.listUl);
		}
		this.listUl.appendTo(this.element);
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
		if (( event.keyCode == 13 || event.keyCode == 27 ) && !this.element.hasClass('trans_disabled')) {
			event.preventDefault();
			event.stopPropagation();
			this.element.toggleClass('trans_disabled');
			return false;
		}
	}
};

showMagic.init();

}());
