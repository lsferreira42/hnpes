# HNPES - Hacker News Previous Entry Search

*Procurando um readme em [Português](README.pt-BR.md)*

HNPES allows you to search for the current URL on Hacker News and view the top results directly from the extension's popup.

## History

Since i became a user of hackernews ( like ten or eleven years ago ) i used a bookmarklet to see if the URL i am browsing has already been submitted to hackernews:

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

 Due to some CSP and CORS nonsense a lot of sites have been breaking this script, looking for solutions i found that the only way to bypass that is using a chrome extension ( A Browser extension, but i am a chrome user ), so that's what i did!

## Features

- Search for the current URL on Hacker News
- Display the top results from Hacker News in the extension's popup
- Detailed result information:
  - Number of comments in each post
  - Date of post creation
  - Post author
  - Points/score of each post
- Share content on multiple platforms:
  - Hacker News
  - Twitter/X
  - Reddit
  - LinkedIn
  - Facebook
  - Bluesky
  - Copy URL to clipboard
  - Add custom sharing platforms
- Sort results by:
  - Date
  - Comments
  - Score
- UI Improvements:
  - Dark mode
  - Modern, clean interface
  - Responsive design
- Customization options:
  - Configure which share buttons to display
  - Create custom share buttons for any platform
  - Set the number of results to display
  - Set the number of pagination pages to follow
- Privacy features:
  - Privacy mode to disable caching
  - Option to clear local data
- Multilingual support:
  - English
  - Portuguese
  - Spanish
- Advanced caching for better performance
- Improved URL matching for better results

## Installation

1. Clone or download this repository to your local machine.
2. Open Google Chrome and navigate to `chrome://extensions`.
3. Enable "Developer mode" using the toggle switch in the top right corner.
4. Click on the "Load unpacked" button.
5. Select the folder containing the extension files.
6. The extension should now be installed and visible in the list of installed extensions.

## Usage

1. Navigate to a webpage you want to search on Hacker News.
2. Click on the extension icon in the Chrome toolbar to open the popup.
3. The extension will automatically fetch the top results from Hacker News related to the current URL.
4. Results will be displayed in the popup with details like points, author, and comments.
5. Use the provided buttons to share the current page on various platforms.
6. Click on a result to open it in a new tab.

## Configuration

The extension allows you to configure the following options:

### Search Settings
- **Number of results to show**: Set the number of results to display in the popup. Default is 5.
- **Number of pagination pages to follow**: Set the number of pagination pages to fetch from Hacker News. Default is 10.
- **Debug function**: Enable the extension to post the response from Algolia to http://localhost:8080/debug.

### Appearance
- **Dark Mode**: Toggle between light and dark themes.

### Privacy & Security
- **Privacy Mode**: Disable caching of search results.
- **Clear Local Data**: Remove all cached search results.

### Language
- Choose between English, Portuguese, or Spanish for the user interface.

### Share Buttons
- Enable or disable individual share buttons (Hacker News, Twitter, Reddit, LinkedIn, Facebook, Bluesky, Copy URL).

### Custom Share Options
- Add your own share buttons for any platform by specifying:
  - Platform name
  - Share URL template (with URL and title placeholders)
  - Button color
  - Enable/disable option

To configure these options:

1. Click on the extension icon in the Chrome toolbar to open the popup.
2. Click the "Options" button to open the options page.
3. Adjust the desired settings.
4. Click the "Save All Settings" button to save your preferences.

## Contributing

Contributions are welcome! If you encounter any issues or have suggestions for improvements, please open an issue or submit a pull request.

## Acknowledgements

This extension uses the [Algolia Search API](https://hn.algolia.com/api) to search for URLs on Hacker News.

## Disclaimer

This project is not affiliated with or endorsed by Hacker News, Algolia, or any of the social media platforms referenced.

