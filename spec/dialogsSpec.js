import dialogs from "../assets/data/dialogs.json";

import floor1 from "../assets/data/floor1-tilemap.json";
import floor2 from "../assets/data/floor2-tilemap2.json";

describe("Example", function() {

	for (let dialogKey in dialogs) {
		it(dialogKey + " should define start options", function() {		
			expect(dialogs[dialogKey].start_options).toBeDefined();
		});
	}

	for (let floor of [floor1, floor2]) {
		it("level should contain correct set of layers", function() {
			expect(floor.layers).toBeDefined();
			expect(floor.layers.length).toEqual(5);
			
			let expectedLayers = [
				{ name: "Floor and Walls", type: "tilelayer" },
				{ name: "Shadows", type: "tilelayer" },
				{ name: "Bottom Objects", type: "tilelayer" },
				{ name: "Top Objects", type: "tilelayer" },
				{ name: "Objects", type: "objectgroup" }
			]

			for (let l = 0; l < 5; ++l) {
				expect(floor.layers[l].type).toEqual(expectedLayers[l].type);
				expect(floor.layers[l].name).toEqual(expectedLayers[l].name);
			}
			
		});

		let objects = floor.layers[4].objects;
		
		it("Objects should be of suitable type", function() {
			let allowedTypes = [ "Character", "Exit", "Start", "Door", "Actionable", 
				"BeerCrateDropZone", "DishWasher", "DirtyDishes" ];

			for (let object of objects) {
				expect(allowedTypes).toContain(object.type);
			}
		});

		it("Referenced dialog keys should exist", function() {		
			for (let object of objects) {
			
				expect (object.properties).toBeDefined();

				if (object.type !== "Character" && object.type !== "Actionable") { continue; }
				
				let dialogKey = object.properties["dialogkey"];
				
				if (dialogKey !== undefined) {
					expect(Object.keys(dialogs)).toContain(dialogKey);
				}
			}
		});

	}

});
