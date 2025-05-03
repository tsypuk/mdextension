/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/popup.ts":
/*!**********************!*\
  !*** ./src/popup.ts ***!
  \**********************/
/***/ (function() {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// Popup script
document.addEventListener('DOMContentLoaded', () => {
    const savePageButton = document.getElementById('savePage');
    const statusDiv = document.getElementById('status');
    const downloadPathInput = document.getElementById('downloadPath');
    const tagsInput = document.getElementById('tags');
    const addFrontmatterCheckbox = document.getElementById('addFrontmatter');
    // Load saved settings from storage
    chrome.storage.sync.get(['downloadPath', 'tags', 'addFrontmatter'], (result) => {
        if (result.downloadPath) {
            downloadPathInput.value = result.downloadPath;
        }
        if (result.tags) {
            tagsInput.value = result.tags;
        }
        if (result.addFrontmatter !== undefined) {
            addFrontmatterCheckbox.checked = result.addFrontmatter;
        }
    });
    // Save settings when they change
    downloadPathInput.addEventListener('change', () => {
        chrome.storage.sync.set({ downloadPath: downloadPathInput.value });
    });
    tagsInput.addEventListener('change', () => {
        chrome.storage.sync.set({ tags: tagsInput.value });
    });
    addFrontmatterCheckbox.addEventListener('change', () => {
        chrome.storage.sync.set({ addFrontmatter: addFrontmatterCheckbox.checked });
    });
    // Save the current page as markdown with images
    savePageButton.addEventListener('click', () => __awaiter(void 0, void 0, void 0, function* () {
        statusDiv.textContent = 'Processing page...';
        try {
            // Get the active tab
            const tabs = yield chrome.tabs.query({ active: true, currentWindow: true });
            const activeTab = tabs[0];
            if (!activeTab.id) {
                throw new Error('No active tab found');
            }
            // Get user-defined tags
            const tags = tagsInput.value.trim();
            // Send message to content script to get page content
            chrome.tabs.sendMessage(activeTab.id, {
                action: 'getPageContent',
                settings: {
                    addFrontmatter: addFrontmatterCheckbox.checked,
                    tags: tags ? tags.split(',').map(tag => tag.trim()) : ['web-clipping']
                }
            }, (response) => __awaiter(void 0, void 0, void 0, function* () {
                if (!response || !response.success) {
                    statusDiv.textContent = 'Error: Failed to get page content';
                    return;
                }
                try {
                    // Create a sanitized title for the folder name
                    const sanitizedTitle = response.title
                        .replace(/[^a-zA-Z0-9]/g, '_')
                        .toLowerCase()
                        .substring(0, 50); // Limit length
                    // Get the download path from input - use absolute path
                    const downloadPath = downloadPathInput.value.trim();
                    // Create the full path for the folder - use absolute path if provided
                    const folderPath = downloadPath
                        ? `${downloadPath}/${sanitizedTitle}`
                        : sanitizedTitle;
                    // Create a text file with the markdown content
                    const markdownBlob = new Blob([response.markdown], { type: 'text/markdown' });
                    const markdownUrl = URL.createObjectURL(markdownBlob);
                    // Download the markdown file to the folder
                    chrome.downloads.download({
                        url: markdownUrl,
                        filename: `${folderPath}/${sanitizedTitle}.md`,
                        saveAs: false
                    }, (downloadId) => {
                        if (chrome.runtime.lastError) {
                            statusDiv.textContent = `Error: ${chrome.runtime.lastError.message}`;
                            return;
                        }
                        // Download each image to the same folder
                        if (response.images && response.images.length > 0) {
                            statusDiv.textContent = `Downloading ${response.images.length} images...`;
                            let completedDownloads = 0;
                            let failedDownloads = 0;
                            // Create images directory first
                            chrome.downloads.download({
                                url: URL.createObjectURL(new Blob([''])),
                                filename: `${folderPath}/images/.placeholder`,
                                saveAs: false
                            }, () => {
                                // Download each image
                                for (const image of response.images) {
                                    try {
                                        chrome.downloads.download({
                                            url: image.url,
                                            filename: `${folderPath}/images/${image.filename}`,
                                            conflictAction: 'uniquify'
                                        }, (downloadId) => {
                                            if (chrome.runtime.lastError) {
                                                console.error(`Failed to download image: ${image.url}`, chrome.runtime.lastError);
                                                failedDownloads++;
                                            }
                                            else {
                                                completedDownloads++;
                                            }
                                            if (completedDownloads + failedDownloads === response.images.length) {
                                                if (failedDownloads > 0) {
                                                    statusDiv.textContent = `Page saved! ${completedDownloads} images downloaded, ${failedDownloads} failed.`;
                                                }
                                                else {
                                                    statusDiv.textContent = 'Page saved as markdown with all images!';
                                                }
                                            }
                                        });
                                    }
                                    catch (error) {
                                        console.error(`Error downloading image ${image.url}:`, error);
                                        failedDownloads++;
                                        if (completedDownloads + failedDownloads === response.images.length) {
                                            statusDiv.textContent = `Page saved! ${completedDownloads} images downloaded, ${failedDownloads} failed.`;
                                        }
                                    }
                                }
                            });
                        }
                        else {
                            statusDiv.textContent = 'Page saved as markdown! (No images found)';
                        }
                    });
                }
                catch (error) {
                    console.error('Error saving content:', error);
                    statusDiv.textContent = 'Error: Failed to save content';
                }
            }));
        }
        catch (error) {
            console.error('Error:', error);
            statusDiv.textContent = `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
        }
    }));
});


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./src/popup.ts"]();
/******/ 	
/******/ })()
;
//# sourceMappingURL=popup.js.map