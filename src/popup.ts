// Popup script
document.addEventListener('DOMContentLoaded', () => {
  const savePageButton = document.getElementById('savePage') as HTMLButtonElement;
  const statusDiv = document.getElementById('status') as HTMLDivElement;
  const downloadPathInput = document.getElementById('downloadPath') as HTMLInputElement;
  
  // Load saved download path from storage
  chrome.storage.sync.get(['downloadPath'], (result) => {
    if (result.downloadPath) {
      downloadPathInput.value = result.downloadPath;
    }
  });
  
  // Save download path when it changes
  downloadPathInput.addEventListener('change', () => {
    chrome.storage.sync.set({ downloadPath: downloadPathInput.value });
  });
  
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
                        } else {
                          completedDownloads++;
                        }
                        
                        if (completedDownloads + failedDownloads === response.images.length) {
                          if (failedDownloads > 0) {
                            statusDiv.textContent = `Page saved! ${completedDownloads} images downloaded, ${failedDownloads} failed.`;
                          } else {
                            statusDiv.textContent = 'Page saved as markdown with all images!';
                          }
                        }
                      });
                    } catch (error) {
                      console.error(`Error downloading image ${image.url}:`, error);
                      failedDownloads++;
                      
                      if (completedDownloads + failedDownloads === response.images.length) {
                        statusDiv.textContent = `Page saved! ${completedDownloads} images downloaded, ${failedDownloads} failed.`;
                      }
                    }
                  }
                });
              } else {
                statusDiv.textContent = 'Page saved as markdown! (No images found)';
              }
            });
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
