// Background script
console.log('Background script loaded');

// Listen for messages from content script or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Message received in background:', message);
  
  if (message.action === 'processMarkdown') {
    // Process markdown here or pass to another function
    sendResponse({ success: true, result: 'Processed markdown' });
  }
  
  // Return true to indicate you wish to send a response asynchronously
  return true;
});
