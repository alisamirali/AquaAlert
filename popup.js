// Global variable to hold the interval reference for the countdown
let countdownInterval;

// Initialize when the popup's DOM is fully loaded
document.addEventListener("DOMContentLoaded", function () {
  // Update the displayed timer and set the stored choice when the popup is opened
  updateDisplayFromStorage();

  // Fetch and set the stored interval choice when the popup is loaded
  chrome.storage.local.get("chosenInterval", function (data) {
    if (data.chosenInterval) {
      document.getElementById("intervalChoice").value = data.chosenInterval;
    }
  });

  // Event listeners for various buttons in the popup
  document
    .getElementById("startReminder")
    .addEventListener("click", startWaterReminder);
  document
    .getElementById("stopReminder")
    .addEventListener("click", stopWaterReminder);
  document
    .getElementById("resetReminder")
    .addEventListener("click", resetWaterReminder);
  document.getElementById("closePopup").addEventListener("click", function () {
    window.close();
  });
  document
    .getElementById("intervalChoice")
    .addEventListener("change", updateIntervalDisplay);
});

function startWaterReminder() {
  const chosenInterval = parseInt(
    document.getElementById("intervalChoice").value,
    10
  );

  let endTime;
  chrome.storage.local.get(
    ["endTime", "reminderPaused", "pausedAt"],
    function (data) {
      if (data.reminderPaused) {
        // Adjust the endTime based on how long the timer was paused
        const timePaused = new Date().getTime() - data.pausedAt;
        endTime = data.endTime + timePaused;
      } else {
        endTime = new Date().getTime() + chosenInterval * 60 * 1000;
      }
      setReminder(endTime, chosenInterval);
    }
  );
}

function setReminder(endTime, chosenInterval) {
  chrome.alarms.create("drinkWater", { periodInMinutes: chosenInterval });
  chrome.storage.local.set({
    endTime: endTime,
    chosenInterval: chosenInterval,
    reminderPaused: false,
    pausedAt: null, // Reset the pausedAt variable
  });
  updateDisplayFromStorage();
}

function stopWaterReminder() {
  chrome.alarms.clear("drinkWater");
  clearInterval(countdownInterval);

  // Mark the current time the reminder was paused
  const pausedAt = new Date().getTime();

  chrome.storage.local.set({
    reminderPaused: true,
    pausedAt: pausedAt,
  });
}

function resetWaterReminder() {
  chrome.alarms.clear("drinkWater");
  clearInterval(countdownInterval);

  const chosenInterval = document.getElementById("intervalChoice").value;
  document.getElementById("timeLeft").innerText = `${chosenInterval}:00`;

  // Update the stored values to reflect the reset
  chrome.storage.local.set({
    reminderPaused: false, // Ensure the reminder is not paused
    pausedAt: null, // Clear the pausedAt value
    chosenInterval: chosenInterval,
  });
}

function updateDisplayFromStorage() {
  clearInterval(countdownInterval);

  chrome.storage.local.get(
    ["endTime", "chosenInterval", "reminderPaused", "pausedAt"],
    function (data) {
      if (data.endTime && !data.reminderPaused) {
        updateDisplay(data.endTime);
        countdownInterval = setInterval(function () {
          updateDisplay(data.endTime);
        }, 1000);
      } else if (data.reminderPaused) {
        updateDisplay(data.endTime); // Show paused time without starting countdown
      } else {
        const intervalToShow = data.chosenInterval || "90";
        document.getElementById("intervalChoice").value = intervalToShow;
        document.getElementById("timeLeft").innerText = `${intervalToShow}:00`;
      }
    }
  );
}

function updateDisplay(endTime) {
  const now = new Date().getTime();
  const diffInSeconds = Math.floor((endTime - now) / 1000);

  if (diffInSeconds <= 0) {
    clearInterval(countdownInterval);
    document.getElementById("timeLeft").innerText = "Time's up!";
    return;
  }

  const minutes = Math.floor(diffInSeconds / 60);
  const seconds = diffInSeconds % 60;
  document.getElementById("timeLeft").innerText = `${minutes}:${
    seconds < 10 ? "0" : ""
  }${seconds}`;
}

function updateIntervalDisplay() {
  const chosenInterval = document.getElementById("intervalChoice").value;
  document.getElementById("timeLeft").innerText = `${chosenInterval}:00`;
}

window.addEventListener("unload", function () {
  clearInterval(countdownInterval);
});
