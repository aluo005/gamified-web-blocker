// item.js
import { resources } from '../exports/resources.js';
import { grid } from '../exports/worldGrid.js';
import constants from '../exports/constants.js';

function isoToScreen(x, y, tileWidth, tileHeight) {
    return {
        x: (x - y) * (tileWidth / 2),
        y: (x + y) * (tileHeight / 4)
    }
}

class Item {
    constructor(x, y, grid_x, grid_y, width, height, image, tileWidth, tileHeight, spriteName, dWidth, dHeight, sizemult) {
        this.x = x;
        this.y = y;
        this.real_x = x;
        this.real_y = y;
        this.grid_x = grid_x;
        this.grid_y = grid_y;
        this.tileWidth = tileWidth;
        this.tileHeight = tileHeight;
        this.image = image;
        this.width = width;
        this.height = height;
        this.spriteName = spriteName;
        this.defaultWidth = dWidth;
        this.defaultHeight = dHeight;
        this.sizemult = sizemult;
    }
    
    draw(ctx) {
        ctx.drawImage(this.image, this.x, this.y, this.size, this.size);
    }

    reposition(tileWidth, tileHeight, num1, num2) {
        this.size *= num2;
        this.x = isoToScreen(this.grid_x, this.grid_y, tileWidth, tileHeight).x; 
        this.y = isoToScreen(this.grid_x, this.grid_y, tileWidth, tileHeight).y;
        this.tileWidth = tileWidth;
        this.tileHeight = tileHeight;
        this.width *= num2;
        this.height *= num2;
    }

    resetPosition(tileWidth, tileHeight, x_offset, y_offset) {
        this.x_offset = x_offset;
        this.y_offset = y_offset;
        this.tileWidth = tileWidth;
        this.tileHeight = tileHeight;
        this.width = this.defaultWidth;
        this.height = this.defaultHeight;
        this.x = isoToScreen(this.grid_x, this.grid_y, tileWidth, tileHeight).x; 
        this.y = isoToScreen(this.grid_x, this.grid_y, tileWidth, tileHeight).y;
    }
}

class Tree extends Item {
    constructor(x, y, grid_x, grid_y, width, height, tileWidth, tileHeight, x_offset, y_offset, spriteName) {
        const treeImage = resources.images.tree[spriteName];
        const dWidth = 64;
        const dHeight = 96;

        super(x, y, grid_x, grid_y, width, height, treeImage, tileWidth, tileHeight, spriteName, dWidth, dHeight, 1.5);
        this.x_offset = x_offset;
        this.y_offset = y_offset;
    }

    draw(ctx) {
        const pos_x = this.x + this.x_offset - (this.width/6)*this.sizemult;
        const pos_y = this.y + this.y_offset - (this.height - this.height/6)*this.sizemult;
        this.real_x = pos_x;
        this.real_y = pos_y;

        ctx.drawImage(this.image.image, pos_x, pos_y, this.width*this.sizemult, this.height*this.sizemult);
    }

    clone() {
        return new Tree(this.x, this.y, this.grid_x, this.grid_y, this.width, this.height, this.tileWidth, this.tileHeight, this.x_offset,
            this.y_offset, this.spriteName);
    }

    checkIfClicked(x, y, spriteGrid) {
        const relativeX = Math.floor((x-this.real_x)/((this.width*this.sizemult)/this.defaultWidth));
        const relativeY = Math.floor((y-this.real_y)/((this.height*this.sizemult)/this.defaultHeight));
        if(spriteGrid[relativeY][relativeX] === 1){
            console.log(`Item position at: (${this.grid_x}, ${this.grid_y})`);
            return true;
        }
        return false;
    }
}

class Bench extends Item {
    constructor(x, y, grid_x, grid_y, width, height, tileWidth, tileHeight, x_offset, y_offset, spriteName, rotation) {
        const dWidth = 32;
        const dHeight = 32;

        super(x, y, grid_x, grid_y, width, height, document.getElementById('bench1Image'), tileWidth, tileHeight, spriteName, dWidth, dHeight, 2);
        this.x_offset = x_offset;
        this.y_offset = y_offset;
        this.rotationOrder = [0, 1, 3, 2];
        this.currRotation = rotation;
        this.frameX = 0;
        this.frameY = this.rotationOrder[rotation];
        this.occupied = false;
    }

    draw(ctx) {
        const pos_x = this.x + this.x_offset;
        const pos_y = this.y + this.y_offset - this.height;
        this.real_x = pos_x;
        this.real_y = pos_y;

        ctx.drawImage(this.image, this.frameX*this.defaultWidth, this.frameY*this.defaultHeight, 
            this.defaultWidth, this.defaultHeight, pos_x, pos_y, this.width*this.sizemult, this.height*this.sizemult);
    }

    clone() {
        return new Bench(this.x, this.y, this.grid_x, this.grid_y, this.width, this.height, 
            this.tileWidth, this.tileHeight, this.x_offset, this.y_offset, this.spriteName, this.currRotation);
    }

    checkIfClicked(x, y, spriteGrid) {
        if(grid[this.grid_x][this.grid_y] !== constants.BENCH_ON_TILE_SITTING){
            const initpos = this.frameY*this.defaultHeight
            const spriteGridCurr = spriteGrid.slice(initpos, initpos+this.defaultHeight);
    
            const relativeX = Math.floor((x-this.real_x)/((this.width*this.sizemult)/this.defaultWidth));
            const relativeY = Math.floor((y-this.real_y)/((this.height*this.sizemult)/this.defaultHeight));
            if(spriteGridCurr[relativeY][relativeX] === 1){
                console.log(`Item position at: (${this.grid_x}, ${this.grid_y})`);
                return true;
            }
        }
        return false;
    }

    rotate() { 
        if(this.currRotation + 1 > 3){
            this.currRotation = 0
        } else {
            this.currRotation++;
        }
        this.frameY = this.rotationOrder[this.currRotation];
    }
}


export { Item, Tree, Bench };