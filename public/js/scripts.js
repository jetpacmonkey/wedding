(function($, undefined) {
	if (typeof console == "undefined") {console = { log: function() {} }; console.error = console.warn = console.log;}

	var content = $("#content"),
		views = $("#views"),
		MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
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

	var actions = {
		"edit": $("<div>").addClass("editGuest oneAction").text("Edit"),
		"save": $().add($("<div>").addClass("saveEdit oneAction").text("Save")).
			add($("<div>").addClass("cancelEdit oneAction").text("Cancel")).
			add($("<div>").addClass("deleteGuest oneAction").text("Delete")),
		"new": $("<div>").addClass("saveGuest oneAction").text("Save")
	};

	function setAction(tr, action) {
		tr.find(".action").html(actions[action].clone());
	}

	function fillRow(tr, data, action) {
		if (arguments.length < 3) {
			action = "edit";
		}
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
		setAction(tr, action);
		tr.removeClass("newGuest").addClass("oneGuest");
		tr.data("vals", data);
	}

	function fillTotalsRow(tr, data, totals, plusOneData) {
		tr.find(".field").each(function() {
			var cell = $(this),
				field = cell.data("field"),
				val = data[field] || 0;

			if (plusOneData) {
				var plusOneVal = plusOneData[field] || 0;
				cell.attr("data-base", val).attr("data-plusone", plusOneVal);
				val += plusOneVal;
			}
			cell.text(val);
			if (totals) {
				totals[field] = (totals[field] || 0) + val;
			}
		});
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

		function loadTotals(callback) {
			loading(true);
			$.get("actions/guests.php", {
				"action": "totals"
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

			navItem.addClass("selected");
			if (prevItem.length) {
				prevItem.removeClass("selected");
				main.removeClass(prevItem.data("subview"));
			}
			main.html(subviews.find("." + subview).clone(true).children()).addClass(subview);

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
			} else if (subview == "totals") {
				loadTotals(function(data) {
					var totals = {};
					main.find(".oneType").each(function() {
						var row = $(this),
							type = row.data("type"),
							includePlusOne = row.hasClass("includePlusOne") && "plus_one" in data;

						fillTotalsRow(
							row,
							data[type] || {},
							totals,
							includePlusOne ? data.plus_one : null
							);
					});

					//individual types all done, let's fill in the total row
					fillTotalsRow(
							main.find(".total"),
							totals
							);
				});
			}
		});

		//"add" subview handlers
		var subview_add = subviews.children(".add");
		subview_add.find("table").off().on("click", ".newGuest .saveGuest", function() {
			var vals = {},
				row = $(this).closest(".newGuest"),
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
		}).on("click", ".editGuest", function() {
			var row = $(this).closest("tr"),
				vals = row.data("vals"),
				newGuestRow = subview_add.find(".newGuest");

			row.find("[data-field]").each(function() {
				var cell = $(this),
					field = cell.data("field"),
					val = vals[field],
					templateCell = newGuestRow.find("[data-field='" + field + "']").clone();

				cell.empty().append(templateCell);
				var input = cell.find("input, select");
				if (input.is(":checkbox")) {
					input.prop("checked", val);
				} else {
					input.val(val);
				}
			});

			row.addClass("editing");
			setAction(row, "save");
		}).on("click", ".cancelEdit", function() {
			var row = $(this).closest("tr"),
				vals = row.data("vals");

			row.removeClass("editing");
			fillRow(row, vals); //fill in the values that were stored when the row was initially filled, ignoring input values
		}).on("click", ".saveEdit", function() {
			var row = $(this).closest("tr"),
				cells = row.find("[data-field]"),
				vals = {},
				id = row.data("id");

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
				"action": "edit",
				"id": id,
				"data": JSON.stringify(vals)
			}).done(function(respData) {
				if (respData.success) {
					fillRow(row, vals);
				} else {
					alert("Failed!");
					console.log(respData.errorMsg);
				}
			}).fail(function(respData) {
				alert("Error!");
				console.log(respData);
			});
		}).on("click", ".deleteGuest", function() {
			var row = $(this).closest("tr"),
				id = row.data("id");

			$.post("actions/guests.php", {
				"action": "delete",
				"id": id
			}).success(function(respData) {
				if (respData.success) {
					row.remove();
				} else {
					alert("Error!");
					console.log(respData);
				}
			}).fail(function(respData) {
				alert("Error!");
				console.log(respData);
			});
		});

		setAction(subview_add.find(".newGuest"), "new");
	}

	function addChoices(div, id, field, checked) {
		var yChoice = $("<div>", {
				"class": "oneChoice"
			}),
			nChoice = $("<div>", {
				"class": "oneChoice"
			});

		yChoice.append(
			$("<input>", {
				"id": id + field + "Y",
				"type": "radio",
				"name": id + field,
				"checked": !!checked
			}).data("val", true)
		).append(
			$("<label>", {
				"for": id + field + "Y"
			}).text("Yes")
		);

		nChoice.append(
			$("<input>", {
				"id": id + field + "N",
				"type": "radio",
				"name": id + field,
				"checked": checked === false
			}).data("val", false)
		).append(
			$("<label>", {
				"for": id + field + "N"
			}).text("No")
		);

		div.append(yChoice).append(nChoice);

		var prevSelected = div.find(":radio:checked");
		div.find("input").off().on("click", function() {
			var $this = $(this),
				fieldDiv = $this.closest(".oneField"),
				row = fieldDiv.closest(".oneGuest"),
				field = fieldDiv.data("field"),
				id = row.data("id"),
				data = {};

			console.log(this);

			if (!$this.prop("checked") || $this.is(prevSelected)) {
				return;
			}

			data[field] = $this.data("val");

			$.post("actions/guests.php", {
				"action": "respond",
				"id": id,
				"data": JSON.stringify(data)
			}).success(function(respData) {
				if (respData.success) {
					var responded = new Date();

					var dateDiv = row.find(".responseDate");

					if (!dateDiv.length) {
						dateDiv = $("<div>").addClass("responseDate");
						row.append(dateDiv);
					}
					dateDiv.text("Responded " +
						MONTH_NAMES[responded.getMonth()] + " " +
						responded.getDate() + ", " +
						responded.getFullYear());

					prevSelected = $this;
				} else {
					alert("Error!");
					console.log(respData);
					$this.prop("checked", false);
					prevSelected.prop("checked", true);
				}
			}).fail(function(respData) {
				alert("Error!");
				console.log(respData);
				$this.prop("checked", false);
				prevSelected.prop("checked", true);
			});
		});
	}

	function setGuestHandlers() {
		var loaded,
			loading = false;

		//function that fills in the "results" area based on the contents of the loaded array defined above.
		//takes one parameter that filters based on last name
		function showLoaded(filterText) {
			if (arguments.length < 1) {
				filterText = "";
			}
			filterText = filterText.toUpperCase();
			var filtered, i, ii;
			if (filterText) {
				filtered = [];
				for (i=0, ii=loaded.length; i<ii; ++i) {
					if (
						loaded[i].last_name.toUpperCase().indexOf(filterText) !== -1 ||
						loaded[i].family_name.toUpperCase().indexOf(filterText) !== -1
						) {
						filtered.push(loaded[i])
					}
				}
			} else {
				filtered = loaded;
			}

			var resultsArea = content.find(".main.results"),
				guestTemplate = $(".oneGuest.template"),
				anyPlusOne = false;

			resultsArea.find(".oneGuest").remove();

			for (i=0, ii=filtered.length; i<ii; ++i) {
				var div = guestTemplate.clone(true).removeClass("template"),
					guestData = filtered[i];

				div.data("id", guestData.id);

				guestData.name =
					guestData.first_name +
					(guestData.first_name && guestData.last_name ? " " : "") +
					guestData.last_name;

				if (guestData.responded === null) {
					guestData.attending = guestData.plus_one = null; //if they haven't responded, don't preselect "No"
				} else {
					guestData.responded = new Date(guestData.responded);
				}

				//fill in fields
				div.find(".oneField").each(function() {
					var $this = $(this),
						field = $this.data("field");
					if ($this.data("type") == "bool") {
						addChoices($this, guestData.id, field, guestData[field]);
					} else {
						$this.text(guestData[field]);
					}
				});

				if (guestData.plus_one_permitted) {
					anyPlusOne = true;
				} else {
					div.find(".oneField.plusOne").remove();
				}

				if (guestData.responded) {
					var dateDiv = $("<div>").addClass("responseDate");
					dateDiv.text("Responded " +
						MONTH_NAMES[guestData.responded.getMonth()] + " " +
						guestData.responded.getDate() + ", " +
						guestData.responded.getFullYear());
					div.append(dateDiv);
				}

				resultsArea.append(div);
			}

			if (filtered.length) {
				resultsArea.removeClass("noResults");
			} else {
				resultsArea.addClass("noResults");
			}

			if (anyPlusOne) {
				resultsArea.removeClass("noPlusOne");
			} else {
				resultsArea.addClass("noPlusOne");
			}
		}

		$(".lookup-last").off().on("keyup change", function() {
			var input = $(this),
				val = input.val(),
				firstLetter = val.charAt(0),
				prevFirstLetter = input.data("firstletter");

			if (val) {
				input.addClass("hasValue");
			} else {
				input.removeClass("hasValue");
			}

			if (loading) {
				return;
			}

			if (firstLetter != prevFirstLetter) {
				//clear out previously loaded entries
				loaded = [];
				showLoaded();

				if (firstLetter) {
					loading = true;
					$.getJSON("actions/guests.php", {
						"action": "load",
						"startsWith": firstLetter,
						"cacheBuster": (new Date()).getTime()
					}).done(function(respData) {
						loaded = respData;
						input.data("firstletter", firstLetter);
						loading = false;
						input.change();
					});
				}
			} else {
				showLoaded(val);
			}
		});
	}

	setLoginHandlers();
	setAdminHandlers();
	setGuestHandlers();

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
