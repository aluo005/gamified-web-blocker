// shop.js
const openShopBtn = document.getElementById('openShopBtn');
const shopContent = document.getElementById('shop-content');
const shopBodyContent = document.getElementById('shop-body-content');
const shopPackBtn = document.getElementById('shop-pack-btn');
const shopDecorBtn = document.getElementById('shop-decor-btn');

let shopPackToggle = true;

function changeShopPackButton() {
    if(shopPackToggle) {
        shopPackBtn.style.backgroundColor = '#B19989';
        shopPackBtn.style.color = '#ffffff';
        shopPackBtn.style.boxShadow = "inset 1.5px 1.5px 0px 0px rgba(0,0,0,0.3)";

        shopDecorBtn.style.backgroundColor = '#CFAF99';
        shopDecorBtn.style.color = '#493A27';
        shopDecorBtn.style.boxShadow = "1.5px 1.5px 0px 0px rgba(0,0,0,0.5)";
    } else {
        shopPackBtn.style.backgroundColor = '#CFAF99';
        shopPackBtn.style.color = '#493A27';
        shopPackBtn.style.boxShadow = "1.5px 1.5px 0px 0px rgba(0,0,0,0.5)";

        shopDecorBtn.style.backgroundColor = '#B19989';
        shopDecorBtn.style.color = '#ffffff';
        shopDecorBtn.style.boxShadow = "inset 1.5px 1.5px 0px 0px rgba(0,0,0,0.3)";
    }
}

function loadMainPackContent(packContent) {
    const shopPackMain = document.getElementById('shop-pack-main');
    shopPackMain.replaceChildren();

    const packTitle = document.createElement('h1');
    packTitle.textContent = packContent.name;

    const circle = document.createElement('div');
    circle.classList.add('main-circle');
    circle.style.backgroundColor = packContent.color;

    const buttonPlacements = document.createElement('div');
    buttonPlacements.classList.add('shop-pack-main-btn-placement');

    const buyOneBtn = document.createElement('button');
    buyOneBtn.classList.add('shop-purchase-pack-btn');
    const buyOneBtnTopText = document.createElement('div');
    buyOneBtnTopText.textContent = 'Buy x1';
    buyOneBtnTopText.style.fontSize = '12px';
    const buyOneBtnBottomText = document.createElement('div');
    buyOneBtnBottomText.textContent = JSON.stringify(packContent.cost);
    buyOneBtnBottomText.style.fontSize = '16px';
    buyOneBtnBottomText.style.marginTop = '5px';
    buyOneBtn.appendChild(buyOneBtnTopText);
    buyOneBtn.appendChild(buyOneBtnBottomText);

    const buyTenBtn = document.createElement('button');
    buyTenBtn.classList.add('shop-purchase-pack-btn');
    const buyTenBtnTopText = document.createElement('div');
    buyTenBtnTopText.textContent = 'Buy x10';
    buyTenBtnTopText.style.fontSize = '12px';
    const buyTenBtnBottomText = document.createElement('div');
    buyTenBtnBottomText.textContent = JSON.stringify(packContent.cost * 10);
    buyTenBtnBottomText.style.fontSize = '16px';
    buyTenBtnBottomText.style.marginTop = '5px';
    buyTenBtn.appendChild(buyTenBtnTopText);
    buyTenBtn.appendChild(buyTenBtnBottomText);


    buttonPlacements.appendChild(buyOneBtn);
    buttonPlacements.appendChild(buyTenBtn);

    shopPackMain.appendChild(packTitle);
    shopPackMain.appendChild(circle);
    shopPackMain.appendChild(buttonPlacements);
}

function addEventListenersSquares() {
    const squares = document.querySelectorAll('.shop-pack-content-left-side-square');
    squares.forEach((square) => {
        square.addEventListener('click', function(){
            const packContent = JSON.parse(this.getAttribute('pack-type'));
            loadMainPackContent(packContent);
        });
    });
}

function loadPacksContent(callback) {
    // Left side
    const leftside = document.createElement('div');
    leftside.classList.add('shop-pack-content-left-side');

    const packs = [
        {
            color: 'yellow',
            name: 'Legendary Pack',
            cost: 1000
        },
        {
            color: 'purple',
            name: 'Epic Pack',
            cost: 500
        },
        {
            color: 'blue',
            name: 'Rare Pack',
            cost: 100
        },
    ];

    packs.forEach((packContent) => {
        const square = document.createElement('div');
        square.classList.add('shop-pack-content-left-side-square');
        square.setAttribute('pack-type', JSON.stringify(packContent));

        // Temporarily just a circle
        const pack = document.createElement('div');
        pack.classList.add('pack-circle');
        pack.style.backgroundColor = packContent.color;

        square.appendChild(pack);
        leftside.appendChild(square);
    });

    shopBodyContent.appendChild(leftside);

    // Right side
    const rightside = document.createElement('div');
    rightside.classList.add('shop-pack-content-right-side');
    rightside.id = 'shop-pack-main';

    shopBodyContent.appendChild(rightside);
    loadMainPackContent(packs[0]);

    if (typeof callback === 'function') {
        callback();
    }
}

openShopBtn.addEventListener('click', function() {
    shopBodyContent.replaceChildren();
    changeShopPackButton();
    loadPacksContent(() => {
        addEventListenersSquares();
    });
})

shopPackBtn.addEventListener('click', function(){
    shopBodyContent.replaceChildren();
    shopPackToggle = true;
    changeShopPackButton();
    loadPacksContent(() => {
        // Ensures DOM is properly loaded
        addEventListenersSquares();
    });
})

shopDecorBtn.addEventListener('click', function() {
    shopPackToggle = false;
    changeShopPackButton();
})

