(function($, undefined) {
	var content = $("#content");
	function loading(isLoading) {
		if (isLoading) {
			content.addClass("loading");
		} else {
			content.removeClass("loading");
		}
	}

	function setLoginHandlers() {
		$("input").off().on("keyup change", function() {
			if ($(this).val()) {
				$(this).addClass("hasValue");
			} else {
				$(this).removeClass("hasValue");
			}
		}).on("keyup", function(e) {
			if (e.which == 13) {
				$("button.login").click();
			}
		});

		$("button.login").off().on("click", function() {
			loading(true);
			var data = {};
			content.find("input").each(function() {
				data[$(this).data("field")] = $(this).val();
			});
			var jqxhr = $.post("actions/login.php", data);

			jqxhr.done(function() {

			}).fail(function() {

			}).always(function() {
				loading(false);
			});
		});
	}

	setLoginHandlers();
})(jQuery.noConflict());


