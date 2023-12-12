document.addEventListener('DOMContentLoaded', function () {
    chrome.storage.sync.get(['resultsCount', 'pagesCount', 'debug'], function(items) {
        document.getElementById('resultsCount').value = items.resultsCount || 5;
        document.getElementById('pagesCount').value = items.pagesCount || 10;
        let debugCheckbox = document.getElementById('debug');
        debugCheckbox.checked = items.debug || false;
    });

    document.getElementById('saveButton').addEventListener('click', function() {
        let resultsCount = document.getElementById('resultsCount').value;
        let pagesCount = document.getElementById('pagesCount').value;
        let debug = document.getElementById('debug').checked;
        chrome.storage.sync.set({
            'resultsCount': resultsCount,
            'pagesCount': pagesCount,
            'debug': debug
        }, function() {
            let saveMessage = document.getElementById('saveMessage');
            saveMessage.innerText = 'Settings saved.';
            setTimeout(function() {
                saveMessage.innerText = '';
            }, 2000);
        });
    });
});
