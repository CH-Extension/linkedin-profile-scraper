chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    /**
     * Open user profile link and send request to get basic information
     */
    if (msg.text == "openUserProfile") {
        chrome.tabs.create({ url: msg.url }).then((newTab) => {
            chrome.tabs.onUpdated.addListener(function (tabId , info) {
                if (info.status === 'complete' && tabId == newTab.id) {
                    chrome.scripting.executeScript({ target: {tabId: newTab.id, allFrames: true}, files: ['scripts/content.js'], }).then(() => {
                        chrome.tabs.sendMessage(newTab.id, {text: 'scrape_profile'}).then((data) => {
                            if (data) {
                                sendResponse({list: data});
                                chrome.tabs.remove(newTab.id);
                            }
                        });
                    })
                }
            });
        });
    }

    /**
     * Open company profile link and send request to get website link
     */
    if (msg.text == "openCompanyProfile") {
        chrome.tabs.create({ url: msg.url }).then((newTab) => {
            chrome.tabs.onUpdated.addListener(function (tabId , info) {
                if (info.status === 'complete' && tabId == newTab.id) {
                    chrome.scripting.executeScript({ target: {tabId: newTab.id, allFrames: true}, files: ['scripts/content.js'], }).then(() => {
                        chrome.tabs.sendMessage(newTab.id, {text: 'get_website'}).then((data) => {
                            sendResponse( data );
                            chrome.tabs.remove(newTab.id);
                        });
                    })
                }
            });
        });
    }
    
    return true;
});
