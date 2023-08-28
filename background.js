chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    /**
     * Open user profile link and send request to get basic information
     */
    if (msg.text == "openUserProfile") {
        chrome.tabs.create({ url: msg.url, active: false }).then((newTab) => {
            var status = true;
            chrome.tabs.onUpdated.addListener(function (tabId , info) {
                if (info.status === 'complete' && tabId == newTab.id && status) {
                    chrome.scripting.executeScript({ target: {tabId: newTab.id, allFrames: false}, files: ['scripts/content.js'], }).then(() => {
                        status = false;
                        chrome.tabs.sendMessage(newTab.id, { text: 'scrape_profile', loginUser: msg.loginUser }).then((data) => {
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
        chrome.tabs.create({ url: msg.url, active: false }).then((newTab) => {
            chrome.tabs.onUpdated.addListener(function (tabId , info) {
                if (info.status === 'complete' && tabId == newTab.id) {
                    chrome.scripting.executeScript({ target: {tabId: newTab.id, allFrames: false}, files: ['scripts/content.js'], }).then(() => {
                        chrome.tabs.sendMessage(newTab.id, {text: 'getCompanyLink'}).then((data) => {
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
