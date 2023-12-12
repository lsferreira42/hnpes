chrome.runtime.sendMessage({ message: 'getTabUrl' }, response => {
    let url = response.url;
    let resultsDiv = document.getElementById('results');

    chrome.storage.sync.get(['resultsCount', 'pagesCount'], function(data) {
        let resultsCount = data.resultsCount || 3;
        let pagesCount = data.pagesCount || 1;
        let count = 0;
        let page = 0;

        function fetchPage() {
            chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
                let currentTab = tabs[0];
                let pageTitle = currentTab.title;
        
                function showAdditionalSharingOptions() {
                    let sharePanel = document.createElement('div');
                    sharePanel.id = 'sharePanel';
                    sharePanel.style.border = '1px solid black';
                    sharePanel.style.padding = '10px';
                    sharePanel.style.marginTop = '10px';
        
                    let twitterLink = document.createElement('a');
                    twitterLink.href = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(pageTitle)}`;
                    twitterLink.innerText = 'Share on Twitter';
                    twitterLink.target = '_blank';
        
                    let redditLink = document.createElement('a');
                    redditLink.href = `https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(pageTitle)}`;
                    redditLink.innerText = 'Share on Reddit';
                    redditLink.target = '_blank';
        
                    sharePanel.appendChild(twitterLink);
                    sharePanel.appendChild(document.createElement('br'));
                    sharePanel.appendChild(redditLink);
                    
                    resultsDiv.appendChild(sharePanel);
                }
        
                if (page >= pagesCount) {
                    if (count === 0) {
                        resultsDiv.innerText = 'All pages have been searched but no results found on the same URL.';
                        
                        let submitLink = document.createElement('a');
                        submitLink.href = `https://news.ycombinator.com/submitlink?u=${encodeURIComponent(url)}&t=${encodeURIComponent(pageTitle)}`;
                        submitLink.innerText = 'Submit this URL to Hacker News';
                        submitLink.target = '_blank';
                        
                        resultsDiv.appendChild(document.createElement('br'));
                        resultsDiv.appendChild(submitLink);
                        
                        // Show the additional sharing options right after the submit link
                        showAdditionalSharingOptions();
                    }
                    return;
                }
        
                let requestUrl = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(url)}&page=${page}`;
        
                fetch(requestUrl)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`HTTP error: ${response.status}`);
                        }
                        return response.json();
                    })
                    .then(response => {
                        if (response.nbHits > 0) {
                            for (let i = 0; i < response.hits.length && count < resultsCount; i++) {
                                let result = response.hits[i];
                                if (result.title && result.objectID && url.includes(result.url)) {
                                    let link = document.createElement('a');
                                    link.href = 'https://news.ycombinator.com/item?id=' + result.objectID;
                                    link.innerText = result.title;
                                    link.target = '_blank';
                                    resultsDiv.appendChild(link);
                                    resultsDiv.appendChild(document.createElement('br'));
                                    count++;
                                }
                            }
                            page++;
                            if (count < resultsCount) {
                                fetchPage();
                            }
                        } else {
                            resultsDiv.innerText = 'This URL was never submitted.';
        
                            let submitLink = document.createElement('a');
                            submitLink.href = `https://news.ycombinator.com/submitlink?u=${encodeURIComponent(url)}&t=${encodeURIComponent(pageTitle)}`;
                            submitLink.innerText = 'Submit this URL to Hacker News';
                            submitLink.target = '_blank';
                            
                            resultsDiv.appendChild(document.createElement('br'));
                            resultsDiv.appendChild(submitLink);
                            
                            // Show the additional sharing options right after the submit link
                            showAdditionalSharingOptions();
                        }
                    })
                    .catch(e => {
                        console.error(`Fetch failed: ${e}`);
                        resultsDiv.innerText = 'An error occurred while fetching data. Please try again.';
                    });
            });
        }
        
        
        fetchPage();
    });
});
