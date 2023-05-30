chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.message === 'getTabUrl') {
        chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
            sendResponse({ url: tabs[0].url });
        });
        return true;
    }
});
