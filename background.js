chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    if (msg.text == "openNewTab") {
        chrome.tabs.create({ url: msg.url }).then((newTab) => {
            setTimeout(() => {
                chrome.scripting.executeScript({ target: {tabId: newTab.id, allFrames: true}, files: ['scripts/content.js'], }).then(() => {
                    chrome.tabs.sendMessage(newTab.id, {text: 'scrape_profile'}).then((data) => {
                        if (data) {
                            sendResponse({list: data});
                            chrome.tabs.remove(newTab.id);
                        }
                    });
                })
            }, 2000);
        });
    }
    
    return true;
});
