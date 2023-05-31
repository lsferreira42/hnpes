# HNPES - Hacker News Previous Entry Search

HNPES allows you to search for the current URL on Hacker News and view the top results directly from the extension's popup.

## History

Since i became a user of hackernews ( like ten or eleven years ago ) i used a bookmarklet to see if the URL i am browsing has already been submitted to hackernews:

```javascript
(function() {
    // create a new XMLHttpRequest object
    var request = new XMLHttpRequest();
    
    // initialize a new request, using the GET method
    request.open("GET", "https://hn.algolia.com/api/v1/search?query=" + encodeURIComponent(location.href), true);
    
    // define the state change callback
    request.onreadystatechange = function() {
        // check the readyState and status
        if(request.readyState == 4 && request.status == 200) {
            // parse the response text
            var response = JSON.parse(request.responseText);
            
            // check the number of hits
            if(response.nbHits > 0) {
                // redirect to the first hit
                location.href = "https://news.ycombinator.com/item?id=" + response.hits[0].objectID;
            } else {
                // alert the user that the URL has not been submitted yet
                alert("this url has not been submitted yet");
            }
        }
    };
    
    // send the request
    request.send();
})();
```

 Due to some CSP and CORS nonsense a lot of sites have been breaking this script, looking for solutions i found that the only way to bypass that is using a chrome extension ( A Browser extension, but i am a chrome user ), so that's what i did!

## Features

- Search for the current URL on Hacker News.
- Display the top results from Hacker News in the extension's popup.
- Configurable number of results to display.
- Configurable number of pagination pages to follow.

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
4. The results will be displayed in the popup.
5. Click on a result to open it in a new tab.

## Configuration

The extension allows you to configure the following options:

- **Number of results to show**: Set the number of results to display in the popup. Default is 3.
- **Number of pagination pages to follow**: Set the number of pagination pages to fetch from Hacker News. Default is 1.

To configure these options:

1. Click on the extension icon in the Chrome toolbar to open the popup.
2. Click on the gear icon in the top right corner to open the options page.
3. Adjust the desired settings.
4. Click the "Save" button to save the settings.

## Contributing

Contributions are welcome! If you encounter any issues or have suggestions for improvements, please open an issue or submit a pull request.

## Acknowledgements

This extension uses the [Algolia Search API](https://hn.algolia.com/api) to search for URLs on Hacker News.

## Disclaimer

This project is not affiliated with or endorsed by Hacker News or Algolia.

