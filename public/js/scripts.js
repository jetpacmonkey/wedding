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

	function fillRow(tr, data) {
		tr.find("td").each(function() {
			var field = $(this).data("field"),
				val = data[field];

			if (field) {
				if (val === !!val) {
					//is bool
					val = (val ? "Y" : "N");
				}
				$(this).text(val);
			}
		});
		tr.find(".action").removeClass("saveGuest").text("Edit");
		tr.removeClass("newGuest");
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
						fillRow(tr, data[i]);
						tr.data("id", data[i].id);
						tr.insertBefore(newGuest);
					}
				});
			}
		});

		//"add" subview handlers
		var subview_add = subviews.children(".add");
		subview_add.find("table").off().on("click", ".newGuest .saveGuest", function() {
			var vals = {},
				row = $(this).parents(".newGuest"),
				cells = row.find("[data-field]");

			cells.each(function() {
				var cell = $(this),
					field = cell.data("field");
					input = cell.find("input, select");

				if (input.is(":checkbox")) {
					vals[field] = input.prop("checked");
				} else {
					vals[field] = input.val();
				}
			});


			$.post("actions/guests.php", {
				"action": "add",
				"data": JSON.stringify(vals)
			}).done(function(respData) {
				var tr = row.clone();
				fillRow(tr, vals);
				tr.data("id", respData.id);
				tr.insertBefore(row);

				var checkBoxes = cells.find(":checkbox").prop("checked", false);
				cells.find("input, select").not(checkBoxes).val("");
			}).fail(function(respData) {
				alert("Failed!");
				console.log(respData);
			});
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
