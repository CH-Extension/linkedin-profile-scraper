chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    if (msg.text == "openNewTab") {
        chrome.tabs.create({ url: msg.url }, () => {
        setTimeout(() => {
            chrome.tabs.sendMessage(sender.tab.id, {text: 'scrape_profile'}, function(response) {
                if (response) {
                    console.log(response);
                }
            });
        }, 3000);
        });
    }
});
