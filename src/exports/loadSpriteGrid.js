// loadSpriteGrid.js
import { resources } from './resources.js';

export function loadSpriteGrid(callback) {
    resources; // Ensures all images are loaded
    
    const canvas = document.getElementById('hiddencanvas');
    const ctx = canvas.getContext('2d');
    const CANVAS_WIDTH = canvas.width;
    const CANVAS_HEIGHT = canvas.height;

    const itemsToLoad = ['tree', 'bench'];
    const spriteGrids = {};

    itemsToLoad.forEach(type => {
        const t = resources.images[type]
        Object.keys(t).forEach(key => {
            ctx.clearRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);

            const sprite = t[key].image;
            const itemGrid = [];

            const spriteWidth = sprite.width;
            const spriteHeight = sprite.height;
    
            ctx.drawImage(sprite, 0, 0, spriteWidth, spriteHeight);
    
            const imageData = ctx.getImageData(0, 0, spriteWidth, spriteHeight);
            const data = imageData.data;
    
            for (let y = 0; y < spriteHeight; y++) {
                const row = [];
                for (let x = 0; x < spriteWidth; x++) {
                    // Calculate the index for the alpha value in the 1D array
                    const index = (y * spriteWidth + x) * 4;
                    const alpha = data[index + 3];
    
                    // 1 for non-transparent, 0 for transparent
                    row.push(alpha > 0 ? 1 : 0);
                }
                itemGrid.push(row);
            }

            spriteGrids[key] = itemGrid;
        });
    });
    callback(spriteGrids);
}