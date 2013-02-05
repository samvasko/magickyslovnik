$(function() {
	$(document).keydown(function(event){
		if (event.keyCode == 83 && event.altKey) {
			showMagic();
			return false;
		}
	});

	function showMagic() {
		console.log( "hej!" );
		$(document.body).prepend('<input id="slovnikvloz" type="text" name="slovnikuj" >');
	}
}());