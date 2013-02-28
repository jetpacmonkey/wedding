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

		if (name == "admin") {
			content.find(".nav-item:eq(0)").click();
		}
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
		var subviews = views.find(".admin-subviews");

		$(".logoutButton").off().on("click", function() {
			loading(true);
			$.post("actions/logout.php").done(function() {
				setView("login");
			}).fail(function() {

			}).always(function() {
				loading(false);
			});
		});

		function loadGuests(callback) {
			loading(true);
			$.get("actions/guests.php", {
				"action": "load"
			}).done(function(data) {
				callback(data);
			}).always(function() {
				loading(false);
			});
		}

		$(".admin nav .nav-item").off().on("click", function() {
			var main = content.find(".main"),
				navItem = $(this),
				subview = navItem.data("subview"),
				prevItem = navItem.siblings(".selected");

			main.html(subviews.find("." + subview).clone(true).children()).addClass(subview);
			navItem.addClass("selected");
			if (prevItem.length) {
				prevItem.removeClass("selected");
				main.removeClass(prevItem.data("subview"));
			}

			//load/process data required for subview
			if (subview == "add") {
				var newGuest = main.find(".newGuest");
				loadGuests(function(data) {
					for (var i=0, ii=data.length; i<ii; ++i) {
						var tr = newGuest.clone();
						tr.find("td").each(function() {
							var field = $(this).data("field"),
								val = data[i][field];

							if (field) {
								if (val === !!val) {
									//is bool
									val = (val ? "Y" : "N");
								}
								$(this).text(val);
							}
						});
						tr.find(".action").removeClass("saveGuest").text("Edit");
						tr.insertBefore(newGuest);
					}
				});
			}
		});
	}

	setLoginHandlers();
	setAdminHandlers();

	loading(true);
	$.get("actions/status.php").done(function(data) {
		if (data.active) {
			setView(data.type);
		} else {
			setView("login");
		}
	}).fail(function() {
		setView("login");
	}).always(function() {
		loading(false);
	});
})(jQuery.noConflict());
