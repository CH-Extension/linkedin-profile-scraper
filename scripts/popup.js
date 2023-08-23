
var background = chrome.extension.getBackgroundPage();

var tab;

//get current tab url
function checkLinkedin() {
    // https://developer.chrome.com/extensions/tabs#method-query
    var queryInfo = { active: true, currentWindow: true };

    chrome.tabs.query(queryInfo, function(tabs) {
        tab = tabs[0];
        activeTab = tab.id;
        var url = tab.url;
    
        if (url.indexOf("linkedin") > -1) {
            alert("here");
        } else {
            $("body").css({"width": "250px", "height": "40px"});
            $("#result").html("<div class='h6 text-justify'>You can't run this extension.</div><div class='h6 text-justify'>Please check the website URL.</div>");
			return false;
        }
    });
}

chrome.storage.sync.get(['convertlead_email', 'convertlead_pwd'], function(result) {
    if (result.convertlead_pwd != undefined && result.convertlead_email != undefined) {
        checkLinkedin();
    } else {
        $("#result").html("<div class='h6'>Please go to the Options and enter your license.</div>");
    }
    return false;        
});
