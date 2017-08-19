import * as Constants from "../constants";

export default class {
	constructor(state, objectname, character) {
		this.state = state;
		this.game = state.game;
		this.objectname = objectname;
		this.character = character;
		this.dialogs = JSON.parse(this.game.cache.getText(Constants.DIALOGS));
	}

	popup() {
		var objectDialogs = this.dialogs[this.objectname];
		if (!(this.objectname in this.dialogs)) {
			console.error("No dialog found using key: " + this.objectname);
		}
		else {
			this.showStartDialog(objectDialogs);
		}
	}

	showStartDialog(objectDialogs) {
		var dialog = this;
		var dialogStartId = dialog.findDialogStart(objectDialogs.start_options, objectDialogs.messages);
		dialog.showDialog(objectDialogs, dialogStartId);
	}

	showDialog(objectDialogs, id) {
		var game = this.game;
		var state = this.state;
		var dialog = this;

		this.state.uiBlocked = true;

		// calculate a reasonable margin, 10% of width or 10% of height, whichever is smaller.
		this.margin = Math.min(this.game.width / 10, this.game.height / 10);
		this.lineHeight = 100;

		this.y = this.margin;
		this.x = this.margin;
		this.w = this.game.width - 2 * this.margin;
		this.h = this.game.height - 2 * this.margin;

		// running y counter
		var yy = this.y;

		this.objects = [];

		// semi-transparent black background
		var bg = game.add.graphics(game.width, game.height);
		bg.beginFill("#000000", 0.7);
		bg.x = this.x;
		bg.y = this.y;
		bg.drawRect(0, 0, this.w, this.h);
		bg.fixedToCamera = true;

		this.objects.push(bg);

		var currentObjectDialog = dialog.findDialog(objectDialogs.messages, id);

		var msgWidget = this.game.add.text(this.x, yy, currentObjectDialog.message, {'fill': '#FFA500'});
		msgWidget.wordWrap = true;
		msgWidget.wordWrapWidth = dialog.w;

		msgWidget.fixedToCamera = true;
		const PADDING = 16;
		yy += msgWidget.height + 2 * PADDING;

		this.objects.push(msgWidget);

		currentObjectDialog.replies.forEach(function (replyOption) {
			if (replyOption.condition) {
				var result = dialog.conditionsSatisfyGameState(replyOption.condition);
				if (!result) return; // skip this option
			}

			var optionWidget = game.add.text(dialog.x, yy, replyOption.message, {'fill': '#00FFA5'});
			optionWidget.wordWrap = true;
			optionWidget.wordWrapWidth = dialog.w;

			yy += optionWidget.height + PADDING;

			optionWidget.fixedToCamera = true;
			optionWidget.inputEnabled = true;
			optionWidget.events.onInputDown.add(function () {
				dialog.close();
				if (replyOption.goto) {
					dialog.showDialog(objectDialogs, replyOption.goto);
				}
				if (replyOption.actions) {
					replyOption.actions.forEach(function (action) {
						if (action == "dirtydishes"){
							this.character.dirtyDishesAction();
						} else if(action == "pick_mobile"){
							this.character.pickMobile();
						} else if (action === "pickup_beercrate") {
							this.state.player.pickup(this.character);
						}
					}, this);
				}
				if (replyOption.setflag) {
					replyOption.setflag.forEach(function (flag) {
						console.log("Flag " + flag + " is set");
						state.flags[flag] = 1;
					});
				}
				if (replyOption.clearflag) {
					replyOption.clearflag.forEach(function (flag) {
						console.log("Flag " + flag + " is cleared");
						state.flags[flag] = 0;
					});
				}

			}, this);

			dialog.objects.push(optionWidget);
		}, this);
	}

	findDialogStart(startOptions, objectMessages) {
		var dialog = this;
		for (var i = 0; i < startOptions.length; i++) {
			var startOptionId = startOptions[i];
			var startOptionValue = dialog.findDialog(objectMessages, startOptionId);
			// first option that has no condition or a condition that is satisfied
			if (!startOptionValue.condition || dialog.conditionsSatisfyGameState(startOptionValue.condition)) {
				return startOptionId;
			}
		}
		//TODO do we need error handling?
	}

	findDialog(dialogs, idToFind) {
		for (var i = 0; i < dialogs.length; i++) {
			if (dialogs[i].id === idToFind) {
				return dialogs[i];
			}
		}
		return null;
	}

	conditionsSatisfyGameState(condition) {
		// turn the condition string into a javascript function and evaluate it
		var conditionFunc = new Function("state", condition);
		var result = conditionFunc(this.state);
		console.log("Checking condition: " + condition + " which results in " + result);
		return result;
	}

	close() {
		this.state.uiBlocked = false;
		this.character.isExecutingTask = false;

		// destroy all components of the dialog
		this.objects.forEach(function (element) {
			element.destroy();
		});
	}
}
