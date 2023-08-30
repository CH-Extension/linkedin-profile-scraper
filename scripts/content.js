var profileData = [];
var trigger, sortTrigger;
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    (async () => {
        if (msg.text == "get_list") {
            console.clear();
            if (msg.page == "search") {
                const getUsers = async() => {
                    var users = document.querySelectorAll("li.reusable-search__result-container");
                    for (var i = 0; i < users.length; i++) {
                        var link = users[i].querySelector(".app-aware-link.scale-down").getAttribute("href");
                        
                        await chrome.runtime.sendMessage({ text: "openUserProfile", url: link, loginUser: true }).then((res) => {
                            profileData.push(res.list);
                            console.log(profileData)
                            console.log(JSON.stringify(profileData));
                        });
                    }
                }
                await getUsers();
                sendResponse(profileData);
            } else if (msg.page == "pub") {
                var users = document.querySelectorAll("li.pserp-layout__profile-result-list-item");
                for (var i = 0; i < users.length; i++) {
                    var link = users[i].querySelector("a.base-card").getAttribute("href");
                    
                    await chrome.runtime.sendMessage({ text: "openUserProfile", url: link, loginUser: true }).then((res) => {
                        profileData.push(res.list);
                    });
                }
                sendResponse(profileData);
            }
        }
    
        if (msg.text == "scrape_profile") {
            if (msg.profile == 1) {
                profileData = [];
            }

            var profile = {
                name: "",
                follower: 0,
                companyFollower: 0,
                address: "",
                profileLink: "",
                about: "",
                job: "",
                email: "",
                phone: "",
                website: [],
                companies: [],
                lastPostDate: "",
            };
            
            console.clear();
            await triggerDelay(2);
            profile.profileLink = window.location.href;
            if (msg.loginUser) {
                profile.name = document.querySelector("h1.break-words").innerText;
                if ( document.querySelector("#content_collections") && document.querySelector("#content_collections").closest("section") ) {
                    var follower = document.querySelector("#content_collections").closest("section").querySelector(".pvs-header__subtitle.pvs-header__optional-link.text-body-small > span").innerText;
                    if (follower.indexOf("K") > -1) follower.replace("K", "000");
                    profile.follower = follower.split(" follower")[0];
                }
                profile.address = document.querySelector(".pv-text-details__left-panel.mt2").querySelector("span.text-body-small.inline.t-black--light.break-words").innerText;
                if ( document.querySelector("#about") ) {
                    profile.about = document.querySelector("#about").closest("section").querySelector(".pv-shared-text-with-see-more.full-width.t-14.t-normal.t-black.display-flex.align-items-center").querySelector("span").innerText;
                }
                profile.job = document.querySelector(".text-body-medium.break-words").innerText;
                
                var contactBtn = document.querySelector("#top-card-text-details-contact-info");
                if (contactBtn) {
                    contactBtn.click();
                    await triggerDelay(2);
                    var contactSection = document.querySelector("section.pv-contact-info__contact-type");
                    if (contactSection) {
                        var emailSection = document.querySelector("section.pv-contact-info__contact-type.ci-email");
                        if (emailSection) {
                            profile.email = emailSection.querySelector("a").innerText;
                        }
                        var websiteSection = document.querySelector("section.pv-contact-info__contact-type.ci-websites");
                        if (websiteSection) {
                            var personalWebsites = websiteSection.querySelectorAll("li.pv-contact-info__ci-container.link");
                            personalWebsites.forEach(function(e) {
                                var link = e.querySelector("a").getAttribute("href");
                                profile.website.push(link);
                            })
                        }
                    }
                }
            } else {
                profile.name = document.querySelector("h1.top-card-layout__title").innerText;
                profile.job = document.querySelector("h2.top-card-layout__headline").innerText;
                profile.address = document.querySelector("h3.top-card-layout__first-subline ").querySelector("div.top-card__subline-item").innerText;
                var follower = document.querySelector("h3.top-card-layout__first-subline ").querySelector("span.top-card__subline-item").innerText;
                if (follower.indexOf("K") > -1) follower = follower.replace("K", "000");
                profile.follower = follower.split(" follower")[0];

                var sectionTitle = document.querySelectorAll("h2.core-section-container__title.section-title");
                if (sectionTitle) {
                    sectionTitle.forEach(function(e) {
                        var title = e.innerText;
                        if (title.toLowerCase().indexOf("about") > -1) {
                            profile.about = e.closest("section").querySelector("div.core-section-container__content").querySelector("p").innerText;
                        }
                    })
                }

                var position = document.querySelector("div[data-section='currentPositionsDetails']");
                if (position) {
                    var companyName = position.querySelector("span.top-card-link__description").innerText;
                    var link = position.querySelector("a.top-card-link").getAttribute("href");
                    if (link.indexOf("linkedin.com/company/")) {
                        /**
                         * Should be open company profile
                         */
                        link = await chrome.runtime.sendMessage({text: "openCompanyProfile", url: link});
                    }
                    profile.companies.push( { name: companyName, url: link });
                }
                var websites = document.querySelectorAll("dd.websites__list-item.websites__url");
                if (websites) {
                    websites.forEach(function(e) {
                        profile.website.push(e.querySelector("span.websites__url-text").innerText);
                    })
                }
            }
    
            var personalWebsites = [];
            var companyPostLink = "";
            
            /**
            * Check if the company the current user works for exists.
            */

            const func = async () => {
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
                    
                    if (currCompanies) {
                        if (
                            document.querySelector("#experience") && 
                            document.querySelector("#experience").closest("section") && 
                            document.querySelector("#experience").closest("section").querySelectorAll("li.artdeco-list__item")
                        ) {
                            let _obj1 = document.querySelector("#experience").closest("section").querySelectorAll("li.artdeco-list__item");
                            for(let i = 0 ; i < _obj1.length ; i++) {
                                let e = _obj1[i];
                                var companyName = "";
                                if (e.querySelector("img.ivm-view-attr__img--centered")) {
                                    companyName = e.querySelector("img.ivm-view-attr__img--centered").getAttribute("alt");
                                    companyName = companyName.split(" logo")[0];
                                } else {
                                    companyName = e.querySelector(".display-flex.flex-row.justify-space-between").querySelector("span.t-14.t-normal").querySelector("span").innerText;
                                }
                                for(let j = 0 ; j < currCompanies.length ; j++) {
                                    let item = currCompanies[j]
                                    if (companyName == item) {
                                        var companyLink = e.querySelector("a[data-field='experience_company_logo']").getAttribute("href");
                                        if (companyLink.indexOf("linkedin.com/company/") > -1) {
                                            /**
                                             * Open company profile page.
                                             */
                                            console.log(companyLink);
                                            let res = await chrome.runtime.sendMessage({text: "openCompanyProfile", url: companyLink});
                                            profile.companies.push( { name: companyName, url: res.website });
                                            companyPostLink = res.profile + "/posts?feedView=all";
                                        } else {
                                            profile.companies.push( { name: companyName, url: companyLink });
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            await func();
            
            // const getPostDate = async () => {
            //     res = await chrome.runtime.sendMessage({text: "companyPostDate", url: companyPostLink});
            //     profile.lastPostDate = res.date;
            //     profile.companyFollower = res.follower;
            // }
            // await getPostDate();

            sendResponse( profile );
        }
    
        /**
         * Click the More button and get "Visit website" link
         */
        if (msg.text == "getCompanyLink") {
            var link = "";
            var website = document.querySelector("section.org-top-card.artdeco-card").querySelector("a.ember-view.org-top-card-primary-actions__action");
            if (website) {
                link = website.getAttribute("href");
                sendResponse({website: link, profile: window.location.href});
            } else {
                var triggerItem = document.querySelector(".artdeco-dropdown__trigger.artdeco-dropdown__trigger--placement-bottom.ember-view.org-overflow-menu__dropdown-trigger.artdeco-button.artdeco-button--2.artdeco-button--secondary.artdeco-button--muted");
                if (triggerItem) triggerItem.click();
                
                function getWebsiteLink() {
                    var item = document.querySelector(".artdeco-dropdown__content-inner");
                    if (item) {
                        clearInterval(websiteLink);
                        if (item.querySelector("a")) {
                            link = item.querySelector("a").getAttribute("href");
                        }
                    }
                    sendResponse({website: link, profile: window.location.href});
                }
                websiteLink = setInterval(getWebsiteLink, 1000)
            }
        }

        if (msg.text == "lastPostDate") {
            var companyFollower = 0;

            var postedDate = "";

            var triggerDropDown = function() {
                if (document.querySelector("ul.sort-dropdown__list")) {
                    clearInterval(trigger);
                    
                    document.querySelector("ul.sort-dropdown__list").querySelector("li.sort-dropdown__list-item:nth-child(2)").querySelector("button").click();
                    sortTrigger = setInterval(sortPost, 1000);
                }
            }

            var sortPost = function() {
                if ( document.querySelector(".update-components-text-view") && document.querySelector(".update-components-text-view").querySelector("span.visually-hidden") ) {
                    clearInterval(sortTrigger);
                    var updateTime = (document.querySelector(".update-components-text-view").querySelector("span.visually-hidden").innerText).split(" ")[0];
                    postedDate = updateTime;
                    
                    if (    document.querySelector(".org-top-card-summary-info-list") &&
                            document.querySelector(".org-top-card-summary-info-list").querySelector(".org-top-card-summary-info-list__info-item:nth-child(2)") ) {
                        var follower = document.querySelector(".org-top-card-summary-info-list").querySelector(".org-top-card-summary-info-list__info-item:nth-child(2)").innerText;
                        companyFollower = follower.split(" follower")[0];
                    }
                    sendResponse({date: postedDate, follower: companyFollower});
                }
            }

            var checkLoaded = function() {
                if (document.querySelector("div.sort-dropdown__dropdown") && document.querySelector("div.sort-dropdown__dropdown").querySelector(".artdeco-dropdown__trigger")) {
                    document.querySelector("div.sort-dropdown__dropdown").querySelector(".artdeco-dropdown__trigger").click();
                    clearInterval(isLoaded);
                    trigger = setInterval(triggerDropDown, 2000);
                }
            }

            isLoaded = setInterval(checkLoaded, 1000);
        }

        if (msg.text == "next_search") {
            document.querySelector("div.artdeco-pagination").querySelector("button.artdeco-pagination__button--next").click();
            sendResponse("next");
        }
    })();
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

function getCompanys(link) {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({text: "openCompanyProfile", url: link}).then((res) => {
            resolve(res);
        }).catch(error => {
            reject(error)
        });
    }) 
}
