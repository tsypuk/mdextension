# Markdown Page Saver Chrome Extension

A Chrome extension for saving web pages as Markdown with images, built with TypeScript.

## Features

- Save any web page as a Markdown file
- Automatically download all images from the page
- Simple one-click interface
- Works on any website

## Development Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Build the extension:
   ```
   npm run build
   ```

3. Load the extension in Chrome:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `dist` folder

## Project Structure

- `src/`: Source TypeScript files
  - `background.ts`: Background script
  - `content.ts`: Content script injected into web pages
  - `popup.ts`: Script for the extension popup
  - `popup.html`: HTML for the extension popup
  - `manifest.json`: Extension manifest file
  - `icons/`: Extension icons
- `dist/`: Compiled JavaScript and assets (generated)

## How It Works

1. When you click the extension icon, it activates the popup
2. Clicking "Save Page as Markdown" sends a message to the content script
3. The content script extracts the page content and converts it to Markdown
4. The content script also collects all images on the page
5. The popup script downloads the Markdown file and all images

## License

ISC
