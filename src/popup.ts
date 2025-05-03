// Popup script
document.addEventListener('DOMContentLoaded', () => {
  const scanPageButton = document.getElementById('scanPage') as HTMLButtonElement;
  const processMarkdownButton = document.getElementById('processMarkdown') as HTMLButtonElement;
  const markdownInput = document.getElementById('markdownInput') as HTMLTextAreaElement;
  const resultDiv = document.getElementById('result') as HTMLDivElement;
  
  // Scan the current page for markdown elements
  scanPageButton.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      if (activeTab.id) {
        chrome.tabs.sendMessage(
          activeTab.id,
          { action: 'scanForMarkdown' },
          (response) => {
            if (response && response.success) {
              resultDiv.textContent = response.message;
            } else {
              resultDiv.textContent = 'Error scanning page or no response received.';
            }
          }
        );
      }
    });
  });
  
  // Process markdown from the textarea
  processMarkdownButton.addEventListener('click', () => {
    const markdown = markdownInput.value;
    
    if (!markdown) {
      resultDiv.textContent = 'Please enter some markdown text first.';
      return;
    }
    
    chrome.runtime.sendMessage(
      { action: 'processMarkdown', markdown },
      (response) => {
        if (response && response.success) {
          resultDiv.textContent = 'Markdown processed successfully!';
        } else {
          resultDiv.textContent = 'Error processing markdown.';
        }
      }
    );
  });
});
