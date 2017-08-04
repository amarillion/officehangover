import Character from "./Character";
import Follower from "./Follower";
import * as Constants from "../constants";

export default class extends Character {
	constructor(state, x, y, spriteName, data, character, isBodyFrame) {
		super(state, x, y, spriteName, data, character, isBodyFrame);

		this.pickupSprite = null;
		this.pickupTimer = 0; // delay before the next pick-up / drop-off action can take place.
	}

	wakeUp() {
		this.state.uiBlocked = true;
		this.play(Constants.ANIMATION_WAKE_UP);
		this.animations.currentAnim.onComplete.add(function () {
			this.game.time.events.add(Phaser.Timer.SECOND * 0.5, function () {
				this.state.openDialog("wakeup1", this);
			}, this);
		}, this);
	}

	/** check if we can pick up an object. We can only pick up an object if we haven't already picked up one! */
	canPickup() {
		return this.pickupSprite == null && (this.pickupTimer == 0);
	}

	/** idem, we can only drop an object if we picked up one! */
	canDropOff() {
		return this.pickupSprite != null && (this.pickupTimer == 0);
	}

	pickup(pickupObject) {
		if (this.pickupSprite != null) {
			console.error("Trying to pick up two objects!");
			return;
		}
		this.pickupSprite = new Follower(this.state, pickupObject.key);
		pickupObject.destroy(true);
		var pickupSprite = this.pickupSprite;
		this.addChild(pickupSprite);
		this.game.add.existing(pickupSprite);
		this.pickupTimer = 5; // delay before the next pick-up/drop-off action
	}

	dropoff() {
		this.pickupSprite.destroy(true);
		this.pickupSprite = null;
		this.pickupTimer = 5; // delay before the next pick-up/drop-off action
	}

	update() {
		if (this.pickupTimer > 0) {
			this.pickupTimer -= 1;
		}
	}
}