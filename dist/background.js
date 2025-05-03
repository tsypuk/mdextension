/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/*!***************************!*\
  !*** ./src/background.ts ***!
  \***************************/

// Background script
console.log('Markdown extension background script loaded');
// Create a context menu item for saving pages
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: 'save-as-markdown',
        title: 'Save page as Markdown',
        contexts: ['page']
    });
});
// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'save-as-markdown' && (tab === null || tab === void 0 ? void 0 : tab.id)) {
        // Send message to content script to get page content
        chrome.tabs.sendMessage(tab.id, { action: 'getPageContent' });
    }
});
// Listen for messages from content script or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Message received in background:', message);
    // Return true to indicate you wish to send a response asynchronously
    return true;
});

/******/ })()
;
//# sourceMappingURL=background.js.map