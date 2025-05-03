// Popup script
document.addEventListener('DOMContentLoaded', () => {
  const savePageButton = document.getElementById('savePage') as HTMLButtonElement;
  const statusDiv = document.getElementById('status') as HTMLDivElement;
  
  // Save the current page as markdown with images
  savePageButton.addEventListener('click', async () => {
    statusDiv.textContent = 'Processing page...';
    
    try {
      // Get the active tab
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      const activeTab = tabs[0];
      
      if (!activeTab.id) {
        throw new Error('No active tab found');
      }
      
      // Send message to content script to get page content
      chrome.tabs.sendMessage(
        activeTab.id,
        { action: 'getPageContent' },
        async (response) => {
          if (!response || !response.success) {
            statusDiv.textContent = 'Error: Failed to get page content';
            return;
          }
          
          try {
            // Create a sanitized title for the filename
            const sanitizedTitle = response.title
              .replace(/[^a-zA-Z0-9]/g, '_')
              .toLowerCase()
              .substring(0, 50); // Limit length
            
            // Create a text file with the markdown content
            const markdownBlob = new Blob([response.markdown], { type: 'text/markdown' });
            const markdownUrl = URL.createObjectURL(markdownBlob);
            
            // Download the markdown file
            chrome.downloads.download({
              url: markdownUrl,
              filename: `${sanitizedTitle}.md`,
              saveAs: true
            });
            
            // Download each image
            if (response.images && response.images.length > 0) {
              statusDiv.textContent = `Downloading ${response.images.length} images...`;
              
              // Create a folder for images
              const folderName = `${sanitizedTitle}_images`;
              
              // Download each image
              for (const image of response.images) {
                try {
                  chrome.downloads.download({
                    url: image.url,
                    filename: `${folderName}/${image.filename}`,
                    conflictAction: 'uniquify'
                  });
                } catch (error) {
                  console.error(`Error downloading image ${image.url}:`, error);
                }
              }
            }
            
            statusDiv.textContent = 'Page saved as markdown with images!';
          } catch (error) {
            console.error('Error saving content:', error);
            statusDiv.textContent = 'Error: Failed to save content';
          }
        }
      );
    } catch (error) {
      console.error('Error:', error);
      statusDiv.textContent = `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  });
});
