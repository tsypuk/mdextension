// Popup script
document.addEventListener('DOMContentLoaded', () => {
  const savePageButton = document.getElementById('savePage') as HTMLButtonElement;
  const statusDiv = document.getElementById('status') as HTMLDivElement;
  
  // Function to create a ZIP file with markdown and images
  async function createZipFile(markdown: string, images: { url: string, filename: string }[], title: string): Promise<Blob> {
    // We'll need to dynamically import JSZip
    // In a real implementation, you'd add JSZip as a dependency in package.json
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();
    
    // Add the markdown file
    const sanitizedTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    zip.file(`${sanitizedTitle}.md`, markdown);
    
    // Create images folder
    const imagesFolder = zip.folder('images');
    
    // Add all images
    const imagePromises = images.map(async (image) => {
      try {
        const response = await fetch(image.url);
        if (!response.ok) throw new Error(`Failed to fetch image: ${image.url}`);
        
        const blob = await response.blob();
        const filename = image.filename.split('/').pop() || 'image.jpg';
        imagesFolder?.file(filename, blob);
        
        return { success: true, url: image.url };
      } catch (error) {
        console.error(`Error downloading image ${image.url}:`, error);
        return { success: false, url: image.url, error };
      }
    });
    
    await Promise.all(imagePromises);
    
    // Generate the zip file
    return await zip.generateAsync({ type: 'blob' });
  }
  
  // Function to download the ZIP file
  function downloadZip(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  
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
          
          statusDiv.textContent = 'Creating ZIP file with markdown and images...';
          
          try {
            // Create ZIP file with markdown and images
            const zipBlob = await createZipFile(
              response.markdown,
              response.images,
              response.title
            );
            
            // Download the ZIP file
            const sanitizedTitle = response.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
            downloadZip(zipBlob, `${sanitizedTitle}_markdown.zip`);
            
            statusDiv.textContent = 'Page saved as markdown with images!';
          } catch (error) {
            console.error('Error creating ZIP file:', error);
            statusDiv.textContent = 'Error: Failed to create ZIP file';
          }
        }
      );
    } catch (error) {
      console.error('Error:', error);
      statusDiv.textContent = `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  });
});
