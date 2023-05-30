document.addEventListener('DOMContentLoaded', function () {
    chrome.storage.sync.get(['resultsCount', 'pagesCount'], function(items) {
        document.getElementById('resultsCount').value = items.resultsCount || 3;
        document.getElementById('pagesCount').value = items.pagesCount || 1;
    });

    document.getElementById('saveButton').addEventListener('click', function() {
        let resultsCount = document.getElementById('resultsCount').value;
        let pagesCount = document.getElementById('pagesCount').value;
        chrome.storage.sync.set({
            'resultsCount': resultsCount,
            'pagesCount': pagesCount
        }, function() {
            let saveMessage = document.getElementById('saveMessage');
            saveMessage.innerText = 'Settings saved.';
            setTimeout(function() {
                saveMessage.innerText = '';
            }, 2000);
        });
    });
});
