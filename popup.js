function sendToDebug(response) {
    fetch('http://localhost:8080/debug', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(response),
    })
    .then(res => res.json())
    .then(data => console.log('Success:', data))
    .catch((error) => console.error('Error:', error));
}

chrome.runtime.sendMessage({ message: 'getTabUrl' }, response => {
    let url = response.url;
    let resultsDiv = document.getElementById('results');

    chrome.storage.sync.get(['resultsCount', 'pagesCount', 'debug'], function(data) {
        let resultsCount = data.resultsCount || 1;
        let pagesCount = data.pagesCount || 3;
        let debug = data.debug || false;
        let count = 0;
        let page = 0;

        function formatDate(dateString) {
            let date = new Date(dateString);
            let day = ('0' + date.getDate()).slice(-2);
            let month = ('0' + (date.getMonth() + 1)).slice(-2);
            let year = date.getFullYear().toString().slice(-2);
            let hours = ('0' + date.getHours()).slice(-2);
            let minutes = ('0' + date.getMinutes()).slice(-2);
            let seconds = ('0' + date.getSeconds()).slice(-2);
            return `${month}/${day}/${year} ${hours}:${minutes}:${seconds}`;
        }

        function fetchPage() {
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                let currentTab = tabs[0];
                let pageTitle = currentTab.title;

                function showAdditionalSharingOptions() {
                    // Check if the sharePanel already exists
                    let sharePanel = document.getElementById('sharePanel');
                
                    if (!sharePanel) {
                        sharePanel = document.createElement('div');
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
                        if (debug) {
                            sendToDebug(response);
                        }
                        if (response.nbHits > 0) {
                            for (let i = 0; i < response.hits.length && count < resultsCount; i++) {
                                let result = response.hits[i];
                                if (result.title && result.objectID && url.includes(result.url)) {
                                    let link = document.createElement('a');
                                    link.href = 'https://news.ycombinator.com/item?id=' + result.objectID;
                                    link.innerText = result.title;
                                    link.target = '_blank';

                                    let details = document.createElement('span');
                                    details.innerText = ` - Posted on: ${formatDate(result.created_at)} - Comments: ${result.num_comments || 'N/A'}`;

                                    let container = document.createElement('div');
                                    container.appendChild(link);
                                    container.appendChild(details);
                                    resultsDiv.appendChild(container);
                                    count++;
                                }
                            }
                            page++;
                            if (count < resultsCount) {
                                fetchPage();
                            }
                            showAdditionalSharingOptions();
                        } else {
                            resultsDiv.innerText = 'This URL was never submitted.';

                            let submitLink = document.createElement('a');
                            submitLink.href = `https://news.ycombinator.com/submitlink?u=${encodeURIComponent(url)}&t=${encodeURIComponent(pageTitle)}`;
                            submitLink.innerText = 'Submit this URL to Hacker News';
                            submitLink.target = '_blank';

                            resultsDiv.appendChild(document.createElement('br'));
                            resultsDiv.appendChild(submitLink);
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
