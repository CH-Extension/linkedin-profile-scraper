// var background = chrome.extension.getBackgroundPage();

var tab;
var searchPage = "pub";

//get current tab url
function checkIsLinkedin() {
    // https://developer.chrome.com/extensions/tabs#method-query
    var queryInfo = { active: true, currentWindow: true };

    chrome.tabs.query(queryInfo, function(tabs) {
        tab = tabs[0];
        activeTab = tab.id;
        var url = tab.url;
    
        // Check the opened tab is linkedin.com
        if (url.indexOf("linkedin.com") > -1) {
            // ------------------ Should be check which page is user on -------------------------------
            if (url.indexOf("linkedin.com/in") > -1) {
                scrapeProfile();
            } else {
                if (url.indexOf("linkedin.com/search/results/people") > -1) {
                    searchPage = "search";
                }
                getProfileLinks();
            }
        } else {
            $("#result").html("<div class='h6 text-justify'>You can't run this extension.</div><div class='h6 text-justify'>Please check the website URL.</div>");
			return false;
        }
    });
}

function getProfileLinks() {
    chrome.scripting.executeScript({ target: {tabId: tab.id, allFrames: true}, files: ['scripts/jquery.min.js', 'scripts/content.js'], }, function() {
        chrome.tabs.sendMessage(tab.id, {text: 'get_list', page: searchPage}, function(response) {
            if (response) {
                $("#found_num").text( response.length );
                draftProfiles(response);
            }
        });
        
    });
}

function scrapeProfile() {
    chrome.scripting.executeScript({ target: {tabId: tab.id, allFrames: true}, files: ['scripts/jquery.min.js', 'scripts/content.js'], }, function() {
        chrome.tabs.sendMessage(tab.id, {text: 'scrape_profile', profile: 1}, function(response) {
            if (response) {
                draftProfiles(response);
                console.log(response);
            }
        });
    });
}

function draftProfiles(list) {
    chrome.storage.sync.get(['linkedin_profiles'], function(result) {
        if (result.linkedin_profiles != undefined) {
            var profiles = JSON.parse(linkedin_profiles);
            profiles = profiles.concat(list);
            chrome.storage.sync.set({ linkedin_profiles: JSON.stringify(profiles) });
        } else {
            chrome.storage.sync.set({ linkedin_profiles: JSON.stringify(list) });
        }
        return false;        
    });
}


$(document).ready(function() {
    $("#login").click(function() {
        var email = $("#email").val();
        var password = $("#password").val();

        if (!email || !password) {
            $('#status').text('Your credential is incorrect');
            return false;
        }

        $.post("https://api.convertlead.com/api/login", {email: email, password: password})
            .done(function(res){
                $(".login-form").hide();
                $("#result").show();

                checkIsLinkedin();
            })
            .fail(function(xhr, status, error) {
                $('#status').text('Your credential is incorrect');
            });;
    });
});