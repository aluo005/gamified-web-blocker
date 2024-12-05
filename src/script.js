window.addEventListener('load', function() {
    const shopModal = document.getElementById('shop-modal');
    const closeShopBtn = document.getElementById('closeShopBtn');
    const openShopBtn = document.getElementById('openShopBtn');
    const shopBodyContent = document.getElementById('shop-body-content');

    closeShopBtn.addEventListener('click', () => {
        shopModal.classList.remove("show");

        setTimeout(function() {
            shopModal.style.display = "none";
        }, 500); 
    });

    openShopBtn.addEventListener('click', () => {
        shopModal.style.display = "flex";

        setTimeout(function() {
            shopModal.classList.add("show");
        }, 10);
    });
});
