chrome.runtime.sendMessage({ message: 'getTabUrl' }, response => {
    let url = response.url;
    let resultsDiv = document.getElementById('results');

    chrome.storage.sync.get(['resultsCount', 'pagesCount'], function(data) {
        let resultsCount = data.resultsCount || 3;
        let pagesCount = data.pagesCount || 1;
        let count = 0;
        let page = 0;

        function fetchPage() {
            if (page >= pagesCount) {
                if (count === 0) {
                    resultsDiv.innerText = 'All pages have been searched but no results found on the same URL.';
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
                        resultsDiv.innerText = `This URL was never submmited.`;
                    }
                })
                .catch(e => {
                    console.error(`Fetch failed: ${e}`);
                    resultsDiv.innerText = 'An error occurred while fetching data. Please try again.';
                });
        }

        fetchPage();
    });
});
