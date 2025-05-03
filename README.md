# Markdown Chrome Extension

A Chrome extension for working with Markdown content, built with TypeScript.

## Features

- Scan web pages for potential Markdown content
- Process Markdown text
- Simple popup interface

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
- `dist/`: Compiled JavaScript and assets (generated)

## Building

The project uses Webpack to bundle TypeScript files into JavaScript.

## License

ISC
