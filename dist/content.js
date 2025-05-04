/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/*!************************!*\
  !*** ./src/content.ts ***!
  \************************/

// Content script that runs on web pages
console.log('Markdown extension content script loaded');
// Function to generate Obsidian-like frontmatter
function generateFrontmatter(title, settings) {
    var _a, _b;
    const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    const description = ((_a = document.querySelector('meta[name="description"]')) === null || _a === void 0 ? void 0 : _a.getAttribute('content')) ||
        ((_b = document.querySelector('meta[property="og:description"]')) === null || _b === void 0 ? void 0 : _b.getAttribute('content')) ||
        'Page saved from ' + document.URL;
    // Format tags as YAML array
    const tagsStr = settings.tags.map(tag => `  - ${tag}`).join('\n');
    return `---
title: ${removeSpecialSymbols(title)}
description: ${removeSpecialSymbols(description)}
tags:
${tagsStr}
published: true
date: ${date}
---

`;
}
function removeSpecialSymbols(str) {
    // Define symbols to remove here (markdown incompatible for title/description)
    const symbolsToRemove = [':', '#', '*'];
    // Escape special regex characters
    const escapedSymbols = symbolsToRemove.map(s => '\\' + s).join('');
    const regex = new RegExp(`[${escapedSymbols}]`, 'g');
    return str.replace(regex, '');
}
// Function to convert HTML to Markdown with images in their original positions
function htmlToMarkdown(element, images, settings) {
    let markdown = '';
    // Add frontmatter if enabled
    if (settings.addFrontmatter) {
        markdown += generateFrontmatter(document.title, settings);
    }
    else {
        // Just add the title as a heading
        markdown += `# ${document.title}\n\n`;
    }
    // Add source URL
    markdown += `Source: [${document.URL}](${document.URL})\n\n`;
    // Create a map of image elements to their markdown representation
    const imageMap = new Map();
    images.forEach(img => {
        const altText = img.element.alt || 'image';
        imageMap.set(img.element.src, `![${altText}](images/${img.filename})`);
    });
    // Process the main content
    // We'll use a more direct approach to capture the visible content
    // Process all visible text nodes and images in order
    function processNode(node, depth = 0) {
        var _a, _b, _c, _d, _e;
        if (!node)
            return '';
        let result = '';
        // Check node type
        switch (node.nodeType) {
            case Node.ELEMENT_NODE:
                const element = node;
                // Skip hidden elements
                if (element.offsetParent === null && element.tagName !== 'BODY') {
                    return '';
                }
                // Handle specific element types
                switch (element.tagName.toLowerCase()) {
                    case 'h1':
                    case 'h2':
                    case 'h3':
                    case 'h4':
                    case 'h5':
                    case 'h6':
                        const level = parseInt(element.tagName.substring(1));
                        const hashes = '#'.repeat(level);
                        result += `${hashes} ${(_a = element.textContent) === null || _a === void 0 ? void 0 : _a.trim()}\n\n`;
                        break;
                    case 'p':
                        // Process paragraph content
                        let paragraphContent = '';
                        for (let i = 0; i < element.childNodes.length; i++) {
                            paragraphContent += processNode(element.childNodes[i], depth + 1);
                        }
                        result += `${paragraphContent.trim()}\n\n`;
                        break;
                    case 'img':
                        // Handle image element
                        const imgElement = element;
                        if (imgElement.src && imageMap.has(imgElement.src)) {
                            result += imageMap.get(imgElement.src) + '\n\n';
                        }
                        break;
                    case 'a':
                        // Handle links
                        const link = element;
                        const href = link.href;
                        const text = ((_b = link.textContent) === null || _b === void 0 ? void 0 : _b.trim()) || href;
                        result += `[${text}](${href})`;
                        break;
                    case 'ul':
                    case 'ol':
                        // Handle lists
                        const isOrdered = element.tagName.toLowerCase() === 'ol';
                        const items = element.querySelectorAll('li');
                        items.forEach((item, index) => {
                            const prefix = isOrdered ? `${index + 1}. ` : '- ';
                            let itemContent = '';
                            for (let i = 0; i < item.childNodes.length; i++) {
                                itemContent += processNode(item.childNodes[i], depth + 1);
                            }
                            result += `${prefix}${itemContent.trim()}\n`;
                        });
                        result += '\n';
                        break;
                    case 'br':
                        result += '\n';
                        break;
                    case 'strong':
                    case 'b':
                        let boldContent = '';
                        for (let i = 0; i < element.childNodes.length; i++) {
                            boldContent += processNode(element.childNodes[i], depth + 1);
                        }
                        result += `**${boldContent.trim()}**`;
                        break;
                    case 'em':
                    case 'i':
                        let italicContent = '';
                        for (let i = 0; i < element.childNodes.length; i++) {
                            italicContent += processNode(element.childNodes[i], depth + 1);
                        }
                        result += `*${italicContent.trim()}*`;
                        break;
                    case 'code':
                        result += `\`${(_c = element.textContent) === null || _c === void 0 ? void 0 : _c.trim()}\``;
                        break;
                    case 'pre':
                        result += `\`\`\`\n${(_d = element.textContent) === null || _d === void 0 ? void 0 : _d.trim()}\n\`\`\`\n\n`;
                        break;
                    case 'blockquote':
                        let quoteContent = '';
                        for (let i = 0; i < element.childNodes.length; i++) {
                            quoteContent += processNode(element.childNodes[i], depth + 1);
                        }
                        // Add '> ' to each line
                        result += quoteContent.split('\n').map(line => `> ${line}`).join('\n') + '\n\n';
                        break;
                    case 'div':
                    case 'section':
                    case 'article':
                    case 'main':
                    case 'span':
                        // Generic container elements - process their children
                        for (let i = 0; i < element.childNodes.length; i++) {
                            result += processNode(element.childNodes[i], depth + 1);
                        }
                        break;
                    case 'table':
                        result += '\n\n';
                        // Handle tables
                        const rows = element.querySelectorAll('tr');
                        if (rows.length > 0) {
                            // Process header row
                            const headerRow = rows[0];
                            const headers = headerRow.querySelectorAll('th');
                            if (headers.length > 0) {
                                // Table with headers
                                result += '| ' + Array.from(headers).map(th => {
                                    // Process header cell content including images
                                    let cellContent = '';
                                    for (let i = 0; i < th.childNodes.length; i++) {
                                        cellContent += processNode(th.childNodes[i], depth + 1);
                                    }
                                    return cellContent.trim().replace(/\n/g, ' ');
                                }).join(' | ') + ' |\n';
                                result += '| ' + Array.from(headers).map(() => '---').join(' | ') + ' |\n';
                                // Process data rows
                                for (let i = 1; i < rows.length; i++) {
                                    const cells = rows[i].querySelectorAll('td');
                                    result += '| ' + Array.from(cells).map(td => {
                                        // Process cell content including images
                                        let cellContent = '';
                                        for (let i = 0; i < td.childNodes.length; i++) {
                                            cellContent += processNode(td.childNodes[i], depth + 1);
                                        }
                                        return cellContent.trim().replace(/\n/g, ' ');
                                    }).join(' | ') + ' |\n';
                                }
                            }
                            else {
                                // Table without headers, use first row as header
                                const firstRowCells = rows[0].querySelectorAll('td');
                                result += '| ' + Array.from(firstRowCells).map(td => {
                                    // Process cell content including images
                                    let cellContent = '';
                                    for (let i = 0; i < td.childNodes.length; i++) {
                                        cellContent += processNode(td.childNodes[i], depth + 1);
                                    }
                                    return cellContent.trim().replace(/\n/g, ' ');
                                }).join(' | ') + ' |\n';
                                result += '| ' + Array.from(firstRowCells).map(() => '---').join(' | ') + ' |\n';
                                // Process remaining rows
                                for (let i = 1; i < rows.length; i++) {
                                    const cells = rows[i].querySelectorAll('td');
                                    result += '| ' + Array.from(cells).map(td => {
                                        // Process cell content including images
                                        let cellContent = '';
                                        for (let i = 0; i < td.childNodes.length; i++) {
                                            cellContent += processNode(td.childNodes[i], depth + 1);
                                        }
                                        return cellContent.trim().replace(/\n/g, ' ');
                                    }).join(' | ') + ' |\n';
                                }
                            }
                            result += '\n';
                        }
                        break;
                    case 'td':
                    case 'th':
                        // Process table cell content directly
                        for (let i = 0; i < element.childNodes.length; i++) {
                            result += processNode(element.childNodes[i], depth + 1);
                        }
                        break;
                    default:
                        // For other elements, just process their children
                        for (let i = 0; i < element.childNodes.length; i++) {
                            result += processNode(element.childNodes[i], depth + 1);
                        }
                }
                break;
            case Node.TEXT_NODE:
                // Only include non-empty text nodes
                const text = (_e = node.textContent) === null || _e === void 0 ? void 0 : _e.trim();
                if (text) {
                    result += text + ' ';
                }
                break;
        }
        return result;
    }
    // Start processing from the body
    const mainContent = processNode(document.body);
    markdown += mainContent;
    // Check if any images were not included in the markdown
    const usedImages = new Set();
    images.forEach(img => {
        if (markdown.includes(`images/${img.filename}`)) {
            usedImages.add(img.url);
        }
    });
    // Add any unused images at the end
    const unusedImages = images.filter(img => !usedImages.has(img.url));
    if (unusedImages.length > 0) {
        markdown += '\n## Additional Images\n\n';
        unusedImages.forEach(img => {
            const altText = img.element.alt || 'image';
            markdown += `![${altText}](images/${img.filename})\n\n`;
        });
    }
    return markdown;
}
// Function to collect all images from the page
function collectImages() {
    const images = [];
    const imgElements = document.querySelectorAll('img');
    const processedUrls = new Set(); // To avoid duplicates
    imgElements.forEach((img, index) => {
        const src = img.src;
        if (src && src.trim() !== '' && !processedUrls.has(src)) {
            try {
                // Skip data URLs (they're often tiny icons or tracking pixels)
                if (src.startsWith('data:')) {
                    return;
                }
                // Skip very small images (likely icons, spacers, etc.) unless they have alt text
                if (img.width < 20 && img.height < 20 && !img.alt) {
                    return;
                }
                // Create a filename from the image URL
                let filename = src.split('/').pop() || `image_${index}.jpg`;
                // Clean up the filename
                filename = filename.split('?')[0]; // Remove query parameters
                if (!filename.includes('.')) {
                    filename += '.jpg'; // Add extension if missing
                }
                // Make sure filename is valid
                filename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
                images.push({
                    url: src,
                    filename: filename,
                    element: img,
                    id: `img_${index}`
                });
                processedUrls.add(src); // Mark this URL as processed
            }
            catch (e) {
                console.error('Error processing image:', e);
            }
        }
    });
    // Also look for background images in CSS
    const elementsWithBackground = document.querySelectorAll('[style*="background-image"]');
    elementsWithBackground.forEach((element, index) => {
        const style = window.getComputedStyle(element);
        const backgroundImage = style.backgroundImage;
        if (backgroundImage && backgroundImage !== 'none') {
            try {
                // Extract URL from the background-image style
                const urlMatch = /url\(['"]?([^'"()]+)['"]?\)/i.exec(backgroundImage);
                if (urlMatch && urlMatch[1]) {
                    const src = urlMatch[1];
                    if (!processedUrls.has(src)) {
                        // Skip data URLs
                        if (src.startsWith('data:')) {
                            return;
                        }
                        // Create a filename
                        let filename = src.split('/').pop() || `bg_image_${index}.jpg`;
                        filename = filename.split('?')[0];
                        if (!filename.includes('.')) {
                            filename += '.jpg';
                        }
                        filename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
                        // Create a virtual image element
                        const imgElement = document.createElement('img');
                        imgElement.src = src;
                        imgElement.alt = 'Background Image';
                        images.push({
                            url: src,
                            filename: filename,
                            element: imgElement,
                            id: `bg_img_${index}`
                        });
                        processedUrls.add(src);
                    }
                }
            }
            catch (e) {
                console.error('Error processing background image:', e);
            }
        }
    });
    return images;
}
// Sanitize ' '
function normalizeSpaces(str) {
    return str.replace(/[\u00A0\u2000-\u200B\u202F\u205F\u3000]/g, ' ');
}
// Function to get page content as markdown with image references
function getPageAsMarkdown(settings) {
    // Collect all images
    const images = collectImages();
    // Convert HTML to markdown with images in their original positions
    const markdown = normalizeSpaces(htmlToMarkdown(document.body, images, settings));
    return {
        markdown,
        images: images.map(img => ({ url: img.url, filename: img.filename }))
    };
}
// Listen for messages from the popup or background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Message received in content script:', message);
    if (message.action === 'getPageContent') {
        // Default settings if not provided
        const settings = message.settings || {
            addFrontmatter: true,
            tags: ['web-clipping']
        };
        const pageContent = getPageAsMarkdown(settings);
        sendResponse({
            success: true,
            markdown: pageContent.markdown,
            images: pageContent.images,
            title: document.title
        });
    }
    // Return true to indicate you wish to send a response asynchronously
    return true;
});

/******/ })()
;
//# sourceMappingURL=content.js.map