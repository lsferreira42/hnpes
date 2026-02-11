(function() {
    'use strict';

    function sendToDebug(response, debug) {
        if (!debug) return;
        fetch('http://localhost:8080/debug', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(response),
        }).then(function() {}).catch(function() {});
    }

    const resultCache = {};
    let currentLanguage = 'en';

    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if (request.message === 'clearCache') {
            Object.keys(resultCache).forEach(function(k) { delete resultCache[k]; });
        }
    });

    const translations = {
        en: {
            searchingMessage: 'Searching for results...',
            noResultsMessage: 'This URL was never submitted.',
            allPagesSearchedNoResults: 'All pages have been searched but no results found on the same URL.',
            errorMessage: 'An error occurred while fetching data. Please try again.',
            retryButton: 'Try again',
            cannotSearchMessage: 'This page cannot be searched.',
            invalidUrlMessage: 'Please enter a valid http or https URL.',
            searchUrlLabel: 'Search URL:',
            searchPlaceholder: 'Paste URL or use current tab',
            searchButton: 'Search',
            submitToHN: 'Submit to Hacker News',
            shareOnTwitter: 'Share on Twitter',
            shareOnReddit: 'Share on Reddit',
            shareOnLinkedIn: 'Share on LinkedIn',
            shareOnFacebook: 'Share on Facebook',
            shareOnBluesky: 'Share on Bluesky',
            copyUrl: 'Copy URL',
            urlCopied: 'URL copied to clipboard!',
            sortBy: 'Sort by:',
            date: 'Date',
            comments: 'Comments',
            score: 'Score',
            darkMode: 'Dark Mode',
            lightMode: 'Light Mode',
            clearLocalData: 'Clear Local Data',
            exactMatch: 'Exact match',
            sameDomain: 'Same domain',
            timeFilterLabel: 'Time:',
            timeAll: 'All time',
            time1y: 'Last year',
            time5y: 'Last 5 years',
            optionsButton: 'Options'
        },
        pt: {
            searchingMessage: 'Buscando resultados...',
            noResultsMessage: 'Esta URL nunca foi submetida.',
            allPagesSearchedNoResults: 'Todas as páginas foram pesquisadas, mas não foram encontrados resultados para a mesma URL.',
            errorMessage: 'Ocorreu um erro ao buscar os dados. Por favor, tente novamente.',
            retryButton: 'Tentar novamente',
            cannotSearchMessage: 'Esta página não pode ser pesquisada.',
            invalidUrlMessage: 'Digite uma URL válida (http ou https).',
            searchUrlLabel: 'URL para buscar:',
            searchPlaceholder: 'Cole a URL ou use a aba atual',
            searchButton: 'Buscar',
            submitToHN: 'Enviar para Hacker News',
            shareOnTwitter: 'Compartilhar no Twitter',
            shareOnReddit: 'Compartilhar no Reddit',
            shareOnLinkedIn: 'Compartilhar no LinkedIn',
            shareOnFacebook: 'Compartilhar no Facebook',
            shareOnBluesky: 'Compartilhar no Bluesky',
            copyUrl: 'Copiar URL',
            urlCopied: 'URL copiada para a área de transferência!',
            sortBy: 'Ordenar por:',
            date: 'Data',
            comments: 'Comentários',
            score: 'Pontuação',
            darkMode: 'Modo Escuro',
            lightMode: 'Modo Claro',
            clearLocalData: 'Limpar Dados Locais',
            exactMatch: 'Correspondência exata',
            sameDomain: 'Mesmo domínio',
            timeFilterLabel: 'Período:',
            timeAll: 'Todo o período',
            time1y: 'Último ano',
            time5y: 'Últimos 5 anos',
            optionsButton: 'Opções'
        },
        es: {
            searchingMessage: 'Buscando resultados...',
            noResultsMessage: 'Esta URL nunca ha sido enviada.',
            allPagesSearchedNoResults: 'Se han buscado todas las páginas pero no se han encontrado resultados para la misma URL.',
            errorMessage: 'Se produjo un error al obtener los datos. Por favor, inténtelo de nuevo.',
            retryButton: 'Reintentar',
            cannotSearchMessage: 'Esta página no se puede buscar.',
            invalidUrlMessage: 'Introduzca una URL válida (http o https).',
            searchUrlLabel: 'URL a buscar:',
            searchPlaceholder: 'Pegar URL o usar pestaña actual',
            searchButton: 'Buscar',
            submitToHN: 'Enviar a Hacker News',
            shareOnTwitter: 'Compartir en Twitter',
            shareOnReddit: 'Compartir en Reddit',
            shareOnLinkedIn: 'Compartir en LinkedIn',
            shareOnFacebook: 'Compartir en Facebook',
            shareOnBluesky: 'Compartir en Bluesky',
            copyUrl: 'Copiar URL',
            urlCopied: '¡URL copiada al portapapeles!',
            sortBy: 'Ordenar por:',
            date: 'Fecha',
            comments: 'Comentarios',
            score: 'Puntuación',
            darkMode: 'Modo Oscuro',
            lightMode: 'Modo Claro',
            clearLocalData: 'Borrar Datos Locales',
            exactMatch: 'Coincidencia exacta',
            sameDomain: 'Mismo dominio',
            timeFilterLabel: 'Tiempo:',
            timeAll: 'Todo el tiempo',
            time1y: 'Último año',
            time5y: 'Últimos 5 años',
            optionsButton: 'Opciones'
        }
    };

    function translate(key) {
        return (translations[currentLanguage] && translations[currentLanguage][key]) || translations.en[key] || key;
    }

    function isSearchableUrl(url) {
        if (!url || typeof url !== 'string') return false;
        var u = url.trim().toLowerCase();
        return u.indexOf('http://') === 0 || u.indexOf('https://') === 0;
    }

    function normUrl(u) {
        try {
            var x = new URL(u);
            return (x.origin + x.pathname).replace(/\/$/, '') + (x.search || '');
        } catch (_) { return u; }
    }

    function addStyles() {
        var style = document.createElement('style');
        style.textContent = [
            'body{font-family:\'Segoe UI\',Tahoma,Geneva,Verdana,sans-serif;transition:background-color .3s,color .3s;margin:0;}',
            '.dark-theme{background:#222;color:#eee;}',
            '.dark-theme a{color:#6bc1ff;}',
            '.share-panel{border:1px solid #ddd;border-radius:8px;padding:15px;margin-top:20px;background:#f9f9f9;display:flex;flex-direction:column;gap:10px;}',
            '.dark-theme .share-panel{background:#333;border-color:#444;}',
            '.share-button{display:block;padding:8px 12px;margin:5px 0;text-decoration:none;color:#fff;border-radius:4px;text-align:center;cursor:pointer;}',
            '.hn-button{background:#ff6600;}',
            '.twitter-button{background:#1DA1F2;}',
            '.reddit-button{background:#FF4500;}',
            '.linkedin-button{background:#0077B5;}',
            '.facebook-button{background:#1877F2;}',
            '.bluesky-button{background:#0085FF;}',
            '.copy-button{background:#6c757d;}',
            '.loading{text-align:center;padding:20px;color:#666;}',
            '.dark-theme .loading{color:#bbb;}',
            '.loading-spinner{display:inline-block;width:18px;height:18px;border:2px solid #ddd;border-top-color:#ff6600;border-radius:50%;animation:hnpes-spin .7s linear infinite;vertical-align:middle;margin-right:8px;}',
            '@keyframes hnpes-spin{to{transform:rotate(360deg);}}',
            '.result-item{padding:10px;margin:10px 0;border-bottom:1px solid #eee;}',
            '.dark-theme .result-item{border-bottom-color:#444;}',
            '.result-title{font-weight:bold;margin-bottom:5px;}',
            '.result-details{font-size:0.8em;color:#666;}',
            '.dark-theme .result-details{color:#aaa;}',
            '.match-badge{font-size:0.75em;margin-left:6px;padding:2px 6px;border-radius:4px;background:#28a745;color:#fff;}',
            '.match-badge.same-domain{background:#6c757d;}',
            '.toolbar{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-bottom:15px;padding-bottom:10px;border-bottom:1px solid #eee;}',
            '.dark-theme .toolbar{border-bottom-color:#444;}',
            '.sort-options,.time-options{display:flex;gap:8px;align-items:center;flex-wrap:wrap;}',
            '.sort-button,.time-button{background:#f0f0f0;border:none;padding:5px 10px;border-radius:4px;cursor:pointer;font-size:0.8em;}',
            '.dark-theme .sort-button,.dark-theme .time-button{background:#444;color:#eee;}',
            '.sort-button.active,.time-button.active{background:#007bff;color:#fff;}',
            '.dark-theme .sort-button.active,.dark-theme .time-button.active{background:#0056b3;}',
            '.notification{position:fixed;top:20px;right:20px;padding:10px 15px;background:#28a745;color:#fff;border-radius:4px;opacity:0;transition:opacity .3s;z-index:1000;}',
            '.notification.show{opacity:1;}',
            '.retry-btn{margin-top:10px;padding:8px 14px;background:#ff6600;color:#fff;border:none;border-radius:4px;cursor:pointer;}'
        ].join('\n');
        document.head.appendChild(style);
    }

    function showNotification(msg, type) {
        var el = document.createElement('div');
        el.className = 'notification';
        el.textContent = msg;
        if (type === 'error') el.style.backgroundColor = '#dc3545';
        document.body.appendChild(el);
        el.offsetHeight;
        el.classList.add('show');
        setTimeout(function() {
            el.classList.remove('show');
            setTimeout(function() { el.remove(); }, 300);
        }, 2000);
    }

    function createToolbar() {
        var toolbar = document.createElement('div');
        toolbar.className = 'toolbar';
        var themeBtn = document.createElement('button');
        themeBtn.className = 'share-button';
        themeBtn.setAttribute('aria-label', translate('darkMode'));
        chrome.storage.sync.get(['darkMode'], function(d) {
            var isDark = d.darkMode;
            themeBtn.textContent = isDark ? translate('lightMode') : translate('darkMode');
            themeBtn.style.backgroundColor = isDark ? '#f8c200' : '#5c6bc0';
            if (isDark) document.body.classList.add('dark-theme');
        });
        themeBtn.addEventListener('click', function() {
            chrome.storage.sync.get(['darkMode'], function(d) {
                var next = !d.darkMode;
                chrome.storage.sync.set({ darkMode: next });
                document.body.classList.toggle('dark-theme', next);
                themeBtn.textContent = next ? translate('lightMode') : translate('darkMode');
                themeBtn.style.backgroundColor = next ? '#f8c200' : '#5c6bc0';
                themeBtn.setAttribute('aria-label', next ? translate('lightMode') : translate('darkMode'));
            });
        });
        var optBtn = document.createElement('button');
        optBtn.className = 'share-button';
        optBtn.textContent = translate('optionsButton');
        optBtn.style.backgroundColor = '#6c757d';
        optBtn.setAttribute('aria-label', 'Open extension options');
        optBtn.addEventListener('click', function() { chrome.runtime.openOptionsPage(); });
        toolbar.appendChild(themeBtn);
        toolbar.appendChild(optBtn);
        return toolbar;
    }

    function removeLoadingAndError(resultsDiv) {
        var loading = resultsDiv.querySelector('.loading');
        if (loading) loading.remove();
        var err = resultsDiv.querySelector('.error-message');
        if (err) err.remove();
        var retry = resultsDiv.querySelector('.retry-btn');
        if (retry) retry.remove();
    }

    function showLoading(resultsDiv) {
        removeLoadingAndError(resultsDiv);
        var wrap = document.createElement('div');
        wrap.className = 'loading';
        var spinner = document.createElement('span');
        spinner.className = 'loading-spinner';
        spinner.setAttribute('aria-hidden', 'true');
        wrap.appendChild(spinner);
        wrap.appendChild(document.createTextNode(' ' + translate('searchingMessage')));
        resultsDiv.appendChild(wrap);
    }

    function showError(resultsDiv, showRetry, onRetry) {
        removeLoadingAndError(resultsDiv);
        var msg = document.createElement('div');
        msg.className = 'error-message';
        msg.textContent = translate('errorMessage');
        resultsDiv.appendChild(msg);
        if (showRetry && onRetry) {
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'retry-btn';
            btn.textContent = translate('retryButton');
            btn.addEventListener('click', onRetry);
            resultsDiv.appendChild(btn);
        }
    }

    function fetchWithRetry(requestUrl, maxRetries) {
        maxRetries = maxRetries == null ? 2 : maxRetries;
        function attempt(n) {
            return fetch(requestUrl)
                .then(function(res) {
                    if (!res.ok) throw new Error('HTTP ' + res.status);
                    return res.json();
                })
                .catch(function(err) {
                    if (n < maxRetries) return new Promise(function(r) { setTimeout(r, 1000 + n * 500); }).then(function() { return attempt(n + 1); });
                    throw err;
                });
        }
        return attempt(0);
    }

    function buildAlgoliaUrl(domainAndPath, page, timeFilter) {
        var url = 'https://hn.algolia.com/api/v1/search?query=' + encodeURIComponent(domainAndPath) + '&page=' + page;
        if (timeFilter && timeFilter !== 'all') {
            var now = Math.floor(Date.now() / 1000);
            var oneYear = 365 * 24 * 3600;
            var minTs = timeFilter === '1y' ? now - oneYear : now - 5 * oneYear;
            url += '&numericFilters=created_at_i%3E' + minTs;
        }
        return url;
    }

    function formatDate(dateStr) {
        var d = new Date(dateStr);
        var pad = function(n) { return ('0' + n).slice(-2); };
        return pad(d.getMonth() + 1) + '/' + pad(d.getDate()) + '/' + String(d.getFullYear()).slice(-2) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
    }

    function initUI() {
        addStyles();
        var resultsDiv = document.getElementById('results');
        var header = document.querySelector('.header');
        if (header && resultsDiv) {
            var toolbar = createToolbar();
            header.parentNode.insertBefore(toolbar, header.nextSibling);
        }
        var customUrl = document.getElementById('customUrl');
        var searchBtn = document.getElementById('searchBtn');
        if (customUrl) customUrl.setAttribute('placeholder', translate('searchPlaceholder'));
        if (searchBtn) searchBtn.textContent = translate('searchButton');
        var label = document.getElementById('searchUrlLabel');
        if (label) label.textContent = translate('searchUrlLabel');
    }

    function runSearch(searchUrl, pageTitle, options) {
        options = options || {};
        var resultsDiv = document.getElementById('results');
        var url = (searchUrl || '').trim();
        var cacheTtlMs = (options.cacheTtl || 0) * 60 * 1000;

        if (!isSearchableUrl(url)) {
            removeLoadingAndError(resultsDiv);
            resultsDiv.textContent = options.fromInput ? translate('invalidUrlMessage') : translate('cannotSearchMessage');
            if (!options.fromInput) showSharePanel(resultsDiv, url || ' ', pageTitle || '');
            return;
        }

        showLoading(resultsDiv);
        var config = {
            resultsCount: options.resultsCount || 5,
            pagesCount: options.pagesCount || 10,
            debug: options.debug || false,
            privacyMode: options.privacyMode || false,
            customShareOptions: options.customShareOptions || [],
            defaultSort: options.defaultSort || 'date',
            timeFilter: options.timeFilter || 'all'
        };
        var page = 0;
        var allResults = [];
        var currentSort = config.defaultSort;
        var currentTimeFilter = config.timeFilter;
        var domainAndPath = new URL(url).hostname + new URL(url).pathname;
        var pageNorm = normUrl(url);

        function getCacheKey(p) {
            return url + '_' + currentTimeFilter + '_' + p;
        }
        function getCached(p) {
            if (config.privacyMode) return null;
            var entry = resultCache[getCacheKey(p)];
            if (!entry) return null;
            if (cacheTtlMs && entry.ts && (Date.now() - entry.ts > cacheTtlMs)) return null;
            return entry.data;
        }
        function setCached(p, data) {
            if (config.privacyMode) return;
            resultCache[getCacheKey(p)] = { data: data, ts: Date.now() };
        }

        function showSortAndTimePanels() {
            if (document.getElementById('sortPanel')) return;
            removeLoadingAndError(resultsDiv);
            var sortPanel = document.createElement('div');
            sortPanel.id = 'sortPanel';
            sortPanel.className = 'sort-options';
            sortPanel.setAttribute('role', 'group');
            sortPanel.setAttribute('aria-label', translate('sortBy'));
            var sortLabel = document.createElement('span');
            sortLabel.textContent = translate('sortBy');
            sortPanel.appendChild(sortLabel);
            ['date', 'comments', 'score'].forEach(function(val) {
                var btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'sort-button' + (currentSort === val ? ' active' : '');
                btn.textContent = translate(val);
                btn.dataset.sort = val;
                btn.setAttribute('aria-pressed', currentSort === val ? 'true' : 'false');
                btn.addEventListener('click', function() {
                    document.querySelectorAll('.sort-button').forEach(function(b) {
                        b.classList.remove('active');
                        b.setAttribute('aria-pressed', 'false');
                    });
                    this.classList.add('active');
                    this.setAttribute('aria-pressed', 'true');
                    currentSort = this.dataset.sort;
                    chrome.storage.sync.set({ defaultSort: currentSort });
                    sortAndDisplay();
                });
                sortPanel.appendChild(btn);
            });
            var timePanel = document.createElement('div');
            timePanel.id = 'timePanel';
            timePanel.className = 'time-options';
            timePanel.setAttribute('role', 'group');
            timePanel.setAttribute('aria-label', translate('timeFilterLabel'));
            var timeLabel = document.createElement('span');
            timeLabel.textContent = translate('timeFilterLabel');
            timePanel.appendChild(timeLabel);
            ['all', '1y', '5y'].forEach(function(val) {
                var btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'time-button' + (currentTimeFilter === val ? ' active' : '');
                btn.textContent = translate(val === 'all' ? 'timeAll' : val === '1y' ? 'time1y' : 'time5y');
                btn.dataset.time = val;
                btn.setAttribute('aria-pressed', currentTimeFilter === val ? 'true' : 'false');
                btn.addEventListener('click', function() {
                    document.querySelectorAll('.time-button').forEach(function(b) {
                        b.classList.remove('active');
                        b.setAttribute('aria-pressed', 'false');
                    });
                    this.classList.add('active');
                    this.setAttribute('aria-pressed', 'true');
                    currentTimeFilter = this.dataset.time;
                    chrome.storage.sync.set({ timeFilter: currentTimeFilter });
                    page = 0;
                    allResults = [];
                    resultsDiv.querySelectorAll('.result-item').forEach(function(el) { el.remove(); });
                    showLoading(resultsDiv);
                    fetchPage();
                });
                timePanel.appendChild(btn);
            });
            resultsDiv.insertBefore(timePanel, resultsDiv.firstChild);
            resultsDiv.insertBefore(sortPanel, resultsDiv.firstChild);
        }

        function sortAndDisplay() {
            document.querySelectorAll('.result-item').forEach(function(el) { el.remove(); });
            allResults.sort(function(a, b) {
                if (currentSort === 'date') return new Date(b.created_at) - new Date(a.created_at);
                if (currentSort === 'comments') return (b.num_comments || 0) - (a.num_comments || 0);
                return (b.points || 0) - (a.points || 0);
            });
            var sharePanel = document.getElementById('sharePanel');
            allResults.slice(0, config.resultsCount).forEach(function(r) {
                var exact = normUrl(r.url) === pageNorm;
                var container = document.createElement('div');
                container.className = 'result-item';
                var titleDiv = document.createElement('div');
                titleDiv.className = 'result-title';
                var link = document.createElement('a');
                link.href = 'https://news.ycombinator.com/item?id=' + r.objectID;
                link.textContent = r.title;
                link.target = '_blank';
                link.rel = 'noopener';
                titleDiv.appendChild(link);
                if (exact) {
                    var badge = document.createElement('span');
                    badge.className = 'match-badge';
                    badge.textContent = translate('exactMatch');
                    titleDiv.appendChild(badge);
                } else {
                    var sameBadge = document.createElement('span');
                    sameBadge.className = 'match-badge same-domain';
                    sameBadge.textContent = translate('sameDomain');
                    titleDiv.appendChild(sameBadge);
                }
                var details = document.createElement('div');
                details.className = 'result-details';
                details.textContent = (r.points || 0) + ' points | by ' + (r.author || 'unknown') + ' | ' + formatDate(r.created_at) + ' | ' + (r.num_comments || 0) + ' comments';
                container.appendChild(titleDiv);
                container.appendChild(details);
                if (sharePanel) resultsDiv.insertBefore(container, sharePanel);
                else resultsDiv.appendChild(container);
            });
        }

        function displayResult(r) {
            var exact = normUrl(r.url) === pageNorm;
            var container = document.createElement('div');
            container.className = 'result-item';
            var titleDiv = document.createElement('div');
            titleDiv.className = 'result-title';
            var link = document.createElement('a');
            link.href = 'https://news.ycombinator.com/item?id=' + r.objectID;
            link.textContent = r.title;
            link.target = '_blank';
            link.rel = 'noopener';
            titleDiv.appendChild(link);
            var badge = document.createElement('span');
            badge.className = exact ? 'match-badge' : 'match-badge same-domain';
            badge.textContent = exact ? translate('exactMatch') : translate('sameDomain');
            titleDiv.appendChild(badge);
            var details = document.createElement('div');
            details.className = 'result-details';
            details.textContent = (r.points || 0) + ' points | by ' + (r.author || 'unknown') + ' | ' + formatDate(r.created_at) + ' | ' + (r.num_comments || 0) + ' comments';
            container.appendChild(titleDiv);
            container.appendChild(details);
            var sharePanel = document.getElementById('sharePanel');
            if (sharePanel) resultsDiv.insertBefore(container, sharePanel);
            else resultsDiv.appendChild(container);
        }

        function showSharePanel(container, shareUrl, title) {
            if (document.getElementById('sharePanel')) return;
            var panel = document.createElement('div');
            panel.id = 'sharePanel';
            panel.className = 'share-panel';
            chrome.storage.sync.get(['shareButtons'], function(d) {
                var shareButtons = d.shareButtons || { hnButton: true, twitterButton: false, redditButton: false, linkedinButton: false, facebookButton: false, blueskyButton: true, copyButton: false };
                if (shareButtons.hnButton !== false) {
                    var a = document.createElement('a');
                    a.href = 'https://news.ycombinator.com/submitlink?u=' + encodeURIComponent(shareUrl) + '&t=' + encodeURIComponent(title);
                    a.textContent = translate('submitToHN');
                    a.target = '_blank';
                    a.className = 'share-button hn-button';
                    a.setAttribute('aria-label', translate('submitToHN'));
                    panel.appendChild(a);
                }
                if (shareButtons.twitterButton !== false) {
                    a = document.createElement('a');
                    a.href = 'https://twitter.com/intent/tweet?url=' + encodeURIComponent(shareUrl) + '&text=' + encodeURIComponent(title);
                    a.textContent = translate('shareOnTwitter');
                    a.target = '_blank';
                    a.className = 'share-button twitter-button';
                    a.setAttribute('aria-label', translate('shareOnTwitter'));
                    panel.appendChild(a);
                }
                if (shareButtons.redditButton !== false) {
                    a = document.createElement('a');
                    a.href = 'https://reddit.com/submit?url=' + encodeURIComponent(shareUrl) + '&title=' + encodeURIComponent(title);
                    a.textContent = translate('shareOnReddit');
                    a.target = '_blank';
                    a.className = 'share-button reddit-button';
                    panel.appendChild(a);
                }
                if (shareButtons.linkedinButton !== false) {
                    a = document.createElement('a');
                    a.href = 'https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(shareUrl);
                    a.textContent = translate('shareOnLinkedIn');
                    a.target = '_blank';
                    a.className = 'share-button linkedin-button';
                    panel.appendChild(a);
                }
                if (shareButtons.facebookButton !== false) {
                    a = document.createElement('a');
                    a.href = 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(shareUrl);
                    a.textContent = translate('shareOnFacebook');
                    a.target = '_blank';
                    a.className = 'share-button facebook-button';
                    panel.appendChild(a);
                }
                if (shareButtons.blueskyButton !== false) {
                    a = document.createElement('a');
                    a.href = '#';
                    a.textContent = translate('shareOnBluesky');
                    a.className = 'share-button bluesky-button';
                    a.addEventListener('click', function(e) {
                        e.preventDefault();
                        navigator.clipboard.writeText(title + ' ' + shareUrl).then(function() {
                            showNotification('URL and title copied! Paste to share on Bluesky');
                            window.open('https://bsky.app/', '_blank');
                        });
                    });
                    panel.appendChild(a);
                }
                if (shareButtons.copyButton !== false) {
                    var copyBtn = document.createElement('a');
                    copyBtn.href = '#';
                    copyBtn.textContent = translate('copyUrl');
                    copyBtn.className = 'share-button copy-button';
                    copyBtn.addEventListener('click', function(e) {
                        e.preventDefault();
                        navigator.clipboard.writeText(shareUrl).then(function() { showNotification(translate('urlCopied')); });
                    });
                    panel.appendChild(copyBtn);
                }
                (config.customShareOptions || []).forEach(function(opt) {
                    if (!opt.enabled) return;
                    var c = document.createElement('a');
                    c.href = (opt.url || '').replace('{url}', encodeURIComponent(shareUrl)).replace('{title}', encodeURIComponent(title));
                    c.textContent = opt.name;
                    c.target = '_blank';
                    c.className = 'share-button';
                    c.style.backgroundColor = opt.color || '#6c757d';
                    panel.appendChild(c);
                });
                (container || resultsDiv).appendChild(panel);
            });
        }

        function processResults(response) {
            if (config.debug) sendToDebug(response, true);
            setCached(page, response);
            var found = false;
            if (response.nbHits > 0 && response.hits) {
                response.hits.forEach(function(h) {
                    if (h.title && h.objectID && url.indexOf(h.url) !== -1) {
                        allResults.push(h);
                        found = true;
                    }
                });
                page++;
                if (found && allResults.length < config.resultsCount && page < config.pagesCount) {
                    fetchPage();
                    return;
                }
            } else {
                page++;
                if (page < config.pagesCount) {
                    fetchPage();
                    return;
                }
            }
            removeLoadingAndError(resultsDiv);
            if (allResults.length === 0) {
                resultsDiv.textContent = translate('noResultsMessage');
            } else {
                showSortAndTimePanels();
                sortAndDisplay();
            }
            showSharePanel(resultsDiv, url, pageTitle || '');
        }

        function fetchPage() {
            if (page >= config.pagesCount) {
                removeLoadingAndError(resultsDiv);
                if (allResults.length === 0) resultsDiv.textContent = translate('allPagesSearchedNoResults');
                showSharePanel(resultsDiv, url, pageTitle || '');
                return;
            }
            var cached = getCached(page);
            if (cached) {
                processResults(cached);
                return;
            }
            var requestUrl = buildAlgoliaUrl(domainAndPath, page, currentTimeFilter);
            fetchWithRetry(requestUrl)
                .then(processResults)
                .catch(function() {
                    showError(resultsDiv, true, function() {
                        page = 0;
                        allResults = [];
                        showLoading(resultsDiv);
                        fetchPage();
                    });
                    showSharePanel(resultsDiv, url, pageTitle || '');
                });
        }

        if (page === 0) {
            while (resultsDiv.firstChild) resultsDiv.removeChild(resultsDiv.firstChild);
        }
        fetchPage();
    }

    chrome.runtime.sendMessage({ message: 'getTabUrl' }, function(response) {
        response = response || {};
        var tabUrl = (response.url || '').trim();
        var tabTitle = response.title || '';
        initUI();
        var customUrl = document.getElementById('customUrl');
        var resultsDiv = document.getElementById('results');
        if (customUrl) customUrl.value = tabUrl;

        chrome.storage.sync.get([
            'resultsCount', 'pagesCount', 'debug', 'language', 'customShareOptions', 'privacyMode',
            'defaultSort', 'timeFilter', 'cacheTtl'
        ], function(data) {
            currentLanguage = data.language || 'en';
            var opts = {
                resultsCount: parseInt(data.resultsCount, 10) || 5,
                pagesCount: parseInt(data.pagesCount, 10) || 10,
                debug: !!data.debug,
                privacyMode: !!data.privacyMode,
                customShareOptions: data.customShareOptions || [],
                defaultSort: data.defaultSort || 'date',
                timeFilter: data.timeFilter || 'all',
                cacheTtl: parseInt(data.cacheTtl, 10) || 0
            };
            function doSearch() {
                var urlToSearch = (customUrl && customUrl.value.trim()) || tabUrl;
                runSearch(urlToSearch, tabTitle, opts);
            }
            document.getElementById('searchBtn').addEventListener('click', function() {
                opts.fromInput = true;
                runSearch((customUrl && customUrl.value.trim()) || '', tabTitle, opts);
            });
            customUrl.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') {
                    opts.fromInput = true;
                    runSearch((customUrl.value || '').trim(), tabTitle, opts);
                }
            });
            doSearch();
        });
    });
})();
