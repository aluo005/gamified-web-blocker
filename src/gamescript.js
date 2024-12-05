import Character from './classes/character.js';
import GridSelector from './classes/gridSelector.js';
import BuildHUD from "./classes/buildHud.js";
import { Item, Tree, Bench } from './classes/item.js';
import { loadSpriteGrid } from './exports/loadSpriteGrid.js';
import { resources } from './exports/resources.js';
import { grid } from './exports/worldGrid.js';
import { retrieveData, updateGrid } from './exports/auth.js'; 
import constants from './exports/constants.js';

window.addEventListener('load', function() {
    retrieveData((data) => {
    console.log(data);
    console.log(resources.images);
    const canvas = document.getElementById('canvas1');
    const header = document.querySelector('header');
    const buildBtn = document.getElementById('buildBtn');
    const ctx = canvas.getContext('2d');

    let CANVAS_WIDTH = canvas.width = window.innerWidth;
    let CANVAS_HEIGHT = canvas.height = window.innerHeight;

    let zoomSize = 1;
    const zoomSpeed = 0.02;
    let tileWidth = 64;
    let tileHeight = 64;
    const characterSize = 48;
    const itemSize = 64;
    const itemDim = {
        thinTree: [64, 96],
        bench: [32, 32]
    };

    let buildToggle = false;

    let Y_OFFSET = CANVAS_HEIGHT/2-(grid.length*tileHeight)/4;
    let X_OFFSET = canvas.width/2-tileWidth/2;
    let canvascoord = canvas.getBoundingClientRect();
    let isDragging = false;

    ctx.imageSmoothingEnabled = false;
    ctx.mozImageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;
    ctx.msImageSmoothingEnabled = false;
    
    const gridSelector = new GridSelector(0, 0, 0, 0, X_OFFSET, Y_OFFSET);
    const buildHud = new BuildHUD();
    let item = null;
    let squareId = 0;
    let itemClicked = null;
    let itemMoved = false;
    const objectsArr = [];
    let spriteGrids = [];

    function isoToScreen(x, y) {
        return {
            x: (x - y) * (tileWidth / 2),
            y: (x + y) * (tileHeight / 4)
        }
    }
    
    // matrix inverse
    function screenToIso(sx, sy) {
        return {
            x: (1/(0.25*tileWidth*tileHeight)) * ((sx*0.25*tileHeight) + (sy*0.5*tileWidth)),
            y: (1/(0.25*tileWidth*tileHeight)) * (-(sx*0.25*tileHeight) + (sy*0.5*tileWidth))
        }
    }

    function updateTheGrid() {
        for(let j = 0; j < objectsArr.length; j++){
            if(objectsArr[j] instanceof Character) objectsArr[j].grid = grid;
        }
    }

    function generateObjects() {
        for(let y = 0; y < grid[0].length; y++) {
            for(let x = 0; x < grid.length; x++) {
                if(Math.random()*100 < 0.5) {
                    objectsArr.push(new Character(isoToScreen(x,y).x, 
                    isoToScreen(x,y).y,
                    x,
                    y,
                    characterSize,
                    0.65,
                    tileWidth,
                    tileHeight,
                    X_OFFSET,
                    Y_OFFSET,
                    grid));
                }
            }
        }
    }

    function checkCharacterSitting() {
        objectsArr.forEach((obj, index) => {
            if(obj instanceof Character) {
                if(obj.sitting) {
                    const benchSitting = objectsArr.find(ob => ob instanceof Item && ob.grid_x === obj.targetX && ob.grid_y === obj.targetY);

                    if(benchSitting && obj){
                        obj.frameY = benchSitting.frameY;

                        const indexBench = objectsArr.indexOf(benchSitting);
                        const indexCharacter = index;
    
                        if(benchSitting.frameY === 0 || benchSitting.frameY === 1){
                            if(indexCharacter < indexBench){
                                objectsArr.splice(indexCharacter, 1);
                                objectsArr.splice(indexBench, 0, obj);
                            }
                        } else if (benchSitting.frameY === 2 || benchSitting.frameY === 3){
                            if(indexBench < indexCharacter){
                                objectsArr.splice(indexBench, 1);
                                objectsArr.splice(indexCharacter, 0, benchSitting);
                            }
                        }
                    }
                }
            }
        });
    }

    function drawGridSelector() {
        if(buildToggle) {
            const screenPos = isoToScreen(gridSelector.grid_x, gridSelector.grid_y);
            gridSelector.x = screenPos.x;
            gridSelector.y = screenPos.y;
            gridSelector.draw(ctx);
        }
    }

    function drawItemSelector() {
        if(buildToggle && item !== null) {
            ctx.globalAlpha = 0.5;
            const screenPos = isoToScreen(item.grid_x, item.grid_y);
            item.x = screenPos.x;
            item.y = screenPos.y;
            item.draw(ctx); 
            ctx.globalAlpha = 1.0;
        }
    } 

    function drawPlatform() {
        const tile = resources.images.tile;
        if(!tile.isLoaded){
            return;
        }
        ctx.clearRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
        for (let y = 0; y < grid[0].length; y++) {
            for (let x = 0; x < grid.length; x++) {
                const pos = isoToScreen(x,y);
                ctx.drawImage(tile.image, pos.x + X_OFFSET, pos.y + Y_OFFSET, tileWidth, tileHeight);
            }
        }
    }

    function updateSprites() {
        drawPlatform();
        objectsArr.sort((a, b) => (a.grid_x + a.grid_y) - (b.grid_x + b.grid_y));
        checkCharacterSitting();

        for (let i = 0; i < objectsArr.length; i++){
            if(objectsArr[i] instanceof Character){
                objectsArr[i].updatePosition();
                objectsArr[i].draw(ctx);
            } else {
                if(itemClicked !== null && itemClicked === objectsArr[i]){
                    ctx.filter = 'brightness(0.5) hue-rotate(90deg)';
                }
                objectsArr[i].draw(ctx);
                ctx.filter = 'none';
            }
        }
    
        drawGridSelector();
        drawItemSelector();
        requestAnimationFrame(updateSprites);
    }

    function animate() {
        updateSprites();
    }
    
    loadSpriteGrid((sprite_grid) => {
        spriteGrids = sprite_grid;

        buildHud.loadContent((square) => {
            const value = square.getAttribute('value');
            const type = square.getAttribute('type');
            if(value === 'blank' && type === 'blank'){
                item = null;
            } else {
                const screenPos = isoToScreen(gridSelector.grid_x, gridSelector.grid_y);
                hideItemToggleHUD();
                if(itemMoved) {
                    resetMoveItem();
                    itemMoved = false;
                }
                resetItemClicked();
                itemClicked = null;

                switch(type){
                    case 'tree':
                        item = new Tree(screenPos.x,screenPos.y,gridSelector.grid_x,gridSelector.grid_y,itemDim.thinTree[0]*((1+zoomSpeed)**((zoomSize-1)*50)),itemDim.thinTree[1]*((1+zoomSpeed)**((zoomSize-1)*50)),tileWidth,tileHeight,X_OFFSET,Y_OFFSET,value);
                        break;
                    case 'bench':
                        item = new Bench(screenPos.x,screenPos.y,gridSelector.grid_x,gridSelector.grid_y,itemDim.bench[0]*((1+zoomSpeed)**((zoomSize-1)*50)),itemDim.bench[1]*((1+zoomSpeed)**((zoomSize-1)*50)),tileWidth,tileHeight,X_OFFSET,Y_OFFSET,value,0);
                        window.addEventListener('keydown', handleItemRotation);
                        break;
                    default:
                        item = null;
                }
            }
        });

        generateObjects();
        animate();
    });

    // Handling reset
    function objectResetPosition(obj) {
        obj.resetPosition(tileWidth, tileHeight, X_OFFSET, Y_OFFSET);
    }
    
    function resetItemClicked() {
        if(itemClicked !== null){
            if(itemClicked instanceof Tree) grid[itemClicked.grid_x][itemClicked.grid_y] = constants.TREE_ON_TILE;
            if(itemClicked instanceof Bench) grid[itemClicked.grid_x][itemClicked.grid_y] = constants.BENCH_ON_TILE;
        }
    }


    // Handles items that rotate
    function handleItemRotation(event) {
        if(item !== null && item instanceof Bench) {
            if(event.key === 'c'){
                item.rotate();
            }
        }
    }


    const isomousecoord = document.getElementById('isomousecoord');
    let startmouseX, startmouseY, prevmouseX = 0, prevmouseY = 0;

    document.addEventListener('mousemove', function(event) {
        const x = event.clientX-canvascoord.left - X_OFFSET - (tileWidth/2);
        const y = event.clientY-canvascoord.top - Y_OFFSET;

        // Includes canvas position offset, position within canvas offset, border width offset,
        // and offsets origin by width/2 (since origin starts at center of sprite, not left)
        const isopos = screenToIso(x,y);
        gridSelector.grid_x = Math.floor(isopos.x);
        gridSelector.grid_y = Math.floor(isopos.y);
        if(item !== null){
            item.grid_x = Math.floor(isopos.x);
            item.grid_y = Math.floor(isopos.y);
        }
        isomousecoord.textContent = `X: ${Math.floor(isopos.x)}, Y: ${Math.floor(isopos.y)}`;
    });

    // Ensures iso position is always correct, even when window is resized
    window.addEventListener('resize', function() {
        canvascoord = canvas.getBoundingClientRect();
        CANVAS_WIDTH = canvas.width = window.innerWidth;
        CANVAS_HEIGHT = canvas.height = window.innerHeight;
        ctx.imageSmoothingEnabled = false;
    });


    // Handles map moving
    canvas.addEventListener('mousedown', (e) => {
        isDragging = true;
        startmouseX = e.clientX;
        startmouseY = e.clientY;
        prevmouseX = 0;
        prevmouseY = 0;
    });

    canvas.addEventListener('mousemove', (e) => {
        if(isDragging) {
            //console.log(X_OFFSET, Y_OFFSET);
            const dx = e.clientX-startmouseX;
            const dy = e.clientY-startmouseY;

            X_OFFSET += dx-prevmouseX;
            Y_OFFSET += dy-prevmouseY;

            // Checking boundaries
            if(X_OFFSET > CANVAS_WIDTH-isoToScreen(0,grid.length-3).x) X_OFFSET = CANVAS_WIDTH-isoToScreen(0,grid.length-3).x;
            if(X_OFFSET < isoToScreen(-(grid[0].length-1),0).x) X_OFFSET = isoToScreen(-(grid[0].length-1), 0).x;
            if(Y_OFFSET > isoToScreen(0,0).y+CANVAS_HEIGHT-tileHeight/2) Y_OFFSET = isoToScreen(0,0).y+CANVAS_HEIGHT-tileHeight/2;
            if(Y_OFFSET < -isoToScreen(grid[0].length-1,grid.length-1).y) Y_OFFSET = -isoToScreen(grid[0].length-1,grid.length-1).y;
            

            for(let i = 0; i < objectsArr.length; i++){
                objectsArr[i].x_offset = X_OFFSET;
                objectsArr[i].y_offset = Y_OFFSET;
            }
            gridSelector.x_offset = X_OFFSET;
            gridSelector.y_offset = Y_OFFSET;

            if(item !== null){
                item.x_offset = X_OFFSET;
                item.y_offset = Y_OFFSET;
            }

            prevmouseX = dx;
            prevmouseY = dy;
        }
    });

    canvas.addEventListener('mouseup', () => {
        isDragging = false;
    });

    canvas.addEventListener('mouseleave', () => {
        isDragging = false;
    });

    // Handles zooming
    window.addEventListener('wheel', (e) => {
        if (e.deltaY > 0) {
            if(zoomSize > 1){
                zoomSize -= zoomSpeed;
                tileWidth /= 1 + zoomSpeed;
                tileHeight /= 1 + zoomSpeed;
    
                for(let i = 0; i < objectsArr.length; i++){
                    objectsArr[i].reposition(tileWidth, tileHeight, -(zoomSpeed+1), 1/(zoomSpeed+1));
                }
                gridSelector.size /= 1 + zoomSpeed;
                
                if(item !== null) item.reposition(tileWidth, tileHeight, -(zoomSpeed+1), 1/(zoomSpeed+1));
            }
        } else if (e.deltaY < 0) {
            if(zoomSize < 2){
                zoomSize += zoomSpeed;
                tileWidth *= 1 + zoomSpeed;
                tileHeight *= 1 + zoomSpeed;
    
                for(let i = 0; i < objectsArr.length; i++){
                    objectsArr[i].reposition(tileWidth, tileHeight,zoomSpeed+1, zoomSpeed+1);
                }
                gridSelector.size *= 1 + zoomSpeed;

                if(item !== null) item.reposition(tileWidth, tileHeight,zoomSpeed+1, zoomSpeed+1);
            }
        }
    })

    document.addEventListener('keydown', (e) => {
        // Handling reset the review
        if(e.code == 'KeyR'){
            tileWidth = 64;
            tileHeight = 64;

            X_OFFSET = CANVAS_WIDTH/2-tileWidth/2;
            Y_OFFSET = CANVAS_HEIGHT/2-(grid.length*tileHeight)/4;
            zoomSize = 1;

            for(let i = 0; i < objectsArr.length; i++){
                objectResetPosition(objectsArr[i]);
            }
            objectResetPosition(gridSelector);
            if(item !== null){
                objectResetPosition(item);
            }
        }
    });

    // Detects whether an item is clicked or not 
    canvas.addEventListener('click', (e) => {
        if(buildToggle && item === null){
            const x = e.clientX - canvascoord.left;
            const y = e.clientY - canvascoord.top;
    
            for(let i = objectsArr.length-1; i >= 0; i--) {
                const s = objectsArr[i];
                if (s instanceof Item){
                    if (x >= s.real_x && x < s.real_x+s.width*s.sizemult && y >= s.real_y && y < s.real_y+s.height*s.sizemult){
                        if(s.spriteName in spriteGrids && s.checkIfClicked(x, y, spriteGrids[s.spriteName])){
                            resetItemClicked();
                            itemClicked = s;
                            grid[s.grid_x][s.grid_y] = constants.TILE_OCCUPIED;
                            showItemToggleHUD();
                            break;
                        }
                    }
                }
            }
        }
    });

    // Build mode: Puts item down
    canvas.addEventListener('click', (e) => {
        const x = e.clientX - canvascoord.left;
        const y = e.clientY - canvascoord.top;

        const isopos = screenToIso(x-canvascoord.left - X_OFFSET - (tileWidth/2), y-canvascoord.top - Y_OFFSET);
        isopos.x = Math.floor(isopos.x);
        isopos.y = Math.floor(isopos.y);
        console.log(grid[isopos.x][isopos.y]); // DEBUGGING

        if(buildToggle && isopos.x === gridSelector.grid_x && isopos.y === gridSelector.grid_y) {
            if(isopos.x >= 0 && isopos.x < grid[0].length && isopos.y >= 0 && isopos.y < grid.length) {
                if(grid[isopos.x][isopos.y] === 0){
                    let checkCharacterOnGrid = false;
                    for(let i = 0; i < objectsArr.length; i++){
                        if(objectsArr[i] instanceof Character){
                            if(objectsArr[i].targetX == isopos.x && objectsArr[i].targetY == isopos.y){
                                checkCharacterOnGrid = true;
                                break;
                            }
                        }
                    }
                    if(!checkCharacterOnGrid && item !== null){
                        objectsArr.push(item.clone());
                        if(item instanceof Tree) grid[isopos.x][isopos.y] = constants.TREE_ON_TILE;
                        if(item instanceof Bench) grid[isopos.x][isopos.y] = constants.BENCH_ON_TILE;
                        updateGrid(grid);
                        if(itemMoved){
                            item = null;
                            itemMoved = false;
                            grid[itemClicked.grid_x][itemClicked.grid_y] = constants.EMPTY_TILE; 
                            itemClicked = null;
                        }
                    }
                }
            }
        }
    })


    // Build HUD
    function checkBuildHUDDisplay() {
        const build_hud = document.getElementById("build_hud");
        if(buildToggle){
            build_hud.style.display = 'block';
        } else {
            build_hud.style.display = 'none';
        }
    }

    buildBtn.onclick = () => {
        buildToggle = buildToggle ? false : true;
        if(buildToggle === false) {
            hideItemToggleHUD();
            if(itemMoved) {
                resetMoveItem();
                itemMoved = false;
            }
            resetItemClicked();
            itemClicked = null;
            item = null;
        }
        checkBuildHUDDisplay();
    }

    document.getElementById('openShopBtn').addEventListener('click', () => {
        buildToggle = false;
        checkBuildHUDDisplay();
    })


    // Item toggle HUD
    const moveItem = document.getElementById("move_item");
    const sellItem = document.getElementById("sell_item");

    function showItemToggleHUD() {
        const item_hud = document.getElementById("item_toggle");
        item_hud.style.display = 'flex';
    }

    function hideItemToggleHUD() {
        const item_hud = document.getElementById("item_toggle");
        item_hud.style.display = 'none';
    }

    function resetMoveItem() {
        const itemReset = item.clone();
        itemReset.x = isoToScreen(itemClicked.grid_x, itemClicked.grid_y).x;
        itemReset.y = isoToScreen(itemClicked.grid_x, itemClicked.grid_y).y;
        itemReset.grid_x = itemClicked.grid_x;
        itemReset.grid_y = itemClicked.grid_y;
        itemReset.width = itemReset.defaultWidth*((1+zoomSpeed)**((zoomSize-1)*50));
        itemReset.height = itemReset.defaultHeight*((1+zoomSpeed)**((zoomSize-1)*50));
        if(itemReset instanceof Bench) grid[itemReset.grid_x][itemReset.grid_y] = constants.BENCH_ON_TILE;
        objectsArr.push(itemReset);
    }

    moveItem.addEventListener('click', function() {
        const item_hud = document.getElementById("item_toggle");
        itemMoved = true;
        item_hud.style.display = 'none';
        const objectval = objectsArr.find(obj => obj.grid_x !== undefined && obj.grid_y !== undefined && obj.grid_x == itemClicked.grid_x && obj.grid_y == itemClicked.grid_y);
        const objectindex = objectsArr.findIndex(obj => obj.grid_x !== undefined && obj.grid_y !== undefined && obj.grid_x == itemClicked.grid_x && obj.grid_y == itemClicked.grid_y);

        if(objectindex !== -1) objectsArr.splice(objectindex, 1);
        
        item = objectval.clone();
        window.addEventListener('keydown', handleItemRotation);
    });

    sellItem.addEventListener('click', function() {
        const item_hud = document.getElementById("item_toggle");
        item_hud.style.display = 'none';
        const objectindex = objectsArr.findIndex(obj => obj.grid_x !== undefined && obj.grid_y !== undefined && obj.grid_x == itemClicked.grid_x && obj.grid_y == itemClicked.grid_y);

        if(objectindex !== -1) objectsArr.splice(objectindex, 1);
        grid[itemClicked.grid_x][itemClicked.grid_y] = constants.EMPTY_TILE;
        itemClicked = null;
    })
    });
});

