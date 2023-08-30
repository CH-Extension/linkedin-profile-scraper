chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    /**
     * Open user profile link and send request to get basic information
     */
    if (msg.text == "openUserProfile") {
        chrome.tabs.create({ url: msg.url, active: false }).then((profileTab) => {
            var status = true;
            chrome.tabs.onUpdated.addListener(function (tabId , info) {
                if (info.status === 'complete' && tabId == profileTab.id && status) {
                    chrome.scripting.executeScript({ target: {tabId: profileTab.id, allFrames: false}, files: ['scripts/content.js'], }).then(() => {
                        status = false;
                        chrome.tabs.sendMessage(profileTab.id, { text: 'scrape_profile', loginUser: msg.loginUser }).then((data) => {
                            if (data) {
                                chrome.tabs.remove(profileTab.id);
                                sendResponse({list: data});
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
        chrome.tabs.create({ url: msg.url, active: false }).then((companyTab) => {
            chrome.tabs.onUpdated.addListener(function (tabId , info) {
                if (info.status === 'complete' && tabId == companyTab.id) {
                    chrome.scripting.executeScript({ target: {tabId: companyTab.id, allFrames: false}, files: ['scripts/content.js'], }).then(() => {
                        chrome.tabs.sendMessage(companyTab.id, {text: 'getCompanyLink'}).then((data) => {
                            chrome.tabs.remove(companyTab.id);
                            sendResponse( data );
                        });
                    })
                }
            });
        });
    }
    
    /**
     * Scrape the posts and return latest post date
     */
    if (msg.text == "companyPostDate") {
        chrome.tabs.create({ url: msg.url, active: false }).then((postTab) => {
            chrome.tabs.onUpdated.addListener(function (tabId , info) {
                if (info.status === 'complete' && tabId == postTab.id) {
                    chrome.scripting.executeScript({ target: {tabId: postTab.id, allFrames: false}, files: ['scripts/jquery.min.js', 'scripts/content.js'], }).then(() => {
                        chrome.tabs.sendMessage(postTab.id, {text: 'lastPostDate'}).then((data) => {
                            chrome.tabs.remove(postTab.id);
                            sendResponse( data );
                        });
                    })
                }
            });
        });
    }
    
    return true;
});
