# Markdown Page Saver Chrome Extension

A Chrome extension for saving web pages as Markdown with images, built with TypeScript.

## Features

- Save any web page as a Markdown file
- Automatically download all images from the page
- Organize downloads in a folder structure
- Configure download location
- Simple one-click interface
- Works on any website
- Context menu integration

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
2. Enter your preferred download path (relative to Downloads folder)
3. Click "Save Page as Markdown" to start the process
4. The content script extracts the page content and converts it to Markdown
5. The content script also collects all images on the page
6. The extension creates a folder with the page title
7. The markdown file and all images are saved in this folder

## License

ISC
