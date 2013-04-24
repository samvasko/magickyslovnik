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
	sauce: 0,
	url: {
		azet: 'http://slovnik.azet.sk/preklad/'
	},
	delay: 200, // delay for fetching in ms
	timeout: 0,

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
		for(var one in this.languages ) {
			this.langUl.append( $('<li/>', { 'text': this.languages[one].tname, 'id': 'trans_magician_lang_li', 'data-lang': one }) );
		}

		this.langFirstLi  = this.langUl.find('li:first-child');
		this.langDropownLi = this.langFirstLi.siblings();

		// bind events on language bar
		// dropdown
		this.langUl.hover(
		function() { that.langUl.removeClass('trans_magician_hidden'); },
		function() { that.langUl.addClass('trans_magician_hidden'); }
		);

		// click to switch lang
		this.langFirstLi.click(function() { that.switchLang(); });

		// dropdown to change
		this.langDropownLi.click(function() {
			// ignore clicks on disabled element
			if ( $(this).hasClass('trans_li_disabled') ) {
				return false;
			}
			that.changeLang( $(this).attr('data-lang') );
		});

		// set default language and direction
		this.from = true;
		this.changeLang('a');

		// pick sauce
		this.sauce = this.azet.bind(this);

		// insert them into body
		this.element = this.element.appendTo($(document.body));

		// bind keys
		$(document).keydown( this.open_key.bind(this) );
		$(document).keyup( this.close_key.bind(this) );
		$(this.inputField).on('keyup', this.keypress.bind(this));
	},

	get lang(){
		return this.langString;
	},

	/**
	 * set language sting
	 * @param {sting} language language name in short version
	 */
	set lang(language){
		this.shortLangString = language;

		if (this.from) {
			this.langString = this.slovak.from + '-' + this.languages[language].to;
			this.langFirstLi.text( this.slovak.fname + ' ' + this.languages[language].tname );
		} else {
			this.langString = this.languages[language].from + '-' + this.slovak.to;
			this.langFirstLi.text( this.languages[language].fname  + ' ' + this.slovak.tname);
		}

		this.fetch(true);
	},

	/**
	 * Switch direciton of translation
	 */
	switchLang: function(){
		this.from = !this.from;
		this.lang = this.shortLangString;
	},

	/**
	 * Change language
	 * @param  {string} slang language name in short format
	 */
	changeLang: function(slang){
		var clicked = this.langDropownLi.filter('[data-lang="' + slang + '"]');
		// disable the clicked
		clicked.addClass('trans_li_disabled');
		// enable the disabled !
		clicked.siblings().removeClass('trans_li_disabled');
		// set clicked to be current language in head of dropdown and in search
		this.lang = slang;
		// close dropdown
		this.langUl.addClass('trans_magician_hidden');
	},

	/**
	 * Open/close the main windows
	 */
	opencloser : function(open) {
		this.element.toggleClass('trans_disabled');
		// focus only when opening
		if (open) {
			this.inputField.focus();
		} else {
			// clear on the end
			this.inputField.val('');
			this.listUl.html('');
		}
	},

	/**
	 * Happens on everykeyup
	 * @param  {boolean} force will force refresh
	 */
	keypress: function(force){
		var currentVal = this.inputField.val();
		var replacedVal = currentVal.replace('..', ''); // Two dots switch language

		if (replacedVal !=  currentVal ) {
			this.switchLang();
			this.changeAlert();
			this.inputField.val(replacedVal);
			this.fetch(force);
		}

		if (currentVal.length == 2 ) {				// language changing sequence deteced
			if ( currentVal.match(/^(\.[anfsmtr])/g) ) {
				this.from = true;
				this.changeLang(currentVal[1]);
				this.inputField.val('');
				this.changeAlert();
				return false;
			} else if ( currentVal.match(/^([anfsmtr]\.)/g) ) {
				this.from = false;
				this.changeLang(currentVal[0]);
				this.inputField.val('');
				this.changeAlert();
				return false;
			}
		}
		if ( currentVal.length < 2 ) {
			this.listUl.html('');
			return true;
		}
		this.fetch(force);
	},

	/**
	 * Stuff what happens after keystroke language change
	 */
	changeAlert: function(){
		this.langFirstLi.addClass('trans_magician_alert');
		setTimeout( function(){
			this.langFirstLi.removeClass('trans_magician_alert');
		}.bind(this) , 400);
	},

	/**
	 * Grab text from input at fetch results
	 * @param  {string} force will download word even when string did not change
	 */
	fetch : function(force) {
		var currentVal = this.inputField.val();
		if ( ( (currentVal == this.lastVal)  && !force ) || currentVal.length < 2 || currentVal.match(/[\.,\/\\]/) ) {
			return true;
		}
		clearTimeout(this.timeout);
		this.timeout = setTimeout(function () {
			this.sauce.call(this, currentVal);
		}.bind(this), this.delay );
	},

	azet: function(query){
		jQuery.get(this.url.azet + this.langString , {q: query }, function(data, textStatus) {
			var words = [],
				rawWords = jQuery('table.p:not(.poslovach)', data);

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

	/**
	 * Write results to the UL
	 */
	render : function() {
		if (!this.words) console.error('missing words');
		this.listUl.html('');

		for(var word in this.words ) {
			var current = this.words[word];
			$('<li/>').text( current.to.join(' | ') )
						.prepend($('<b/>').text(current.from))
						.appendTo(this.listUl);
			if (word > 10) {
				break;
			}
		}
		this.listUl.appendTo(this.element);
	},

	/**
	 * Keys that open main window
	 * @param  {object} event jQuery event
	 */
	open_key : function(event) {
		if (event.keyCode == this.letterKey && event.altKey) {
			event.preventDefault();
			event.stopPropagation();
			this.opencloser(true);
			return false;
		}
	},

	/**
	 * Keys that close the main windows
	 * @param  {object} event jQuery event
	 */
	close_key : function(event) {
		// enter & esc
		if (( event.keyCode == 27 ) && !this.element.hasClass('trans_disabled')) {
			event.preventDefault();
			event.stopPropagation();
			this.opencloser(false);
			return false;
		}
	}
};

showMagic.init();

}());
