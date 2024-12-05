// resources.js

class Resources {
    constructor(onComplete) {
        this.toLoad = {
            tile: "sprites/cube_tile.png",
            gridSelector: "sprites/gridSelector.png",
            gridSelector_green: "sprites/gridSelector_green.png",
            gridSelector_red: "sprites/gridSelector_red.png",
            character: {
                hamsterDefault: "sprites/characters/hamster_2.png",
            },
            tree: {
                tree2: "sprites/trees/tree2.png",
            },
            bench: {
                bench1: "sprites/benches/bench1.png",
            },
        }

        this.icon = {
            tree: {
                tree2: "sprites/icons/tree2_icon.png",
            },
            bench: {
                bench1: "sprites/icons/bench1_icon.png",
            },
        }

        this.images = {};
        
        Object.keys(this.toLoad).forEach(key => {
            if(typeof this.toLoad[key] === 'object'){
                this.images[key] = {}
                Object.keys(this.toLoad[key]).forEach(innerKey => {
                    const img = new Image();
                    img.src = this.toLoad[key][innerKey];
                    this.images[key][innerKey] = {
                        image: img,
                        isLoaded: false
                    }
                    img.onload = () => {
                        this.images[key][innerKey].isLoaded = true;
                    }
                })
            } else {
                const img = new Image();
                img.src = this.toLoad[key];
                this.images[key] = {
                    image: img,
                    isLoaded: false
                }
                img.onload = () => {
                    this.images[key].isLoaded = true;
                }
            }
        })

        // Append icon object
        this.images['icon'] = {}
        Object.keys(this.icon).forEach(key => {
            this.images['icon'][key] = {}
            Object.keys(this.icon[key]).forEach(innerKey => {
                const img = new Image();
                img.src = this.icon[key][innerKey];
                this.images['icon'][key][innerKey] = {
                    image: img,
                    isLoaded: false
                }
                img.onload = () => {
                    this.images['icon'][key][innerKey].isLoaded = true;
                }
            })
        })

        onComplete();
    }
}

export const resources = new Resources(() => {
    console.log('All resources are loaded!');
});