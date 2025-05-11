document.addEventListener('DOMContentLoaded', function() {
    // Update last cleaned time in popup
    updateLastCleanedTime();

    // Add click handler for manual cleaning
    document.getElementById('cleanNow').addEventListener('click', function() {
        chrome.runtime.getBackgroundPage(function(backgroundPage) {
            backgroundPage.clearBrowsingData();

            // Update status message after a short delay
            setTimeout(updateLastCleanedTime, 500);
        });
    });

    // Add click handler for force clean next startup
    document.getElementById('forceClean').addEventListener('click', function() {
        chrome.storage.local.set({ shouldClean: true }, function() {
            alert('다음 브라우저 활성화 시 기록이 자동으로 삭제됩니다.');
        });
    });
});

function updateLastCleanedTime() {
    chrome.storage.local.get('lastCleaned', function(data) {
        const lastCleanedElement = document.getElementById('lastCleanedTime');
        if (data.lastCleaned) {
            const date = new Date(data.lastCleaned);
            lastCleanedElement.textContent = date.toLocaleString();
        } else {
            lastCleanedElement.textContent = '기록 없음';
        }
    });
}