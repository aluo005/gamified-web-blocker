// gridSelector.js

function isoToScreen(x, y, tileWidth, tileHeight) {
    return {
        x: (x - y) * (tileWidth / 2),
        y: (x + y) * (tileHeight / 4)
    }
}

class GridSelector {
    constructor(x, y, grid_x, grid_y, x_offset, y_offset) {
        this.x = x;
        this.y = y;
        this.grid_x = grid_x;
        this.grid_y = grid_y;
        this.x_offset = x_offset;
        this.y_offset = y_offset;
        this.image = document.getElementById('gridSelector');
        this.size = 64;
        this.frameY = 0;
    }

    draw(ctx) {
        const pos_x = this.x + this.x_offset;
        const pos_y = this.y + this.y_offset;

        ctx.drawImage(this.image, pos_x, pos_y, this.size, this.size);
    }

    resetPosition(tileWidth, tileHeight, x_offset, y_offset) {
        this.x_offset = x_offset;
        this.y_offset = y_offset;
        this.tileWidth = tileWidth;
        this.tileHeight = tileHeight;
        this.size = 64;
        this.x = isoToScreen(this.grid_x, this.grid_y, tileWidth, tileHeight).x; 
        this.y = isoToScreen(this.grid_x, this.grid_y, tileWidth, tileHeight).y;
    }
}

export default GridSelector;