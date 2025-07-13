# Amazon Sandals Scraper

This project automates a search for women's sandals on Amazon Italy using Puppeteer and saves the results locally.

## Prerequisites

- Node.js (v14 or higher)
- npm
- Google Chrome installed at `/usr/bin/google-chrome`

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/cronenborg/amazon-scraper.git
   cd amazon-scraper
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

## Running the Search

Execute the scraper script:
```bash
node ricerca_sandali_amazon.mjs
```
By default, it will crawl up to 7 pages of results (controlled by the `MAX_PAGES` constant).  
The script performs the following steps:
1. Navigates to the Amazon search URL for “sandali donna”
2. Scrolls each page to load all products
3. Extracts title, price, link, and image for each item
4. Saves the combined data to `results/search.json`

## Viewing the Results

Once the search completes, you can review the raw data and an HTML view:

- **JSON**  
  Open `results/search.json` in your editor or JSON viewer.

- **HTML**  
  Open `results/search.html` in your browser to see a formatted view of the results. For example:
  ```bash
  open results/search.html
  ```
  Or drag-and-drop the file into your browser window.

## Configuration

- To change the target URL, edit the `URL` constant in `ricerca_sandali_amazon.mjs`.
- To limit the number of pages crawled, adjust `MAX_PAGES`.
- To enable test mode (crawl only one page), set `TEST_MODE = true`.

## License

This project is licensed under the ISC License.
