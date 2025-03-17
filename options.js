document.addEventListener('DOMContentLoaded', function () {
    // Inicializa tema escuro se configurado
    function initializeTheme() {
        chrome.storage.sync.get(['darkMode'], function(data) {
            if (data.darkMode) {
                document.body.classList.add('dark-theme');
            }
        });
    }
    
    // Carrega as opções salvas
    function loadOptions() {
        chrome.storage.sync.get([
            'resultsCount', 
            'pagesCount', 
            'debug', 
            'darkMode', 
            'privacyMode', 
            'language', 
            'customShareOptions',
            'shareButtons'
        ], function(items) {
            document.getElementById('resultsCount').value = items.resultsCount || 5;
            document.getElementById('pagesCount').value = items.pagesCount || 10;
            
            // Configurações básicas
            document.getElementById('debug').checked = items.debug || false;
            document.getElementById('darkMode').checked = items.darkMode || false;
            document.getElementById('privacyMode').checked = items.privacyMode || false;
            
            // Idioma
            const languageSelect = document.getElementById('language');
            languageSelect.value = items.language || 'en';
            
            // Configurações de botões de compartilhamento
            const shareButtons = items.shareButtons || {
                hnButton: true,
                twitterButton: false,
                redditButton: false,
                linkedinButton: false,
                facebookButton: false,
                blueskyButton: true,
                copyButton: false
            };
            
            document.getElementById('hnButton').checked = shareButtons.hnButton !== false;
            document.getElementById('twitterButton').checked = shareButtons.twitterButton !== false;
            document.getElementById('redditButton').checked = shareButtons.redditButton !== false;
            document.getElementById('linkedinButton').checked = shareButtons.linkedinButton !== false;
            document.getElementById('facebookButton').checked = shareButtons.facebookButton !== false;
            document.getElementById('blueskyButton').checked = shareButtons.blueskyButton !== false;
            document.getElementById('copyButton').checked = shareButtons.copyButton !== false;
            
            // Opções de compartilhamento personalizadas
            const customOptions = items.customShareOptions || [];
            const container = document.getElementById('customShareOptions');
            
            // Limpa o container
            container.innerHTML = '';
            
            // Adiciona cada opção personalizada
            customOptions.forEach((option, index) => {
                addCustomShareOption(option, index);
            });
        });
    }
    
    // Função para adicionar uma opção de compartilhamento personalizada
    function addCustomShareOption(option = {}, index = null) {
        const container = document.getElementById('customShareOptions');
        const optionDiv = document.createElement('div');
        optionDiv.className = 'custom-option';
        
        if (index === null) {
            index = container.children.length;
        }
        
        optionDiv.dataset.index = index;
        
        // Nome da plataforma
        const nameLabel = document.createElement('label');
        nameLabel.textContent = 'Platform Name:';
        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.className = 'option-name';
        nameInput.value = option.name || '';
        nameInput.placeholder = 'e.g., Facebook';
        nameLabel.appendChild(nameInput);
        
        // URL da plataforma
        const urlLabel = document.createElement('label');
        urlLabel.textContent = 'Share URL Template:';
        const urlInput = document.createElement('input');
        urlInput.type = 'text';
        urlInput.className = 'option-url';
        urlInput.value = option.url || '';
        urlInput.placeholder = 'e.g., https://example.com/share?url={url}&title={title}';
        urlLabel.appendChild(urlInput);
        
        // Cor do botão
        const colorLabel = document.createElement('label');
        colorLabel.textContent = 'Button Color:';
        const colorInput = document.createElement('input');
        colorInput.type = 'color';
        colorInput.className = 'option-color';
        colorInput.value = option.color || '#6c757d';
        colorLabel.appendChild(colorInput);
        
        // Enabled checkbox
        const enabledLabel = document.createElement('label');
        enabledLabel.textContent = 'Enabled:';
        const enabledInput = document.createElement('input');
        enabledInput.type = 'checkbox';
        enabledInput.className = 'option-enabled';
        enabledInput.checked = option.enabled !== false;
        enabledLabel.appendChild(enabledInput);
        
        // Botão de remoção
        const removeButton = document.createElement('button');
        removeButton.textContent = 'Remove';
        removeButton.className = 'remove-option-btn';
        removeButton.addEventListener('click', function() {
            container.removeChild(optionDiv);
        });
        
        // Adiciona todos os elementos à div da opção
        optionDiv.appendChild(nameLabel);
        optionDiv.appendChild(urlLabel);
        optionDiv.appendChild(colorLabel);
        optionDiv.appendChild(enabledLabel);
        optionDiv.appendChild(removeButton);
        
        // Adiciona ao container
        container.appendChild(optionDiv);
    }
    
    // Evento para adicionar nova opção de compartilhamento
    document.getElementById('addShareOption').addEventListener('click', function() {
        // Exemplo com Mastodon para ajudar o usuário
        const mastodonExample = {
            name: 'Mastodon',
            url: 'https://mastodon.example.com/share?text={title} {url}',
            color: '#563ACC',
            enabled: true
        };
        addCustomShareOption(mastodonExample);
    });
    
    // Evento para alternar o tema
    document.getElementById('darkMode').addEventListener('change', function() {
        document.body.classList.toggle('dark-theme', this.checked);
    });
    
    // Evento para limpar dados locais
    document.getElementById('clearDataButton').addEventListener('click', function() {
        // Limpa os dados de cache da extensão
        chrome.storage.local.clear(function() {
            // Limpa o cache de resultados por meio de uma mensagem para o popup
            chrome.runtime.sendMessage({ 
                message: 'clearCache'
            });
            
            let saveMessage = document.getElementById('saveMessage');
            saveMessage.innerText = 'Local data cleared successfully.';
            setTimeout(function() {
                saveMessage.innerText = '';
            }, 2000);
        });
    });
    
    // Salva as configurações
    document.getElementById('saveButton').addEventListener('click', function() {
        // Opções básicas
        const resultsCount = document.getElementById('resultsCount').value;
        const pagesCount = document.getElementById('pagesCount').value;
        const debug = document.getElementById('debug').checked;
        const darkMode = document.getElementById('darkMode').checked;
        const privacyMode = document.getElementById('privacyMode').checked;
        const language = document.getElementById('language').value;
        
        // Opções de botões de compartilhamento
        const shareButtons = {
            hnButton: document.getElementById('hnButton').checked,
            twitterButton: document.getElementById('twitterButton').checked,
            redditButton: document.getElementById('redditButton').checked,
            linkedinButton: document.getElementById('linkedinButton').checked,
            facebookButton: document.getElementById('facebookButton').checked,
            blueskyButton: document.getElementById('blueskyButton').checked,
            copyButton: document.getElementById('copyButton').checked
        };
        
        // Coleta opções personalizadas de compartilhamento
        const customOptionsElements = document.querySelectorAll('.custom-option');
        const customShareOptions = Array.from(customOptionsElements).map(element => {
            return {
                name: element.querySelector('.option-name').value,
                url: element.querySelector('.option-url').value,
                color: element.querySelector('.option-color').value,
                enabled: element.querySelector('.option-enabled').checked
            };
        });
        
        // Salva todas as configurações
        chrome.storage.sync.set({
            'resultsCount': resultsCount,
            'pagesCount': pagesCount,
            'debug': debug,
            'darkMode': darkMode,
            'privacyMode': privacyMode,
            'language': language,
            'customShareOptions': customShareOptions,
            'shareButtons': shareButtons
        }, function() {
            let saveMessage = document.getElementById('saveMessage');
            saveMessage.innerText = 'Settings saved.';
            setTimeout(function() {
                saveMessage.innerText = '';
            }, 2000);
        });
    });
    
    // Adiciona manipuladores do popup de ajuda
    function setupHelpPopup() {
        const helpButton = document.getElementById('helpButton');
        const helpPopup = document.getElementById('helpPopup');
        const closePopup = document.querySelector('.close-popup');
        
        // Abre o popup quando o botão de ajuda é clicado
        helpButton.addEventListener('click', function() {
            helpPopup.style.display = 'block';
        });
        
        // Fecha o popup quando o botão de fechar é clicado
        closePopup.addEventListener('click', function() {
            helpPopup.style.display = 'none';
        });
        
        // Fecha o popup quando o usuário clica fora do conteúdo
        helpPopup.addEventListener('click', function(event) {
            if (event.target === helpPopup) {
                helpPopup.style.display = 'none';
            }
        });
        
        // Fecha o popup quando o usuário pressiona a tecla ESC
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape' && helpPopup.style.display === 'block') {
                helpPopup.style.display = 'none';
            }
        });
    }
    
    // Inicializa o tema e carrega as opções
    initializeTheme();
    loadOptions();
    setupHelpPopup();
});
