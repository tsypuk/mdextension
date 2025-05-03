// Background script
console.log('Markdown extension background script loaded');

// Listen for messages from content script or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Message received in background:', message);
  
  if (message.action === 'downloadMarkdown') {
    // Handle downloading markdown and images
    // This is a placeholder - the actual download is handled in the popup
    sendResponse({ success: true });
  }
  
  // Return true to indicate you wish to send a response asynchronously
  return true;
});
