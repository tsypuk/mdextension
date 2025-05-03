// Content script that runs on web pages
console.log('Markdown extension content script loaded');

// Listen for messages from the popup or background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Message received in content script:', message);
  
  if (message.action === 'scanForMarkdown') {
    // Example: Find all textarea elements that might contain markdown
    const textareas = document.querySelectorAll('textarea');
    const markdownElements: Element[] = [];
    
    textareas.forEach(textarea => {
      // Simple check - could be enhanced with better detection
      if (textarea.value.includes('#') || textarea.value.includes('```')) {
        markdownElements.push(textarea);
      }
    });
    
    sendResponse({ 
      success: true, 
      count: markdownElements.length,
      message: `Found ${markdownElements.length} potential markdown elements`
    });
  }
  
  // Return true to indicate you wish to send a response asynchronously
  return true;
});
