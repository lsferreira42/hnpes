# HNPES - Hacker News Previous Entry Search

> ⚠️ **Aviso**: Esta extensão já está disponível na Chrome Web Store! [Baixe aqui](https://chromewebstore.google.com/detail/hnpes-hacker-news-previou/ndjkjkemnioillnkfeppiocomehgfegi)

O HNPES permite pesquisar a URL atual no Hacker News e visualizar os principais resultados diretamente no popup da extensão.

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

Devido a várias restrições de CSP e CORS, muitos sites estavam quebrando este script. Buscando soluções, descobri que a única maneira de contornar isso era usando uma extensão para navegador (no meu caso, uso o Chrome), então foi o que fiz!

## Funcionalidades

- Pesquisa a URL atual no Hacker News
- Exibe os principais resultados do Hacker News no popup da extensão
- Informações detalhadas dos resultados:
  - Número de comentários em cada post
  - Data de criação do post
  - Autor do post
  - Pontos/score de cada post
- Compartilhamento de conteúdo em múltiplas plataformas:
  - Hacker News
  - Twitter/X
  - Reddit
  - LinkedIn
  - Facebook
  - Bluesky
  - Cópia da URL para área de transferência
  - Adição de plataformas de compartilhamento personalizadas
- Ordenação dos resultados por:
  - Data
  - Comentários
  - Pontuação
- Melhorias na interface:
  - Modo escuro
  - Interface moderna e limpa
  - Design responsivo
- Opções de personalização:
  - Configuração de quais botões de compartilhamento exibir
  - Criação de botões de compartilhamento personalizados para qualquer plataforma
  - Definição do número de resultados a serem exibidos
  - Definição do número de páginas de paginação a seguir
- Recursos de privacidade:
  - Modo de privacidade para desativar o cache
  - Opção para limpar dados locais
- Suporte multilíngue:
  - Inglês
  - Português
  - Espanhol
- Cache avançado para melhor desempenho
- Correspondência de URL aprimorada para melhores resultados

## Instalação

1. Clone ou baixe este repositório para sua máquina local.
2. Abra o Google Chrome e navegue até `chrome://extensions`.
3. Ative o "Modo desenvolvedor" usando o botão no canto superior direito.
4. Clique no botão "Carregar sem compactação".
5. Selecione a pasta contendo os arquivos da extensão.
6. A extensão agora deve estar instalada e visível na lista de extensões instaladas.

## Uso

1. Navegue até uma página da web que você deseja pesquisar no Hacker News.
2. Clique no ícone da extensão na barra de ferramentas do Chrome para abrir o popup.
3. A extensão buscará automaticamente os principais resultados do Hacker News relacionados à URL atual.
4. Os resultados serão exibidos no popup com detalhes como pontos, autor e comentários.
5. Use os botões fornecidos para compartilhar a página atual em várias plataformas.
6. Clique em um resultado para abri-lo em uma nova aba.

## Configuração

A extensão permite configurar as seguintes opções:

### Configurações de Pesquisa
- **Número de resultados a mostrar**: Defina o número de resultados a serem exibidos no popup. O padrão é 5.
- **Número de páginas de paginação a seguir**: Defina o número de páginas a buscar do Hacker News. O padrão é 10.
- **Função de depuração**: Ative para que a extensão envie a resposta da Algolia para http://localhost:8080/debug.

### Aparência
- **Modo Escuro**: Alterne entre temas claro e escuro.

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

1. Clique no ícone da extensão na barra de ferramentas do Chrome para abrir o popup.
2. Clique no botão "Opções" para abrir a página de opções.
3. Ajuste as configurações desejadas.
4. Clique no botão "Salvar Todas as Configurações" para salvar suas preferências.

## Contribuindo

Contribuições são bem-vindas! Se você encontrar problemas ou tiver sugestões para melhorias, abra uma issue ou envie um pull request.

## Agradecimentos

Esta extensão usa a [API de Pesquisa Algolia](https://hn.algolia.com/api) para pesquisar URLs no Hacker News.

## Aviso Legal

Este projeto não é afiliado ou endossado pelo Hacker News, Algolia ou qualquer uma das plataformas de mídia social mencionadas. 