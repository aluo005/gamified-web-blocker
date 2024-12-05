// character.js
import TinyQueue from '../libraries/tinyqueue.js';
import { resources } from '../exports/resources.js';
import { grid } from '../exports/worldGrid.js';
import constants from '../exports/constants.js';

function isoToScreen(x, y, tileWidth, tileHeight) {
    return {
        x: (x - y) * (tileWidth / 2),
        y: (x + y) * (tileHeight / 4)
    }
}

// matrix inverse
function screenToIso(sx, sy, tileWidth, tileHeight) {
    return {
        x: (1/(0.25*tileWidth*tileHeight)) * ((sx*0.25*tileHeight) + (sy*0.5*tileWidth)),
        y: (1/(0.25*tileWidth*tileHeight)) * (-(sx*0.25*tileHeight) + (sy*0.5*tileWidth))
    }
}

function checkGrid(val) {
    if(val < constants.TILE_OCCUPIED){
        return true
    }
    return false
}

// heuristic function using manhattan distance
function h(p1, p2) {
    return Math.abs(p1.x-p2.x) + Math.abs(p1.y-p2.y);
}

// A* epsilon algorithm: we make A* epsilon-admissible by simply mulitplying epsilon
// to h() function to save time since we don't need absolute shortest path
function astar(grid, start, end, epsilon, came_from) {
    const closed = Array.from({ length: grid.length }, () => Array(grid[0].length).fill(false));
    const g = Array.from({ length: grid.length }, () => Array(grid[0].length).fill(Infinity));
    const f = Array.from({ length: grid.length }, () => Array(grid[0].length).fill(Infinity));
    let count = 0;

    const q = new TinyQueue([], (a, b) => {
        if(a[0] !== b[0]){
            return a[0]-b[0];
        }
        return a[1]-b[1];
    });

    g[start.x][start.y] = 0;
    f[start.x][start.y] = h(start, end)*epsilon;
    q.push([0, count, start]);

    while(q.length > 0) {
        const curr = q.pop()[2];
        if(closed[curr.x][curr.y]){
            continue;
        }
        closed[curr.x][curr.y] = true;
        let tempg = g[curr.x][curr.y] + 1;

        if(curr.x == end.x && curr.y == end.y){
            return true;
        }
        
        // check the neighbors
        if(curr.x-1>=0){ // check left
            if(checkGrid(grid[curr.x-1][curr.y]) && closed[curr.x-1][curr.y] === false){ // CHANGE LATER
                if(tempg < g[curr.x-1][curr.y]) {
                    came_from[curr.x-1][curr.y] = curr;
                    g[curr.x-1][curr.y] = tempg;
                    f[curr.x-1][curr.y] = tempg + h({x: curr.x-1, y: curr.y}, end)*epsilon; 
                    count+=1;
                    q.push([f[curr.x-1][curr.y], count, {x: curr.x-1, y: curr.y}]);
                }
            }
        }
        if(curr.x+1<grid.length){ // check right
            if(checkGrid(grid[curr.x+1][curr.y]) && closed[curr.x+1][curr.y] === false){ // CHANGE LATER
                if(tempg < g[curr.x+1][curr.y]) {
                    came_from[curr.x+1][curr.y] = curr;
                    g[curr.x+1][curr.y] = tempg;
                    f[curr.x+1][curr.y] = tempg + h({x: curr.x+1, y: curr.y},end)*epsilon;
                    count+=1;
                    q.push([f[curr.x+1][curr.y], count, {x: curr.x+1, y: curr.y}]);
                }
            }
        }
        if(curr.y-1>=0){ // check top
            if(checkGrid(grid[curr.x][curr.y-1]) && closed[curr.x][curr.y-1] === false){ // CHANGE LATER
                if(tempg < g[curr.x][curr.y-1]) {
                    came_from[curr.x][curr.y-1] = curr;
                    g[curr.x][curr.y-1] = tempg;
                    f[curr.x][curr.y-1] = tempg + h({x: curr.x, y: curr.y-1},end)*epsilon;
                    count+=1;
                    q.push([f[curr.x][curr.y-1], count, {x: curr.x, y: curr.y-1}]);
                }
            }
        }
        if(curr.y+1<grid[0].length){ // check bottom
            if(checkGrid(grid[curr.x][curr.y+1]) && closed[curr.x][curr.y+1] === false){ // CHANGE LATER
                if(tempg < g[curr.x][curr.y+1]) {
                    came_from[curr.x][curr.y+1] = curr;
                    g[curr.x][curr.y+1] = tempg;
                    f[curr.x][curr.y+1] = tempg + h({x: curr.x, y: curr.y+1},end)*epsilon;
                    count+=1;
                    q.push([f[curr.x][curr.y+1], count, {x: curr.x, y: curr.y+1}]);
                }
            }
        }
    }
    return false;
}

// constructs the path returned by A* algorithm
function reconstruct_path(grid, start, end, epsilon) {
    let came_from = Array.from({ length: grid.length }, () => Array(grid[0].length).fill(null));
    let path_arr = [];
    if(astar(grid, start, end, epsilon, came_from)){
        let curr = end;
        while(curr !== null){
            path_arr.push(curr);
            curr = came_from[curr.x][curr.y];
        }
        //console.log(path_arr);
        return path_arr;
    }
    return path_arr;
}

function checkSurroundings(x, y, grid) {
    if(x-1 >= 0 && checkGrid(grid[x-1][y])){
        return {x: x-1, y: y};
    } else if(x+1 < grid.length && checkGrid(grid[x+1][y])){
        return {x: x+1, y: y};
    } else if(y-1 >= 0 && checkGrid(grid[x][y-1])){
        return {x: x, y: y-1};
    } else if(y+1 < grid[0].length && checkGrid(grid[x][y+1])){
        return {x: x, y: y+1};
    }
    console.log('BLOCKED LOL');
    return false;
}

class Character {
    constructor(x, y, grid_x, grid_y, size, speed, tileWidth, tileHeight, x_offset, y_offset, grid) {
        this.x = x;
        this.y = y;
        this.real_x = x;
        this.real_y = y;
        this.width = 48;
        this.length = 48;
        this.grid_x = grid_x;
        this.grid_y = grid_y;
        this.size = size;
        this.image = resources.images.character.hamsterDefault;
        this.frameX = 0;
        this.frameY = 0;
        this.targetX = grid_x;
        this.targetY = grid_y;
        this.speed = speed;
        this.moving = true;
        this.sitting = false;
        this.sittingFirstTime = false;
        this.tileWidth = tileWidth;
        this.tileHeight = tileHeight;
        this.x_offset = x_offset;
        this.y_offset = y_offset;
        this.grid = grid;
        this.current_path_arr = [];
        this.curr_coord = null; 
        this.bench_coord = null;
        this.gameFrame = 0;
        this.frameInterval = 12;
        this.maxFrame = 7;
    }

    draw(ctx) {
        if(!this.image.isLoaded){
            return;
        }

        const pos_x = this.x + this.x_offset - (this.size/2-this.tileWidth/2);
        const pos_y = this.y + this.y_offset - (this.size-this.tileHeight/4);
        this.real_x = pos_x;
        this.real_y = pos_y;

        ctx.drawImage(this.image.image, this.frameX* Math.round(this.width), this.frameY* Math.round(this.length), 
                      Math.round(this.width), Math.round(this.length), pos_x, pos_y, Math.round(this.size), Math.round(this.size));
    }

    updatePosition() {
        const targetpx = isoToScreen(this.targetX, this.targetY, this.tileWidth, this.tileHeight).x;
        const targetpy = isoToScreen(this.targetX, this.targetY, this.tileWidth, this.tileHeight).y;

        if(this.x < targetpx){
            this.x += this.speed;

            if(this.x > targetpx){
                this.x = targetpx;
            } 
        } else if(this.x > targetpx){
            this.x -= this.speed;

            if(this.x < targetpx){
                this.x = targetpx;
            } 
        }

        if(this.y < targetpy){
            this.y += this.speed/2;
    
            if(this.y > targetpy){
                this.y = targetpy;
            }
        } else if(this.y > targetpy){
            this.y -= this.speed/2;

            if(this.y < targetpy){
                this.y = targetpy;
            }
        }

        if(this.y < targetpy && this.x < targetpx){
            this.frameY = 4;
            this.maxFrame = 7;
        }
        if(this.y < targetpy && this.x > targetpx){
            this.frameY = 5;
            this.maxFrame = 7;
        }
        if(this.y > targetpy && this.x < targetpx){
            this.frameY = 6;
            this.maxFrame = 7;
        }
        if(this.y > targetpy && this.x > targetpx){
            this.frameY = 7;
            this.maxFrame = 7;
        }

        const gridpos = screenToIso(this.x, this.y, this.tileWidth, this.tileHeight);
        this.grid_x = gridpos.x;
        this.grid_y = gridpos.y;


        // Checks if object is suddenly placed along its path
        if(this.current_path_arr.length > 0){
            const c = this.current_path_arr[this.current_path_arr.length - 1];
            if(this.bench_coord === null){
                if(!checkGrid(grid[c.x][c.y])) this.current_path_arr = [];
            } else {
                if(this.bench_coord.x === c.x && this.bench_coord.y === c.y) {
                    if(grid[c.x][c.y] !== 250){
                        this.current_path_arr = [];
                    }
                } else {
                    if(!checkGrid(grid[c.x][c.y])){
                        this.current_path_arr = [];
                    }
                }
            }
        }

        if(this.x == targetpx && this.y == targetpy && this.moving){
            if(this.current_path_arr !== null && this.current_path_arr.length > 0){
                this.curr_coord = this.current_path_arr.pop();
                this.targetX = this.curr_coord.x;
                this.targetY = this.curr_coord.y;
            } else {
                this.moving = false;
                this.frameX = 0;

                if(this.sittingFirstTime) {
                    this.sitting = true;
                    this.benchSit();
                } else {
                    const delay = Math.round(Math.random() * 3000/1000) * 1000;

                    setTimeout(() => {
                        if(!this.moving){
                            if(checkSurroundings(this.targetX, this.targetY, grid) !== false){
                                while((this.current_path_arr === null || this.current_path_arr.length === 0)){
                                    this.sittingFirstTime = false;
                                    this.bench_coord = null;
                                    const randX = Math.floor(Math.random() * grid.length);
                                    const randY = Math.floor(Math.random() * grid[0].length);
    
                                    if(grid[randX][randY] === constants.BENCH_ON_TILE){
                                        grid[randX][randY] = constants.BENCH_ON_TILE - 100;
                                        this.sittingFirstTime = true;
                                        this.bench_coord = {x: randX, y: randY};
                                    }
                                    
                                    this.moveToTarget(this.targetX, this.targetY, randX, randY);
    
                                    if(grid[randX][randY] === constants.BENCH_ON_TILE - 100){
                                        if(this.current_path_arr !== null && this.current_path_arr.length > 0){
                                            grid[randX][randY] = constants.BENCH_ON_TILE_SITTING;
                                        } else {
                                            grid[randX][randY] = constants.BENCH_ON_TILE;
                                        }
                                    }  
                                }
                            }
                            this.moving = true;
                        }
                    }, delay);
                }
            }
        }

        if(!this.moving) {
            this.maxFrame = 3;
            if(this.frameY === 4){
                this.frameY = 0;
            } else if(this.frameY === 5){
                this.frameY = 1;
            } else if(this.frameY === 6){
                this.frameY = 2;
            } else if(this.frameY === 7){
                this.frameY = 3;
            }
        }
        

        if(this.gameFrame > this.frameInterval) {
            if(this.frameX >= this.maxFrame) this.frameX = 0;
            else this.frameX++;
            this.gameFrame = 0
        } else {
            this.gameFrame++;
        }
    }

    moveToTarget(start_x, start_y, end_x, end_y) {
        if(!this.moving){
            this.current_path_arr = reconstruct_path(grid, {x: start_x, y: start_y}, {x: end_x, y: end_y}, 1);
            this.curr_coord = this.current_path_arr.pop();
        }
    }

    benchSit() {
        const delay = Math.round(Math.random() * 5000/1000) * 1000 + 2000;

        setTimeout(() => {
            const nextMove = checkSurroundings(this.targetX, this.targetY, grid);
            this.moving = true;
            if(nextMove !== false){
                this.sitting = false;
                grid[this.targetX][this.targetY] = constants.BENCH_ON_TILE;
                this.targetX = nextMove.x;
                this.targetY = nextMove.y;
                this.sittingFirstTime = false;
                this.bench_coord = null;
                
                this.current_path_arr = [];
            }
        }, delay);
    }

    reposition(tileWidth, tileHeight, num1, num2) {
        this.size *= num2;
        this.x = isoToScreen(this.grid_x, this.grid_y, tileWidth, tileHeight).x; 
        this.y = isoToScreen(this.grid_x, this.grid_y, tileHeight, tileHeight).y;
        this.tileWidth = tileWidth;
        this.tileHeight = tileHeight;
        this.speed += num1 > 0 ? (num1 - 1) : (num1 + 1);
    }

    resetPosition(tileWidth, tileHeight, x_offset, y_offset) {
        this.x_offset = x_offset;
        this.y_offset = y_offset;
        this.tileWidth = tileWidth;
        this.tileHeight = tileHeight;
        this.speed = 0.65;
        this.size = 48;
        this.x = isoToScreen(this.grid_x, this.grid_y, tileWidth, tileHeight).x; 
        this.y = isoToScreen(this.grid_x, this.grid_y, tileHeight, tileHeight).y;
    }
}

export default Character;