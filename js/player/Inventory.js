export class Inventory {
    constructor() {
        this.slots = new Array(9);
        this.selected = 0;

        this.slots[0] = 1;   // Stone
        this.slots[1] = 2;   // Grass
        this.slots[2] = 3;   // Dirt
        this.slots[3] = 4;   // Cobblestone
        this.slots[4] = 5;   // Planks
        this.slots[5] = 6;   // Sapling/Bush
        this.slots[6] = 7;   // Bedrock/Unbreakable
        this.slots[7] = 8;   // Water (flowing)
        this.slots[8] = 9;   // Water (still)
    }

    getSelectedSlotId() {
        return this.slots[this.selected];
    }

    scroll(direction) {
        if (direction > 0) direction = 1;
        if (direction < 0) direction = -1;
        this.selected -= direction;
        while (this.selected < 0) this.selected += this.slots.length;
        while (this.selected >= this.slots.length) this.selected -= this.slots.length;
    }

    selectSlot(index) {
        if (index >= 0 && index < this.slots.length) {
            this.selected = index;
        }
    }

    pickBlock(blockId) {
        if (blockId <= 0) return;
        for (let i = 0; i < this.slots.length; i++) {
            if (this.slots[i] === blockId) {
                this.selected = i;
                return;
            }
        }

        if (Inventory.ALLOWED_TILES.includes(blockId)) {
            this.slots[this.selected] = blockId;
        }
    }

    static ALLOWED_TILES = [
        1, 2, 3, 4, 5, 6, 7, 8, 9,       // rock, grass, dirt, cobble, planks, bush, bedrock, water, calmWater
        10, 11, 12, 13,                     // lava, calmLava, sand, gravel
        14, 15, 16,                         // goldOre, ironOre, coalOre
        17, 18, 19, 20,                     // log, leaves, sponge, glass
        21, 22, 23, 24, 25, 26, 27, 28,    // wool colors (white..gray)
        29, 30, 31, 32, 33, 34, 35, 36,    // wool colors (lightGray..black)
        37, 38, 39, 40,                     // yellowFlower, redRose, brownMushroom, redMushroom
        41                                   // goldBlock
    ];
}