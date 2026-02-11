(function() {
    const params = new URLSearchParams(location.search);
    const url = params.get('url') || '';
    const resultsDiv = document.getElementById('results');

    function isSearchableUrl(u) {
        if (!u || typeof u !== 'string') return false;
        const s = u.trim().toLowerCase();
        return s.startsWith('http://') || s.startsWith('https://');
    }

    function normUrl(u) {
        try {
            const x = new URL(u);
            return (x.origin + x.pathname).replace(/\/$/, '') + (x.search || '');
        } catch (_) { return u; }
    }

    function buildRequestUrl(page, timeFilter) {
        const domainAndPath = new URL(url).hostname + new URL(url).pathname;
        let req = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(domainAndPath)}&page=${page}`;
        if (timeFilter && timeFilter !== 'all') {
            const now = Math.floor(Date.now() / 1000);
            const oneYear = 365 * 24 * 3600;
            const minTs = timeFilter === '1y' ? now - oneYear : now - 5 * oneYear;
            req += '&numericFilters=created_at_i>' + minTs;
        }
        return req;
    }

    function fetchWithRetry(requestUrl, maxRetries) {
        maxRetries = maxRetries || 2;
        function attempt(n) {
            return fetch(requestUrl)
                .then(res => { if (!res.ok) throw new Error('HTTP ' + res.status); return res.json(); })
                .catch(err => {
                    if (n < maxRetries) return new Promise(r => setTimeout(r, 1000)).then(() => attempt(n + 1));
                    throw err;
                });
        }
        return attempt(0);
    }

    function formatDate(dateString) {
        const d = new Date(dateString);
        const pad = n => ('0' + n).slice(-2);
        return pad(d.getMonth() + 1) + '/' + pad(d.getDate()) + '/' + String(d.getFullYear()).slice(-2) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
    }

    function render(results, searchUrl) {
        resultsDiv.innerHTML = '';
        const pageNorm = normUrl(searchUrl);
        results.forEach(function(result) {
            const item = document.createElement('div');
            item.className = 'result-item';
            const exact = normUrl(result.url) === pageNorm;
            const link = document.createElement('a');
            link.href = 'https://news.ycombinator.com/item?id=' + result.objectID;
            link.target = '_blank';
            link.textContent = result.title;
            const titleDiv = document.createElement('div');
            titleDiv.className = 'result-title';
            titleDiv.appendChild(link);
            if (exact) {
                const badge = document.createElement('span');
                badge.className = 'match-badge';
                badge.textContent = 'Exact match';
                titleDiv.appendChild(badge);
            }
            item.appendChild(titleDiv);
            const details = document.createElement('div');
            details.className = 'result-details';
            details.textContent = (result.points || 0) + ' points | by ' + (result.author || 'unknown') + ' | ' + formatDate(result.created_at) + ' | ' + (result.num_comments || 0) + ' comments';
            item.appendChild(details);
            resultsDiv.appendChild(item);
        });
    }

    function showError(withRetry) {
        resultsDiv.innerHTML = '<div class="error">An error occurred while fetching data.</div>';
        if (withRetry) {
            const btn = document.createElement('button');
            btn.className = 'retry-btn';
            btn.textContent = 'Try again';
            btn.onclick = run;
            resultsDiv.appendChild(btn);
        }
    }

    function run() {
        if (!isSearchableUrl(url)) {
            resultsDiv.innerHTML = '<div class="error">This URL cannot be searched.</div>';
            return;
        }
        resultsDiv.innerHTML = '<div class="loading">Searching for results...</div>';
        const timeFilter = 'all';
        let allResults = [];
        let page = 0;
        const pagesCount = 5;

        function fetchPage() {
            const requestUrl = buildRequestUrl(page, timeFilter);
            fetchWithRetry(requestUrl)
                .then(function(response) {
                    if (response.hits && response.hits.length) {
                        response.hits.forEach(function(h) {
                            if (h.title && h.objectID && url.includes(h.url)) allResults.push(h);
                        });
                        page++;
                        if (page < pagesCount && response.nbHits >= response.hits.length) fetchPage();
                        else {
                            allResults.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                            render(allResults.slice(0, 20), url);
                        }
                    } else {
                        if (allResults.length) render(allResults, url);
                        else resultsDiv.innerHTML = '<div class="loading">This URL was never submitted.</div>';
                    }
                })
                .catch(function() { showError(true); });
        }
        fetchPage();
    }

    run();
})();
