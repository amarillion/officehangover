// Copyright (c) 2017, TOPdesk. Please see the AUTHORS file for details.
// All rights reserved. Use of this source code is governed by a MIT-style
// license that can be found in the LICENSE file.

import DefaultSprite from "./DefaultSprite";
import PLAYER_DATA from "./player_data.json";

/**
 * A follower is an object, like a beer crate, that follows the player around
 * after it is picked up.
 */
export default class extends DefaultSprite {
	constructor(state, key) {
		super(state.game, state.player.x, state.player.y, PLAYER_DATA[key].sprite);

		this.followee = state.player;
		// queue of coordinates of the followee
		this.followeeq = [[state.player.x, state.player.y]];
		this.bobbingPhase = 0;

		this.key = key;
		this.state = state;
		this.game = state.game;
		this.data = Object.create(PLAYER_DATA[key]);
		this.anchor.setTo(0, 0);
	}

	update() {
		// current coordinates of followee
		var fx = this.followee.x;
		var fy = this.followee.y;

		// previous coordinates in queue
		var qend = this.followeeq.length - 1;
		var prevx = this.followeeq[qend][0];
		var prevy = this.followeeq[qend][1];

		// push next coordinates on queue, but only if they are different
		if (prevx != fx || prevy != fy) {
			this.followeeq.push([fx, fy]);
		}

		// calculate bobbing motion
		this.bobbingPhase += 0.2;
		while (this.bobbingPhase > Math.PI) this.bobbingPhase -= Math.PI;
		var bobbingAmplitude = 6;
		var bobbingMotion = (bobbingAmplitude * Math.sin(this.bobbingPhase));

		this.x = this.followeeq[0][0];
		this.y = this.followeeq[0][1] - bobbingMotion;

		// if the queue is longer than a certain length, start shifting values away
		if (this.followeeq.length > 8) {
			this.followeeq.shift();
		}
	}
}
