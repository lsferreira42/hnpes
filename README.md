# HNPES - Hacker News Previous Entry Search

> ⚠️ **Note**: This extension is now available on the Chrome Web Store! [Get it here](https://chromewebstore.google.com/detail/hnpes-hacker-news-previou/ndjkjkemnioillnkfeppiocomehgfegi)


*Procurando um readme em [Português](README.pt-BR.md)* ?

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

- Search for the current URL (or any pasted URL) on Hacker News
- Display the top results from Hacker News in the extension's popup
- **Search by pasted URL:** Paste a URL in the popup and click Search (or press Enter) to look it up without being on that page
- **Context menu:** Right-click any link → "Search on Hacker News" → opens a new tab with results for that URL
- **Badge on icon:** Optional count of HN submissions for the current page on the extension icon (configurable)
- **"Discussed on HN" banner:** Optional banner at the top of pages that were submitted to HN, with a link to the discussion (off by default)
- Detailed result information:
  - Number of comments in each post
  - Date of post creation
  - Post author
  - Points/score of each post
  - **Exact match** / **Same domain** badge per result
- Share content on multiple platforms:
  - Hacker News
  - Twitter/X
  - Reddit
  - LinkedIn
  - Facebook
  - Bluesky
  - Copy URL to clipboard
  - Add custom sharing platforms
- Sort results by Date, Comments, or Score (default sort saved in options)
- **Time filter:** Restrict results to All time, Last year, or Last 5 years (in options and in popup)
- UI improvements:
  - Dark mode
  - Modern, clean interface
  - Scrollable popup with max height
  - Loading spinner while searching
  - "Try again" button on network error
- Customization options:
  - Configure which share buttons to display
  - Create custom share buttons for any platform
  - Set the number of results to display
  - Set the number of pagination pages to follow
  - Default sort order
  - Cache TTL in minutes (0 = no expiry)
  - Show/hide badge on extension icon
  - Show/hide "Discussed on HN" banner on submitted pages
- Privacy features:
  - Privacy mode to disable caching
  - Option to clear local data
- Multilingual support:
  - English
  - Portuguese
  - Spanish
- **Reliability:** URL validation (no requests for `chrome://`, etc.), automatic retry on API failure (up to 3 attempts)
- **Accessibility:** ARIA labels and keyboard-friendly popup
- Advanced caching with optional TTL for better performance
- Improved URL matching for better results

## Installation

1. Clone or download this repository to your local machine.
2. Open Google Chrome and navigate to `chrome://extensions`.
3. Enable "Developer mode" using the toggle switch in the top right corner.
4. Click on the "Load unpacked" button.
5. Select the folder containing the extension files.
6. The extension should now be installed and visible in the list of installed extensions.

## Usage

1. Navigate to a webpage you want to search on Hacker News (or leave the URL field empty to use the current tab).
2. Click on the extension icon in the Chrome toolbar to open the popup.
3. The extension will automatically fetch the top results from Hacker News related to the current (or pasted) URL.
4. **Optional:** Paste a different URL in the "Search URL" field and click **Search** (or press Enter) to search that URL.
5. Results are displayed in the popup with details like points, author, comments, and an Exact match / Same domain badge.
6. Use the **Time** and **Sort** controls to filter and order results. Use the share buttons to share the page.
7. Click on a result to open it in a new tab.
8. **Context menu:** Right-click any link on a page and choose "Search on Hacker News" to open results for that link in a new tab.

## Configuration

The extension allows you to configure the following options:

### Search Settings
- **Number of results to show**: Set the number of results to display in the popup. Default is 5.
- **Number of pagination pages to follow**: Set the number of pagination pages to fetch from Hacker News. Default is 10.
- **Default sort**: Default order for results (Date, Comments, or Score).
- **Time filter**: Restrict results to All time, Last year, or Last 5 years.
- **Cache TTL (minutes)**: How long to keep cached results (0 = use until cleared).
- **Debug function**: Enable the extension to post the response from Algolia to http://localhost:8080/debug (only when enabled; errors are ignored).

### Appearance
- **Dark Mode**: Toggle between light and dark themes.
- **Show submission count on extension icon**: Display the number of HN submissions for the current page on the extension icon.
- **Show "Discussed on HN" banner on submitted pages**: When enabled, show a small banner at the top of pages that were submitted to Hacker News (off by default).

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

