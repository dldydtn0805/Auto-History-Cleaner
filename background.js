// This script runs in the background and handles the cleaning operation

// Function to clear browsing data
function clearBrowsingData() {
    chrome.browsingData.remove({
        "since": 0  // Clear all history (0 means beginning of time)
    }, {
        "history": true,     // Clear browsing history
        "downloads": true    // Clear download history
    }, function() {
        console.log("History and downloads cleared successfully");

        // Save last cleaning time
        const now = new Date().toISOString();
        chrome.storage.local.set({ lastCleaned: now }, function() {
            console.log("Last cleaned time updated:", now);
        });
    });
}

// 1. When extension is installed or updated
chrome.runtime.onInstalled.addListener((details) => {
    console.log("Extension installed or updated");

    // Clear data immediately
    clearBrowsingData();

    // Create an alarm that triggers every 60 seconds to check browser state
    chrome.alarms.create('checkBrowserState', { periodInMinutes: 1 });
});

// 2. When browser starts
chrome.runtime.onStartup.addListener(() => {
    console.log("Browser started");

    // Set flag to indicate we should clean on next activity
    chrome.storage.local.set({ shouldClean: true });

    // Create alarm if it doesn't exist
    chrome.alarms.create('checkBrowserState', { periodInMinutes: 1 });
});

// 3. When a tab is activated
chrome.tabs.onActivated.addListener((activeInfo) => {
    checkAndClean();
});

// 4. When a tab is updated (URL changes, page loads, etc)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete') {
        checkAndClean();
    }
});

// 5. When the alarm triggers every minute
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'checkBrowserState') {
        checkAndClean();
    }
});

// Function to check if we should clean and do it if needed
function checkAndClean() {
    chrome.storage.local.get(['shouldClean', 'lastCleaned'], (data) => {
        const now = new Date();
        const lastCleaned = data.lastCleaned ? new Date(data.lastCleaned) : null;

        // Clean if flag is set or if it's been more than 5 minutes since last clean
        if (data.shouldClean || !lastCleaned || (now - lastCleaned > 5 * 60 * 1000)) {
            console.log("Cleaning browser data due to browser activity");
            clearBrowsingData();

            // Reset the flag
            chrome.storage.local.set({ shouldClean: false });
        }
    });
}

// Expose clearBrowsingData so it can be called from popup
if (typeof window !== 'undefined') {
    window.clearBrowsingData = clearBrowsingData;
}