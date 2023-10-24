// This listener fires when the alarm goes off
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "drinkWater") {
    chrome.notifications.create({
      type: "basic",
      iconUrl: "icon.png",
      title: "AquaAlert Reminder",
      message: "Time to hydrate yourself!",
    });
  }
});

// If you wish to create an initial setup or other operations when the extension is installed/updated:
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install" || details.reason === "update") {
    // Initialize things here if needed
  }
});
