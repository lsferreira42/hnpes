# HNPES - Hacker News Previous Entry Search

> **Download:** Disponível para Chrome e Firefox!
> - **[Chrome Web Store](https://chromewebstore.google.com/detail/hnpes-hacker-news-previou/ndjkjkemnioillnkfeppiocomehgfegi)** 
> - **[Firefox Add-ons](https://addons.mozilla.org/pt-BR/firefox/addon/hnpes-hackernews-search/)**

*Procurando o readme em [inglês](README.md)?*

O HNPES permite pesquisar a URL atual no Hacker News e visualizar os principais resultados diretamente no popup da extensão. Funciona no **Chrome** e no **Firefox**.

## História

Desde que me tornei usuário do Hacker News (há cerca de dez ou onze anos), eu usava um bookmarklet para verificar se a URL que estou navegando já foi enviada para o Hacker News:

```javascript
(function() {
    var request = new XMLHttpRequest();
    request.open("GET", "https://hn.algolia.com/api/v1/search?query=" + encodeURIComponent(location.href), true);
   
    request.onreadystatechange = function() {
        if(request.readyState == 4 && request.status == 200) {
            var response = JSON.parse(request.responseText);
            
            if(response.nbHits > 0) {
                location.href = "https://news.ycombinator.com/item?id=" + response.hits[0].objectID;
            } else {
                alert("this url has not been submitted yet");
            }
        }
    };
    
    request.send();
})();
```

Devido a várias restrições de CSP e CORS, muitos sites estavam quebrando este script. Buscando soluções, descobri que a única maneira de contornar isso era usando uma extensão para navegador — então foi o que fiz! O HNPES agora funciona no Chrome e no Firefox.

## Funcionalidades

- Pesquisa a URL atual (ou qualquer URL colada) no Hacker News
- Exibe os principais resultados do Hacker News no popup da extensão
- **Buscar por URL colada:** Cole uma URL no popup e clique em Buscar (ou Enter) para pesquisar sem estar naquela página
- **Menu de contexto:** Clique com o botão direito em qualquer link → "Search on Hacker News" → abre uma nova aba com os resultados dessa URL
- **Badge no ícone:** Opção de exibir no ícone da extensão a quantidade de submissões no HN da página atual (configurável)
- **Banner "Discussed on HN":** Opção de exibir um banner no topo de páginas que já foram submetidas ao HN, com link para a discussão (desativado por padrão)
- Informações detalhadas dos resultados:
  - Número de comentários em cada post
  - Data de criação do post
  - Autor do post
  - Pontos/score de cada post
  - Badge **Correspondência exata** / **Mesmo domínio** em cada resultado
- Compartilhamento de conteúdo em múltiplas plataformas:
  - Hacker News
  - Twitter/X
  - Reddit
  - LinkedIn
  - Facebook
  - Bluesky
  - Cópia da URL para área de transferência
  - Adição de plataformas de compartilhamento personalizadas
- Ordenação dos resultados por Data, Comentários ou Pontuação (ordenação padrão salva nas opções)
- **Filtro por tempo:** Restringir resultados a Todo o período, Último ano ou Últimos 5 anos (nas opções e no popup)
- Melhorias na interface:
  - Modo escuro
  - Interface moderna e limpa
  - Popup com rolagem e altura máxima
  - Spinner de carregamento durante a busca
  - Botão "Tentar novamente" em caso de erro de rede
- Opções de personalização:
  - Configuração de quais botões de compartilhamento exibir
  - Criação de botões de compartilhamento personalizados para qualquer plataforma
  - Definição do número de resultados a serem exibidos
  - Definição do número de páginas de paginação a seguir
  - Ordenação padrão
  - TTL do cache em minutos (0 = sem expiração)
  - Exibir ou ocultar badge no ícone da extensão
  - Exibir ou ocultar banner "Discussed on HN" em páginas submetidas
- Recursos de privacidade:
  - Modo de privacidade para desativar o cache
  - Opção para limpar dados locais
- Suporte multilíngue:
  - Inglês
  - Português
  - Espanhol
- **Confiabilidade:** Validação de URL (sem requisições para `chrome://`, etc.), nova tentativa automática em falha da API (até 3 tentativas)
- **Acessibilidade:** Labels ARIA e popup utilizável por teclado
- Cache avançado com TTL opcional para melhor desempenho
- Correspondência de URL aprimorada para melhores resultados

## Instalação

### Pelas lojas (recomendado)

- **Chrome:** [Instalar pela Chrome Web Store](https://chromewebstore.google.com/detail/hnpes-hacker-news-previou/ndjkjkemnioillnkfeppiocomehgfegi)
- **Firefox:** [Instalar pela Firefox Add-ons](https://addons.mozilla.org/pt-BR/firefox/addon/hnpes-hackernews-search/)

### Instalação manual (desenvolvimento)

**Chrome:**
1. Clone ou baixe este repositório.
2. Abra `chrome://extensions` e ative o "Modo desenvolvedor".
3. Clique em "Carregar sem compactação" e selecione a pasta do projeto.
4. Para o Chrome, use o `manifest.json` padrão.

**Firefox:**
1. Execute `make build-firefox` para criar o pacote Firefox.
2. Abra `about:debugging` → "Este Firefox" → "Carregar extensão temporária".
3. Selecione o arquivo `dist/hnpes-firefox-v*.zip` gerado ou a pasta do projeto (com `manifest.firefox.json` renomeado para `manifest.json`).

## Uso

1. Navegue até uma página que você deseja pesquisar no Hacker News (ou deixe o campo de URL em branco para usar a aba atual).
2. Clique no ícone da extensão na barra de ferramentas do navegador para abrir o popup.
3. A extensão buscará automaticamente os principais resultados do Hacker News relacionados à URL atual (ou colada).
4. **Opcional:** Cole outra URL no campo "URL para buscar" e clique em **Buscar** (ou Enter) para pesquisar essa URL.
5. Os resultados são exibidos no popup com detalhes como pontos, autor, comentários e o badge Correspondência exata / Mesmo domínio.
6. Use os controles **Período** e **Ordenar** para filtrar e ordenar os resultados. Use os botões de compartilhamento para compartilhar a página.
7. Clique em um resultado para abri-lo em uma nova aba.
8. **Menu de contexto:** Clique com o botão direito em qualquer link e escolha "Search on Hacker News" para abrir os resultados desse link em uma nova aba.

## Configuração

A extensão permite configurar as seguintes opções:

### Configurações de Pesquisa
- **Número de resultados a mostrar**: Defina o número de resultados a serem exibidos no popup. O padrão é 5.
- **Número de páginas de paginação a seguir**: Defina o número de páginas a buscar do Hacker News. O padrão é 10.
- **Ordenação padrão**: Ordem padrão dos resultados (Data, Comentários ou Pontuação).
- **Filtro por tempo**: Restringir resultados a Todo o período, Último ano ou Últimos 5 anos.
- **TTL do cache (minutos)**: Por quanto tempo manter os resultados em cache (0 = até limpar).
- **Função de depuração**: Ative para que a extensão envie a resposta da Algolia para http://localhost:8080/debug (apenas quando ativada; erros são ignorados).

### Aparência
- **Modo Escuro**: Alterne entre temas claro e escuro.
- **Mostrar contagem de submissões no ícone da extensão**: Exibir no ícone a quantidade de submissões no HN da página atual.
- **Mostrar banner "Discussed on HN" em páginas submetidas**: Quando ativado, exibe um pequeno banner no topo de páginas que foram submetidas ao Hacker News (desativado por padrão).

### Privacidade e Segurança
- **Modo de Privacidade**: Desative o armazenamento em cache dos resultados de pesquisa.
- **Limpar Dados Locais**: Remova todos os resultados de pesquisa em cache.

### Idioma
- Escolha entre inglês, português ou espanhol para a interface do usuário.

### Botões de Compartilhamento
- Ative ou desative botões de compartilhamento individuais (Hacker News, Twitter, Reddit, LinkedIn, Facebook, Bluesky, Copiar URL).

### Opções de Compartilhamento Personalizadas
- Adicione seus próprios botões de compartilhamento para qualquer plataforma, especificando:
  - Nome da plataforma
  - Modelo de URL de compartilhamento (com espaços reservados para URL e título)
  - Cor do botão
  - Opção de ativar/desativar

Para configurar essas opções:

1. Clique no ícone da extensão na barra de ferramentas do navegador para abrir o popup.
2. Clique no botão "Opções" para abrir a página de opções.
3. Ajuste as configurações desejadas.
4. Clique no botão "Salvar Todas as Configurações" para salvar suas preferências.

## Contribuindo

Contribuições são bem-vindas! Se você encontrar problemas ou tiver sugestões para melhorias, abra uma issue ou envie um pull request.

## Agradecimentos

Esta extensão usa a [API de Pesquisa Algolia](https://hn.algolia.com/api) para pesquisar URLs no Hacker News.

## Aviso Legal

Este projeto não é afiliado ou endossado pelo Hacker News, Algolia ou qualquer uma das plataformas de mídia social mencionadas. 