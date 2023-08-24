var profileData = [];
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    console.clear()
    if (msg.text == "get_list") {
        if (msg.page == "search") {
            $("li.reusable-search__result-container").each(function (i, e) {
                if (i > 0) return false;
                var link = $(e).find(".app-aware-link.scale-down ").attr("href");

                chrome.runtime.sendMessage({text: "openNewTab", url: link}, function(res) {
                    
                });
            });
            sendResponse("res");
        }
    }

    if (msg.text == "scrape_profile") {
        console.clear();
        console.log("profile page you are!!~~");
        var name = $("h1.break-words").text();
        alert(name)
        return name;
    }
});
