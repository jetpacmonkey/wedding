(function($, undefined) {
	var content = $("#content"),
		views = $("#views");
	function loading(isLoading) {
		if (isLoading) {
			content.addClass("loading");
		} else {
			content.removeClass("loading");
		}
	}

	function setView(name) {
		var copyFrom = views.find("." + name);
		content.html(copyFrom.clone(true).children()).removeAttr("class").addClass(name);
	}

	function setLoginHandlers() {
		$(".login input").off().on("keyup change", function() {
			if ($(this).val()) {
				$(this).addClass("hasValue");
			} else {
				$(this).removeClass("hasValue");
			}
		}).on("keyup", function(e) {
			if (e.which == 13) {
				content.find(".loginButton").click();
			}
		});

		$(".loginButton").off().on("click", function() {
			loading(true);
			var data = {};
			content.find("input").each(function() {
				data[$(this).data("field")] = $(this).val();
			});
			var jqxhr = $.post("actions/login.php", data);

			jqxhr.done(function(data) {
				if (data.success) {
					setView(data.type);
				} else { //login failed

				}
			}).fail(function() {
				console.error("Login failed :(");
			}).always(function() {
				loading(false);
			});
		});
	}

	function setAdminHandlers() {
		$(".logoutButton").off().on("click", function() {
			loading(true);
			$.post("actions/logout.php").done(function() {
				setView("login");
			}).fail(function() {

			}).always(function() {
				loading(false);
			});
		});
	}

	setLoginHandlers();
	setAdminHandlers();

	setView("login");
})(jQuery.noConflict());
