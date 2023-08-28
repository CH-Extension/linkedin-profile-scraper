var profileData = [];
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    console.clear()
    if (msg.text == "get_list") {
        if (msg.page == "search") {
            $("li.reusable-search__result-container").each(function (i, e) {
                var link = $(e).find(".app-aware-link.scale-down ").attr("href");
                
                chrome.runtime.sendMessage({text: "openUserProfile", url: link}).then((res) => {
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

        /**
        * Check if the company the current user works for exists.
        */
        var currCompanies = [];
        var companyLink = document.querySelector("ul.pv-text-details__right-panel");
        if (companyLink) {
            var list = companyLink.querySelectorAll(".pv-text-details__right-panel-item");
            list.forEach(function(e, i) {
                var label = e.querySelector("button").getAttribute("aria-label");
                if (label.indexOf("Current company") > -1) {
                    currCompanies.push(e.querySelector("button").querySelector(".pv-text-details__right-panel-item-text.hoverable-link-text.break-words.text-body-small.t-black").innerText);
                }
            });

            /**
             * Scrape the company links from their experience.
             */
            
            var companies = [];
            if (currCompanies) {
                if (
                    document.querySelector("#experience") && 
                    document.querySelector("#experience").closest("section") && 
                    document.querySelector("#experience").closest("section").querySelectorAll("li.artdeco-list__item")
                ) {
                    document.querySelector("#experience").closest("section").querySelectorAll("li.artdeco-list__item").forEach(function(e, i) {
                        var companyName = "";
                        if (e.querySelector("img")) {
                            companyName = e.querySelector("img.ivm-view-attr__img--centered").getAttribute("alt");
                            companyName = companyName.split(" logo")[0];
                        } else {
                            companyName = e.querySelector(".display-flex.flex-row.justify-space-between").querySelector("span.t-14.t-normal").querySelector("span").innerText;
                        }
                        for (var i in currCompanies) {
                            if (companyName == currCompanies[i]) {
                                var companyLink = e.querySelector("a[data-field='experience_company_logo']").getAttribute("href");
                                if (companyLink.indexOf("linkedin.com/company/") > -1) {
                                    /**
                                     * Open company profile page.
                                     */
                                    chrome.runtime.sendMessage({text: "openCompanyProfile", url: companyLink}).then((res) => {
                                        companies.push( { name: companyName, url: res });
                                    });
                                }
                            }
                        }
                    });
                }
            }
        }

        var email = "";
        var phone = "";
        var personalWebsites = [];
        
        var contactBtn = document.querySelector("#top-card-text-details-contact-info");
        if (contactBtn) {
            contactBtn.click();
            triggerDelay(2);            
            var contactSection = document.querySelector("section.pv-contact-info__contact-type");
            if (contactSection) {
                //
                var emailSection = document.querySelector("section.pv-contact-info__contact-type.ci-email");
                if (emailSection) {
                    email = emailSection.querySelector("a").innerText;
                }
                var websiteSection = document.querySelector("section.pv-contact-info__contact-type.ci-websites");
                if (websiteSection) {
                    var websites = websiteSection.querySelectorAll("li.pv-contact-info__ci-container.link");
                    websites.forEach(function(e) {
                        var link = e.querySelector("a").getAttribute("href");
                        personalWebsites.push(link);
                    })
                }
            }
        }
        console.log(email, personalWebsites);
        
        sendResponse({
            name:           name,
            profileLink:    profileLink,
            about:          about,
            follower:       follower,
            jobTitle:       job,
            address:        address,
            companies:      companies
        });
    }

    /**
     * Click the More button and get "Visit website" link
     */
    if (msg.text == "get_website") {
        document.querySelector(".artdeco-dropdown__trigger.artdeco-dropdown__trigger--placement-bottom.ember-view.org-overflow-menu__dropdown-trigger.artdeco-button.artdeco-button--2.artdeco-button--secondary.artdeco-button--muted").click();
        triggerDelay(2);
        var item = document.querySelector(".artdeco-dropdown__content.artdeco-dropdown__content--is-open.artdeco-dropdown--is-dropdown-element.artdeco-dropdown__content--has-arrow.artdeco-dropdown__content--arrow-right.artdeco-dropdown__content--justification-right.artdeco-dropdown__content--placement-bottom.ember-view.org-overflow-menu__content");
        var link = item.querySelector("a").getAttribute("href");
        sendResponse(link);
    }
    return true;
});

function timeOut(s) {
    return new Promise((resolve, reject) => {
        setTimeout(() => { resolve(); }, s * 1000);
    });
}
  
async function triggerDelay(s) {
    await timeOut(s);
}