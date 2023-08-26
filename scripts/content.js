var profileData = [];
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    console.clear()
    if (msg.text == "get_list") {
        if (msg.page == "search") {
            $("li.reusable-search__result-container").each(function (i, e) {
                var link = $(e).find(".app-aware-link.scale-down ").attr("href");
                
                chrome.runtime.sendMessage({text: "openNewTab", url: link}).then((res) => {
                    profileData.push(res.list);
                    console.log(profileData)
                });
            });
            sendResponse(profileData);
        }
    }

    if (msg.text == "scrape_profile") {
        if (msg.profile == 1) {
            profileData = [];
        }
        console.clear();
        var name = document.querySelector("h1.break-words").innerText;
        var follower = 0;
        if ( document.querySelector("#content_collections") && document.querySelector("#content_collections").closest("section") ) {
            var follower = document.querySelector("#content_collections").closest("section").querySelector(".pvs-header__subtitle.pvs-header__optional-link.text-body-small > span").innerText;
            follower = follower.split(" follower")[0];
        }
        var address = document.querySelector(".pv-text-details__left-panel.mt2").querySelector("span.text-body-small.inline.t-black--light.break-words").innerText;
        var profileLink = window.location.href;
        var about = "";
        if ( document.querySelector("#about") ) {
            about = document.querySelector("#about").closest("section").querySelector(".pv-shared-text-with-see-more.full-width.t-14.t-normal.t-black.display-flex.align-items-center").querySelector("span").innerText;
        }
        var job = document.querySelector(".text-body-medium.break-words").innerText;

        /*
        ------------- Ignore this for now --------------
        var company = [];
        if (
            document.querySelector("#experience") && 
            document.querySelector("#experience").closest("section") && 
            document.querySelector("#experience").closest("section").querySelectorAll("li.artdeco-list__item")
        ) {
            document.querySelector("#experience").closest("section").querySelectorAll("li.artdeco-list__item").forEach(function(i, e) {
                var companyName = "";
                if (i.querySelector("img")) {
                    companyName = i.querySelector("img.ivm-view-attr__img--centered").getAttribute("alt");
                    companyName = companyName.split(" logo")[0];
                } else {
                    companyName = i.querySelector(".display-flex.flex-row.justify-space-between").querySelector("span.t-14.t-normal").querySelector("span").innerText;
                }
                var companyLink = i.querySelector("a[data-field='experience_company_logo']").getAttribute("href");
                company.push({
                    name: companyName,
                    url : companyLink
                });
            });
        }
        */
        
        sendResponse({
            name:           name,
            profileLink:    profileLink,
            about:          about,
            follower:       follower,
            jobTitle:       job,
            address:        address
        });
    }
    return true;
});
