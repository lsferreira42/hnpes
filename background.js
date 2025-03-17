chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.message === 'getTabUrl') {
        chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
            if (tabs && tabs.length > 0) {
                sendResponse({ url: tabs[0].url });
            } else {
                sendResponse({ url: '' });
            }
        });
        return true;
    } else if (request.message === 'clearCache') {
        // Retransmite a mensagem para todas as abas ativas da extensão
        chrome.tabs.query({}, function(tabs) {
            tabs.forEach(function(tab) {
                chrome.tabs.sendMessage(tab.id, { message: 'clearCache' })
                    .catch(error => console.log('No listener in this tab:', tab.id));
            });
        });
    }
});
