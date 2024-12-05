document.getElementById('gameBtn').addEventListener('click', function() {
    const profileUrl = chrome.runtime.getURL('../src/index.html');
    chrome.tabs.create({ url: profileUrl });
});