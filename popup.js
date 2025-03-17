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

// Cache para armazenar resultados recentes
const resultCache = {};

// Seleção de idioma padrão
let currentLanguage = 'en';

// Listener para limpar o cache quando solicitado pelas opções
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.message === 'clearCache') {
        // Limpa o cache de resultados
        Object.keys(resultCache).forEach(key => delete resultCache[key]);
        console.log('Cache cleared by options page');
    }
});

// Traduções disponíveis
const translations = {
    'en': {
        'searchingMessage': 'Searching for results...',
        'noResultsMessage': 'This URL was never submitted.',
        'allPagesSearchedNoResults': 'All pages have been searched but no results found on the same URL.',
        'errorMessage': 'An error occurred while fetching data. Please try again.',
        'submitToHN': 'Submit to Hacker News',
        'shareOnTwitter': 'Share on Twitter',
        'shareOnReddit': 'Share on Reddit',
        'shareOnLinkedIn': 'Share on LinkedIn',
        'shareOnFacebook': 'Share on Facebook',
        'shareOnBluesky': 'Share on Bluesky',
        'copyUrl': 'Copy URL',
        'urlCopied': 'URL copied to clipboard!',
        'sortBy': 'Sort by:',
        'date': 'Date',
        'comments': 'Comments',
        'score': 'Score',
        'darkMode': 'Dark Mode',
        'lightMode': 'Light Mode',
        'clearLocalData': 'Clear Local Data'
    },
    'pt': {
        'searchingMessage': 'Buscando resultados...',
        'noResultsMessage': 'Esta URL nunca foi submetida.',
        'allPagesSearchedNoResults': 'Todas as páginas foram pesquisadas, mas não foram encontrados resultados para a mesma URL.',
        'errorMessage': 'Ocorreu um erro ao buscar os dados. Por favor, tente novamente.',
        'submitToHN': 'Enviar para Hacker News',
        'shareOnTwitter': 'Compartilhar no Twitter',
        'shareOnReddit': 'Compartilhar no Reddit',
        'shareOnLinkedIn': 'Compartilhar no LinkedIn',
        'shareOnFacebook': 'Compartilhar no Facebook',
        'shareOnBluesky': 'Compartilhar no Bluesky',
        'copyUrl': 'Copiar URL',
        'urlCopied': 'URL copiada para a área de transferência!',
        'sortBy': 'Ordenar por:',
        'date': 'Data',
        'comments': 'Comentários',
        'score': 'Pontuação',
        'darkMode': 'Modo Escuro',
        'lightMode': 'Modo Claro',
        'clearLocalData': 'Limpar Dados Locais'
    },
    'es': {
        'searchingMessage': 'Buscando resultados...',
        'noResultsMessage': 'Esta URL nunca ha sido enviada.',
        'allPagesSearchedNoResults': 'Se han buscado todas las páginas pero no se han encontrado resultados para la misma URL.',
        'errorMessage': 'Se produjo un error al obtener los datos. Por favor, inténtelo de nuevo.',
        'submitToHN': 'Enviar a Hacker News',
        'shareOnTwitter': 'Compartir en Twitter',
        'shareOnReddit': 'Compartir en Reddit',
        'shareOnLinkedIn': 'Compartir en LinkedIn',
        'shareOnFacebook': 'Compartir en Facebook',
        'shareOnBluesky': 'Compartir en Bluesky',
        'copyUrl': 'Copiar URL',
        'urlCopied': '¡URL copiada al portapapeles!',
        'sortBy': 'Ordenar por:',
        'date': 'Fecha',
        'comments': 'Comentarios',
        'score': 'Puntuación',
        'darkMode': 'Modo Oscuro',
        'lightMode': 'Modo Claro',
        'clearLocalData': 'Borrar Datos Locales'
    }
};

// Implementar cache de traduções para evitar problemas de encoding
const translationCache = {};

// Função de tradução melhorada
function translate(key) {
    const cacheKey = `${currentLanguage}_${key}`;
    
    if (translationCache[cacheKey]) {
        return translationCache[cacheKey];
    }
    
    const translation = translations[currentLanguage][key] || translations['en'][key];
    translationCache[cacheKey] = translation;
    
    return translation;
}

// Inicializa tema escuro se já estiver configurado
function initializeTheme() {
    chrome.storage.sync.get(['darkMode'], function(data) {
        if (data.darkMode) {
            document.body.classList.add('dark-theme');
        }
    });
}

// Adiciona estilos CSS dinâmicos
function addStyles() {
    const style = document.createElement('style');
    style.textContent = `
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            transition: background-color 0.3s, color 0.3s;
            padding: 15px;
            margin: 0;
        }
        
        .dark-theme {
            background-color: #222;
            color: #eee;
        }
        
        .dark-theme a {
            color: #6bc1ff;
        }
        
        .share-panel {
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 15px;
            margin-top: 20px;
            background-color: #f9f9f9;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        
        .dark-theme .share-panel {
            background-color: #333;
            border-color: #444;
        }
        
        .share-button {
            display: block;
            padding: 8px 12px;
            margin: 5px 0;
            text-decoration: none;
            color: white;
            border-radius: 4px;
            transition: background-color 0.2s;
            text-align: center;
            cursor: pointer;
        }
        
        .share-button:hover {
            opacity: 0.9;
        }
        
        .hn-button {
            background-color: #ff6600;
        }
        
        .twitter-button {
            background-color: #1DA1F2;
        }
        
        .reddit-button {
            background-color: #FF4500;
        }
        
        .linkedin-button {
            background-color: #0077B5;
        }
        
        .facebook-button {
            background-color: #1877F2;
        }
        
        .bluesky-button {
            background-color: #0085FF;
        }
        
        .copy-button {
            background-color: #6c757d;
        }
        
        .loading {
            text-align: center;
            padding: 20px;
            font-style: italic;
            color: #666;
        }
        
        .dark-theme .loading {
            color: #bbb;
        }
        
        .result-item {
            padding: 10px;
            margin: 10px 0;
            border-bottom: 1px solid #eee;
        }
        
        .dark-theme .result-item {
            border-bottom: 1px solid #444;
        }
        
        .result-title {
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .result-details {
            font-size: 0.8em;
            color: #666;
        }
        
        .dark-theme .result-details {
            color: #aaa;
        }
        
        .toolbar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 1px solid #eee;
        }
        
        .dark-theme .toolbar {
            border-bottom: 1px solid #444;
        }
        
        .sort-options {
            display: flex;
            gap: 10px;
            align-items: center;
        }
        
        .sort-button {
            background-color: #f0f0f0;
            border: none;
            padding: 5px 10px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 0.8em;
        }
        
        .dark-theme .sort-button {
            background-color: #444;
            color: #eee;
        }
        
        .sort-button.active {
            background-color: #007bff;
            color: white;
        }
        
        .dark-theme .sort-button.active {
            background-color: #0056b3;
        }
        
        .settings-button {
            background: none;
            border: none;
            cursor: pointer;
            font-size: 1.2em;
        }
        
        .dark-theme .settings-button {
            color: #eee;
        }
        
        .language-selector {
            margin-top: 10px;
            padding: 5px;
            border-radius: 4px;
        }
        
        .dark-theme .language-selector {
            background-color: #444;
            color: #eee;
            border-color: #555;
        }
        
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 10px 15px;
            background-color: #28a745;
            color: white;
            border-radius: 4px;
            opacity: 0;
            transition: opacity 0.3s;
            z-index: 1000;
        }
        
        .notification.show {
            opacity: 1;
        }
    `;
    document.head.appendChild(style);
}

// Mostra uma notificação
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    if (type === 'error') {
        notification.style.backgroundColor = '#dc3545';
    }
    
    document.body.appendChild(notification);
    
    // Força um reflow para que a transição funcione
    notification.offsetHeight;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 2000);
}

// Cria barra de ferramentas
function createToolbar() {
    const toolbar = document.createElement('div');
    toolbar.className = 'toolbar';
    
    // Botão de tema
    const themeButton = document.createElement('button');
    themeButton.className = 'share-button';
    
    chrome.storage.sync.get(['darkMode'], function(data) {
        const isDarkMode = data.darkMode;
        themeButton.textContent = isDarkMode ? translate('lightMode') : translate('darkMode');
        themeButton.style.backgroundColor = isDarkMode ? '#f8c200' : '#5c6bc0';
        
        if (isDarkMode) {
            document.body.classList.add('dark-theme');
        }
    });
    
    themeButton.addEventListener('click', function() {
        chrome.storage.sync.get(['darkMode'], function(data) {
            const newDarkMode = !data.darkMode;
            chrome.storage.sync.set({ 'darkMode': newDarkMode });
            document.body.classList.toggle('dark-theme', newDarkMode);
            themeButton.textContent = newDarkMode ? translate('lightMode') : translate('darkMode');
            themeButton.style.backgroundColor = newDarkMode ? '#f8c200' : '#5c6bc0';
        });
    });
    
    // Botão de configurações
    const settingsButton = document.createElement('button');
    settingsButton.className = 'share-button';
    settingsButton.textContent = 'Options';
    settingsButton.style.backgroundColor = '#6c757d';
    settingsButton.addEventListener('click', function() {
        chrome.runtime.openOptionsPage();
    });
    
    toolbar.appendChild(themeButton);
    toolbar.appendChild(document.createElement('br'));
    toolbar.appendChild(settingsButton);
    
    return toolbar;
}

// Inicializa a interface do usuário
function initUI() {
    addStyles();
    
    // Adiciona a barra de ferramentas antes do elemento de resultados
    const resultsDiv = document.getElementById('results');
    const header = document.querySelector('.header');
    
    if (header && resultsDiv) {
        const toolbar = createToolbar();
        header.parentNode.insertBefore(toolbar, header.nextSibling);
    }
}

chrome.runtime.sendMessage({ message: 'getTabUrl' }, response => {
    let url = response.url;
    let resultsDiv = document.getElementById('results');
    
    // Inicializa a interface
    initUI();
    
    // Exibe mensagem de carregamento
    const loadingMessage = document.createElement('div');
    loadingMessage.className = 'loading';
    loadingMessage.textContent = translate('searchingMessage');
    resultsDiv.appendChild(loadingMessage);

    chrome.storage.sync.get(['resultsCount', 'pagesCount', 'debug', 'language', 'customShareOptions', 'privacyMode'], function(data) {
        let resultsCount = data.resultsCount || 1;
        let pagesCount = data.pagesCount || 3;
        let debug = data.debug || false;
        let privacyMode = data.privacyMode || false;
        let customShareOptions = data.customShareOptions || [];
        
        // Carrega o idioma salvo
        if (data.language) {
            currentLanguage = data.language;
        }
        
        let count = 0;
        let page = 0;
        // Array para armazenar todos os resultados para ordenação posterior
        let allResults = [];
        let currentSortOption = 'date'; // Padrão

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
                
                // Verifica se o resultado está no cache
                const cacheKey = `${url}_${page}`;
                if (resultCache[cacheKey] && !privacyMode) {
                    processResults(resultCache[cacheKey]);
                    return;
                }

                function showSortOptions() {
                    // Verifica se o painel de ordenação já existe
                    if (document.getElementById('sortPanel')) return;
                    
                    // Remove a mensagem de carregamento
                    const loadingElement = document.querySelector('.loading');
                    if (loadingElement) {
                        loadingElement.remove();
                    }
                    
                    const sortPanel = document.createElement('div');
                    sortPanel.id = 'sortPanel';
                    sortPanel.className = 'sort-options';
                    
                    const sortLabel = document.createElement('span');
                    sortLabel.textContent = translate('sortBy');
                    sortPanel.appendChild(sortLabel);
                    
                    const sortOptions = [
                        { value: 'date', label: translate('date') },
                        { value: 'comments', label: translate('comments') },
                        { value: 'score', label: translate('score') }
                    ];
                    
                    sortOptions.forEach(option => {
                        const button = document.createElement('button');
                        button.className = 'sort-button';
                        button.textContent = option.label;
                        button.dataset.sort = option.value;
                        
                        if (option.value === currentSortOption) {
                            button.classList.add('active');
                        }
                        
                        button.addEventListener('click', function() {
                            // Remove a classe ativa de todos os botões
                            document.querySelectorAll('.sort-button').forEach(btn => {
                                btn.classList.remove('active');
                            });
                            
                            // Adiciona a classe ativa ao botão clicado
                            this.classList.add('active');
                            
                            // Atualiza a opção de ordenação atual
                            currentSortOption = this.dataset.sort;
                            
                            // Reordena e exibe os resultados
                            sortAndDisplayResults();
                        });
                        
                        sortPanel.appendChild(button);
                    });
                    
                    // Adiciona o painel de ordenação antes dos resultados
                    resultsDiv.insertBefore(sortPanel, resultsDiv.firstChild);
                }
                
                function sortAndDisplayResults() {
                    // Limpa os resultados atuais
                    const resultItems = document.querySelectorAll('.result-item');
                    resultItems.forEach(item => item.remove());
                    
                    // Ordena de acordo com a opção escolhida
                    allResults.sort((a, b) => {
                        if (currentSortOption === 'date') {
                            return new Date(b.created_at) - new Date(a.created_at);
                        } else if (currentSortOption === 'comments') {
                            return (b.num_comments || 0) - (a.num_comments || 0);
                        } else if (currentSortOption === 'score') {
                            return (b.points || 0) - (a.points || 0);
                        }
                        return 0;
                    });
                    
                    // Exibe os resultados ordenados
                    allResults.slice(0, resultsCount).forEach(result => {
                        displayResult(result);
                    });
                }
                
                function displayResult(result) {
                    const container = document.createElement('div');
                    container.className = 'result-item';
                    
                    const title = document.createElement('div');
                    title.className = 'result-title';
                    
                    const link = document.createElement('a');
                    link.href = 'https://news.ycombinator.com/item?id=' + result.objectID;
                    link.textContent = result.title;
                    link.target = '_blank';
                    
                    title.appendChild(link);
                    
                    const details = document.createElement('div');
                    details.className = 'result-details';
                    
                    const pointsSpan = document.createElement('span');
                    pointsSpan.textContent = `${result.points || 0} points | `;
                    
                    const authorSpan = document.createElement('span');
                    authorSpan.textContent = `by ${result.author || 'unknown'} | `;
                    
                    const dateSpan = document.createElement('span');
                    dateSpan.textContent = `${formatDate(result.created_at)} | `;
                    
                    const commentsSpan = document.createElement('span');
                    commentsSpan.textContent = `${result.num_comments || 0} comments`;
                    
                    details.appendChild(pointsSpan);
                    details.appendChild(authorSpan);
                    details.appendChild(dateSpan);
                    details.appendChild(commentsSpan);
                    
                    container.appendChild(title);
                    container.appendChild(details);
                    
                    // Inserir antes do painel de compartilhamento
                    const sharePanel = document.getElementById('sharePanel');
                    if (sharePanel) {
                        resultsDiv.insertBefore(container, sharePanel);
                    } else {
                        resultsDiv.appendChild(container);
                    }
                }

                function showAdditionalSharingOptions() {
                    // Check if the sharePanel already exists
                    let sharePanel = document.getElementById('sharePanel');
                
                    if (!sharePanel) {
                        sharePanel = document.createElement('div');
                        sharePanel.id = 'sharePanel';
                        sharePanel.className = 'share-panel';
                
                        chrome.storage.sync.get(['shareButtons'], function(data) {
                            const shareButtons = data.shareButtons || {
                                hnButton: true,
                                twitterButton: false,
                                redditButton: false,
                                linkedinButton: false,
                                facebookButton: false,
                                blueskyButton: true,
                                copyButton: false
                            };
                            
                            // Hacker News submit button
                            if (shareButtons.hnButton !== false) {
                                let hnLink = document.createElement('a');
                                hnLink.href = `https://news.ycombinator.com/submitlink?u=${encodeURIComponent(url)}&t=${encodeURIComponent(pageTitle)}`;
                                hnLink.textContent = translate('submitToHN');
                                hnLink.target = '_blank';
                                hnLink.className = 'share-button hn-button';
                                sharePanel.appendChild(hnLink);
                            }
                            
                            // Twitter share button
                            if (shareButtons.twitterButton !== false) {
                                let twitterLink = document.createElement('a');
                                twitterLink.href = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(pageTitle)}`;
                                twitterLink.textContent = translate('shareOnTwitter');
                                twitterLink.target = '_blank';
                                twitterLink.className = 'share-button twitter-button';
                                sharePanel.appendChild(twitterLink);
                            }
                    
                            // Reddit share button
                            if (shareButtons.redditButton !== false) {
                                let redditLink = document.createElement('a');
                                redditLink.href = `https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(pageTitle)}`;
                                redditLink.textContent = translate('shareOnReddit');
                                redditLink.target = '_blank';
                                redditLink.className = 'share-button reddit-button';
                                sharePanel.appendChild(redditLink);
                            }
                            
                            // LinkedIn share button
                            if (shareButtons.linkedinButton !== false) {
                                let linkedinLink = document.createElement('a');
                                linkedinLink.href = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
                                linkedinLink.textContent = translate('shareOnLinkedIn');
                                linkedinLink.target = '_blank';
                                linkedinLink.className = 'share-button linkedin-button';
                                sharePanel.appendChild(linkedinLink);
                            }
                            
                            // Facebook share button
                            if (shareButtons.facebookButton !== false) {
                                let facebookLink = document.createElement('a');
                                facebookLink.href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
                                facebookLink.textContent = translate('shareOnFacebook');
                                facebookLink.target = '_blank';
                                facebookLink.className = 'share-button facebook-button';
                                sharePanel.appendChild(facebookLink);
                            }
                            
                            // Bluesky share button
                            if (shareButtons.blueskyButton !== false) {
                                let blueskyLink = document.createElement('a');
                                // Não há uma API de compartilhamento direta do Bluesky, então vamos abrir o site
                                // e deixar o usuário compartilhar manualmente
                                blueskyLink.href = `https://bsky.app/`;
                                blueskyLink.textContent = translate('shareOnBluesky');
                                blueskyLink.target = '_blank';
                                blueskyLink.className = 'share-button bluesky-button';
                                blueskyLink.addEventListener('click', function(e) {
                                    // Copiar a URL e o título para facilitar o compartilhamento
                                    e.preventDefault();
                                    const blueskyText = `${pageTitle} ${url}`;
                                    navigator.clipboard.writeText(blueskyText).then(function() {
                                        showNotification('URL and title copied! Paste to share on Bluesky');
                                        window.open('https://bsky.app/', '_blank');
                                    });
                                });
                                sharePanel.appendChild(blueskyLink);
                            }
                            
                            // Copy URL button
                            if (shareButtons.copyButton !== false) {
                                let copyButton = document.createElement('a');
                                copyButton.textContent = translate('copyUrl');
                                copyButton.className = 'share-button copy-button';
                                copyButton.addEventListener('click', function() {
                                    navigator.clipboard.writeText(url).then(function() {
                                        showNotification(translate('urlCopied'));
                                    });
                                });
                                sharePanel.appendChild(copyButton);
                            }
                            
                            // Adicionar opções de compartilhamento personalizadas
                            if (customShareOptions && customShareOptions.length > 0) {
                                customShareOptions.forEach(option => {
                                    if (option.enabled) {
                                        let customLink = document.createElement('a');
                                        customLink.href = option.url.replace('{url}', encodeURIComponent(url)).replace('{title}', encodeURIComponent(pageTitle));
                                        customLink.textContent = option.name;
                                        customLink.target = '_blank';
                                        customLink.className = 'share-button';
                                        customLink.style.backgroundColor = option.color || '#6c757d';
                                        
                                        sharePanel.appendChild(customLink);
                                    }
                                });
                            }
                    
                            resultsDiv.appendChild(sharePanel);
                        });
                    }
                }
                
                function processResults(response) {
                    if (page === 0) {
                        // Limpa os resultados existentes se for a primeira página
                        while (resultsDiv.firstChild) {
                            resultsDiv.removeChild(resultsDiv.firstChild);
                        }
                    }
                    
                    if (debug) {
                        sendToDebug(response);
                    }
                    
                    // Armazena no cache se não estiver no modo privacidade
                    if (!privacyMode) {
                        resultCache[cacheKey] = response;
                    }
                    
                    let foundResultsInThisPage = false;
                    
                    if (response.nbHits > 0) {
                        for (let i = 0; i < response.hits.length; i++) {
                            let result = response.hits[i];
                            if (result.title && result.objectID && url.includes(result.url)) {
                                allResults.push(result);
                                foundResultsInThisPage = true;
                            }
                        }
                        
                        page++;
                        
                        if (foundResultsInThisPage && allResults.length < resultsCount && page < pagesCount) {
                            // Busca a próxima página
                            fetchPage();
                        } else {
                            // Mostra opções de ordenação
                            showSortOptions();
                            
                            // Ordena e exibe os resultados
                            sortAndDisplayResults();
                            
                            // Mostra opções de compartilhamento
                            showAdditionalSharingOptions();
                        }
                    } else {
                        // Remove a mensagem de carregamento
                        const loadingElement = document.querySelector('.loading');
                        if (loadingElement) {
                            loadingElement.remove();
                        }
                        
                        if (allResults.length === 0) {
                            resultsDiv.textContent = translate('noResultsMessage');
                        } else {
                            // Mostra opções de ordenação
                            showSortOptions();
                            
                            // Ordena e exibe os resultados
                            sortAndDisplayResults();
                        }
                        
                        // Mostra opções de compartilhamento
                        showAdditionalSharingOptions();
                    }
                }

                if (page >= pagesCount) {
                    // Remove a mensagem de carregamento
                    const loadingElement = document.querySelector('.loading');
                    if (loadingElement) {
                        loadingElement.remove();
                    }
                    
                    if (count === 0) {
                        resultsDiv.textContent = translate('allPagesSearchedNoResults');
                    }
                    
                    // Mostra opções de compartilhamento mesmo sem resultados
                    showAdditionalSharingOptions();
                    return;
                }

                // Faz a URL mais curta para melhorar a correspondência
                const domainAndPath = new URL(url).hostname + new URL(url).pathname;
                let requestUrl = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(domainAndPath)}&page=${page}`;

                fetch(requestUrl)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`HTTP error: ${response.status}`);
                        }
                        return response.json();
                    })
                    .then(processResults)
                    .catch(e => {
                        console.error(`Fetch failed: ${e}`);
                        
                        // Remove a mensagem de carregamento
                        const loadingElement = document.querySelector('.loading');
                        if (loadingElement) {
                            loadingElement.remove();
                        }
                        
                        resultsDiv.textContent = translate('errorMessage');
                        // Mostra opções de compartilhamento mesmo em caso de erro
                        showAdditionalSharingOptions();
                    });
            });
        }
        fetchPage();
    });
});
