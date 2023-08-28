var profileData = [];
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    (async () => {
        if (msg.text == "get_list") {
            console.clear();
            if (msg.page == "search") {
                $("li.reusable-search__result-container").each(function (i, e) {
                    var link = $(e).find(".app-aware-link.scale-down ").attr("href");
                    
                    chrome.runtime.sendMessage({ text: "openUserProfile", url: link, loginUser: true }).then((res) => {
                        profileData.push(res.list);
                        console.log(profileData)
                        console.log(JSON.stringify(profileData));
                    });
                });
                sendResponse(profileData);
            } else if (msg.page == "pub") {
                $("li.pserp-layout__profile-result-list-item").each(function (i, e) {
                    if (i > 0) return false;
                    var link = $(e).find("a.base-card ").attr("href");
                    
                    chrome.runtime.sendMessage({ text: "openUserProfile", url: link, loginUser: false }).then((res) => {
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

            var profile = {
                name: "",
                follower: 0,
                address: "",
                profileLink: "",
                about: "",
                job: "",
                email: "",
                phone: "",
                website: [],
                companies: [],
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
                    var name = position.querySelector("span.top-card-link__description").innerText;
                    var link = position.querySelector("a.top-card-link").getAttribute("href");
                    if (link.indexOf("linkedin.com/company/")) {
                        /**
                         * Should be open company profile
                         */
                        alert("Here you are~~");
                    }
                }
                var websites = document.querySelectorAll("dd.websites__list-item.websites__url");
                if (websites) {
                    websites.forEach(function(e) {
                        profile.website.push(e.querySelector("span.websites__url-text").innerText);
                    })
                }
            }
    
            var personalWebsites = [];
            var companies = [];
            
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
                                if (e.querySelector("img")) {
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
    
                                            let link = await chrome.runtime.sendMessage({text: "openCompanyProfile", url: companyLink});
                                            profile.companies.push( { name: companyName, url: link });
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
            sendResponse( profile );
        }
    
        /**
         * Click the More button and get "Visit website" link
         */
        if (msg.text == "getCompanyLink") {
            var website = document.querySelector("section.org-top-card.artdeco-card").querySelector("a.ember-view.org-top-card-primary-actions__action");
            var link = "";
            if (website) {
                link = website.getAttribute("href");
            } else {
                document.querySelector(".artdeco-dropdown__trigger.artdeco-dropdown__trigger--placement-bottom.ember-view.org-overflow-menu__dropdown-trigger.artdeco-button.artdeco-button--2.artdeco-button--secondary.artdeco-button--muted").click();
                await triggerDelay(2);
                var item = document.querySelector(".artdeco-dropdown__content-inner");
                if (item) {
                    link = item.querySelector("a").getAttribute("href");
                }
            }
            sendResponse(link);
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