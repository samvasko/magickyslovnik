/**
 * Samuel Vasko 2013
 * samvasko@gmail.com | samuelvasko.tk
 * Dictionary magic
 */

$(function() {

var showMagic = {

	letterKey: 83, // S
	lastVal: '', // last value from input
	words: [],
	sauce: 0,
	template: chrome.extension.getURL('template.html'),
	url: {
		azet: 'http://slovnik.azet.sk/preklad/',
		thesaurus: 'http://words.bighugelabs.com/api/2/4fa90f8d3320ec7bcdbff4f49cf85c5d/'
	},
	matching: {
		from: /^\.[anfsmtr]/g,
		to: /^[anfsmtr]\./g
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
		jQuery.get(this.template, this.bindEvents.bind(this));

		// TODO: move this to the opening method
		// this.from = true;
		// this.changeLang('a');

		// pick sauce
		this.sauce = this.azet.bind(this);

		// bind keys
		$(document).keydown( this.openKey.bind(this) );
		$(document).keyup( this.closeKey.bind(this) );
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
	 * Bind javascript events on template
	 * @param  {string} data Unparsed template
	 */
	bindEvents: function(data) {

		// Parse template
		var template = $(data),
			langUl = $('.languages', template),
			langList = this.createList();

		langUl.append(langList);

		langUl.hover(
			function() { this.langUl.addClass('visible'); },
			function() { this.langUl.removeClass('visible'); }
		);

		var langFirstLi = langUl.children().first(),
			langDropownLi = langFirstLi.siblings();

		langFirstLi.click(this.switchLang.bind(this));

		// dropdown to change
		langFirstLi.siblings().click(function() {
			if ( $(this).hasClass('disabled') ) {
				return false;
			}
			this.changeLang( $(this).attr('data-lang') );
		});

		$('magic_input', template).on('keyup', this.keypress.bind(this));
		/**
		 * TEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEST
		 *
		 */
		this.langFirstLi = langFirstLi;

		// expose the object for injection
		this.template = template;
	},

	/**
	 * Create list of languages for the dropown picker
	 * @return {mixed} ul of languages with properties
	 */
	createList: function(){
		var list = [];
		for (var one in this.languages ) {
			list.push($('<li/>', {
				'text': this.languages[one].tname,
				'data-lang': one
			}));
		}
		console.log(list);
		return list;
	},

	/**
	 * Switch direciton of translation
	 */
	switchLang: function() {
		this.from = !this.from;
		this.lang = this.shortLangString;
	},

	/**
	 * Change language
	 * @param  {string} slang language name in short format
	 */
	changeLang: function(slang) {
		var selected = this.langDropownLi.filter('[data-lang="' + slang + '"]');
		// disable the selected
		selected.addClass('disabled');
		// enable the disabled !
		selected.siblings().removeClass('disabled');
		// set selected to be current language in head of dropdown and in search
		this.lang = slang;
		// close dropdown
		this.langUl.removeClass('visible');
	},

	/**
	 * Open the main window
	 */
	open: function() {


	},

	close: function() {

	},


	/**
	 * Open or close tha main window
	 * @param  {bool} open 	 are we opening?
	 */
	opencloser : function(open) {

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

		// There were two dots there,
		if (replacedVal != currentVal ) {
			this.switchLang();
			this.changeAlert();
			this.inputField.val(replacedVal);
			this.fetch(force);
		}

		if (currentVal.length == 2 ) {				// language changing sequence deteced
			if ( currentVal.match(this.matching.from) )
			{
				this.fromHandler(currentVal);
				return false;
			}
			else if ( currentVal.match(this.matching.to) )
			{
				this.toHandler(currentVal);
				return false;
			}
			else if (currentVal == 'tt')
			{
				this.thesaurusHandler();
				return false;
			}
		}
		if ( currentVal.length < 3 ) {
			this.listUl.html('');
			return true;
		}
		this.fetch(force);
	},

	/**
	 * Change handlers
	 */
	fromHandler: function(currentVal){
		this.sauce = this.azet;
		this.from = true;
		this.changeLang(currentVal[1]);
		this.inputField.val('');
		this.changeAlert();
	},

	toHandler: function(currentVal){
		this.sauce = this.azet;
		this.from = false;
		this.changeLang(currentVal[0]);
		this.inputField.val('');
		this.changeAlert();
	},

	thesaurusHandler: function(currentVal){
		this.sauce = this.thesaurus;
		this.inputField.val('');
		this.changeAlert();
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

	/**
	 * Azet fetching
	 * @param  {[type]} query [description]
	 * @return {[type]}       [description]
	 */
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
			this.render(words);
		}.bind(this));
	},

	thesaurus: function(query){
		var words = [];
		jQuery.getJSON(this.url.thesaurus + query + '/json').done(
		function(data) {
			for (var type in data) {
				words.push({
					from: type,
					to: data[type]['syn']
				});
			}
			this.render(words);
		}.bind(this)).fail(
		function() {
			return false;
			// error handling
		});
	},

	/**
	 * Write results to the UL
	 */
	render : function(words) {
		if (!words) console.error('missing words');
		this.listUl.html('');

		for(var word in words ) {
			var current = words[word];
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
	openKey : function(event) {
		if (event.keyCode == this.letterKey && event.altKey) {
			event.preventDefault();
			event.stopPropagation();
			this.open();
			return false;
		}
	},

	/**
	 * Keys that close the main windows
	 * @param  {object} event jQuery event
	 */
	closeKey : function(event) {
		// enter & esc
		if (( event.keyCode == 27 ) && !this.element.hasClass('trans_disabled')) {
			event.preventDefault();
			event.stopPropagation();
			this.close();
			return false;
		}
	}
};

showMagic.init();

}());
