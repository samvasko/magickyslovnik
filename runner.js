$(function() {
	$(document).keydown(function(event){
		if (event.keyCode == 83 && event.altKey) {
			showMagic();
			return false;
		}
	});

	function showMagic() {
		console.log( "hej!" );
		var body = $('<div/>', { "id": magician});
		$('<input/>', {name: "searchmagic", })
	}
}());