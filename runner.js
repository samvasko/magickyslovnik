/**
 * Samuel Vasko 2013
 * samvasko@gmail.com | samuelvasko.tk
 * Dictionary magic
 */

$(function() {

var showMagic = {

	letterKey: 83, // S
	element: {},   // element of the search field
	inputField: {},
	listUl: {}, // list of results
	langUl: {}, // list of languages
	lastVal: '', // last value from input
	words: [],
	url: 'http://slovnik.azet.sk/preklad/',

	from: true,  // translate from slovak / to slovak

	slovak: {
		to: 'slovensky',   tname: 'Slovenský',
		from: 'slovensko', fname: 'Slovensko'
	},
	languages : {
		a: { from: 'anglicko',   to: 'anglicky',   fname: 'Anglicko',   tname: 'Anglický' },
		n: { from: 'nemecko',    to: 'nemecky',    fname: 'Nemecko',    tname: 'Nemecký' },
		f: { from: 'francuzsko', to: 'francuzsky', fname: 'Francúzsko', tname: 'Francúzsky' },
		s: { from: 'spanielsko', to: 'spanielsky', fname: 'Španielsko', tname: 'Španielsky' },
		m: { from: 'madarsko',   to: 'madarsky',   fname: 'Maďarsko',   tname: 'Maďarský' },
		t: { from: 'taliansko',  to: 'taliansky',  fname: 'Taliansko',  tname: 'Taliansky' },
		r: { from: 'rusko',      to: 'rusky',      fname: 'Rusko',      tname: 'Ruský' }
	},

	init : function() {
		var that = this;

		// Create elements!
		this.element = $('<div/>', { 'id': 'trans_magician', 'class': 'trans_disabled' });
		this.inputField = $('<input />', {
			'name': 'searchmagic',
			'type': 'text',
			'id': 'searchmagic'}).appendTo(this.element);

		this.listUl = $('<ul/>', {'id':'trans_magician_results'}).appendTo(this.element);
		this.langUl = $('<ul/>', {'id':'trans_magician_lang', 'class': 'trans_magician_hidden' }).appendTo(this.element);

		// selected language
		this.langUl.append( $('<li/>', {
			'text': this.slovak.from +' '+ this.languages['a'].tname,
			'id': 'trans_magician_lang_li',
			'data-lang': 'a'
		}) );
		// dropdown items
		for( var one in this.languages ) {
			this.langUl.append( $('<li/>', { 'text': this.languages[one].tname, 'id': 'trans_magician_lang_li', 'data-lang': one }) );
		}

		this.langFirstLi  = this.langUl.find('li:first-child');
		this.langDropownLi = this.langFirstLi.siblings();

		// bind events on language bar
		// dropdown
		this.langUl.hover(
		function(event) {
			that.langUl.removeClass('trans_magician_hidden');
		},
		function(event) {
			that.langUl.addClass('trans_magician_hidden');
		});

		// click to switch
		this.langFirstLi.click(function(event) {
			that.switchLang();
		});

		// dropdown to change
		this.langDropownLi.click( function() {
			// ignore clicks on disabled element
			if ( $(this).hasClass('trans_li_disabled') ) return false;
			that.changeLang( $(this).attr('data-lang') );
		});

		// set default language and direction
		this.from = true;
		this.changeLang('a');

		// insert them into body
		this.element = this.element.appendTo($(document.body));

		// bind keys
		$(document).keydown( this.open_key.bind(this) );
		$(document)	.keyup( this.close_key.bind(this) );
		$(this.inputField).on('keyup keydown', this.fetch.bind(this));
	},
	get lang(){
		return this.langString;
	},
	set lang(language){
		this.shortLangString = language;

		if (this.from) {
			this.langString = this.slovak.from + '-' + this.languages[language].to;
			this.langFirstLi.text( this.slovak.fname + ' ' + this.languages[language].tname );
		} else {
			this.langString = this.languages[language].from + '-' + this.slovak.to;
			this.langFirstLi.text( this.languages[language].fname  + ' ' + this.slovak.tname);
		}


	},

	switchLang: function(){
		this.from = !this.from;
		this.lang = this.shortLangString;
	},

	changeLang: function(slang){
		var clicked = this.langDropownLi.filter('[data-lang="' + slang + '"]');
		// disable the clicked
		clicked.addClass('trans_li_disabled');
		// enable the disabled !
		clicked.siblings().removeClass('trans_li_disabled');
		// set clicked to be current language in head of dropdown and in search
		this.lang = slang;

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
		jQuery.get(this.url, {q: currentVal }, function(data, textStatus) {
			var words = [],
				rawWords = jQuery('table.p', data);

			// is this a bug or feature?
			rawWords.each(function() {
				var	from = $(this).find('.z a').text(),
					to = [];

				jQuery(this).find('.do > span').each(function() {
					to.push(jQuery(this).text());
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
