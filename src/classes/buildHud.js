// buildHud.js
import { resources } from "../exports/resources.js";

class BuildHUD {
    constructor(){
        this.buildBox = document.getElementById("build_hud_box");
        this.images = resources.images.icon;
    }

    loadContent(callback) {
        function createIcon(src, val, type) {
            const square = document.createElement('div');
            square.classList.add('build_hud_square');

            square.setAttribute('value', val);
            square.setAttribute('type', type)

            if(src !== ''){
                const img = document.createElement('img');
                img.src = src;
                img.alt = `Image ${val}`;
                square.appendChild(img);
            }

            square.addEventListener('click', function() {
                console.log(this);
                callback(this);
            });

            this.buildBox.appendChild(square);
        }

        createIcon.bind(this)('', 'blank', 'blank');

        Object.keys(this.images).forEach(key => {
            Object.keys(this.images[key]).forEach(innerKey => {
                createIcon.bind(this)(this.images[key][innerKey].image.src, innerKey, key);
            })
        });
    }
}

export default BuildHUD;