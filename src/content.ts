// Content script that runs on web pages
console.log('Markdown extension content script loaded');

// Function to convert HTML to Markdown
// In a real implementation, you'd use a library like TurndownJS
function htmlToMarkdown(element: HTMLElement): string {
  let markdown = '';
  
  // Process headings
  const headings = element.querySelectorAll('h1, h2, h3, h4, h5, h6');
  headings.forEach(heading => {
    const level = parseInt(heading.tagName.substring(1));
    const hashes = '#'.repeat(level);
    markdown += `${hashes} ${heading.textContent?.trim()}\n\n`;
  });
  
  // Process paragraphs
  const paragraphs = element.querySelectorAll('p');
  paragraphs.forEach(p => {
    markdown += `${p.textContent?.trim()}\n\n`;
  });
  
  // Process lists
  const lists = element.querySelectorAll('ul, ol');
  lists.forEach(list => {
    const isOrdered = list.tagName.toLowerCase() === 'ol';
    const items = list.querySelectorAll('li');
    items.forEach((item, index) => {
      const prefix = isOrdered ? `${index + 1}. ` : '- ';
      markdown += `${prefix}${item.textContent?.trim()}\n`;
    });
    markdown += '\n';
  });
  
  return markdown;
}

// Function to collect all images from the page
function collectImages(): { url: string, filename: string }[] {
  const images: { url: string, filename: string }[] = [];
  const imgElements = document.querySelectorAll('img');
  
  imgElements.forEach((img, index) => {
    const src = img.src;
    if (src && src.trim() !== '') {
      try {
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
          filename: filename
        });
      } catch (e) {
        console.error('Error processing image:', e);
      }
    }
  });
  
  return images;
}

// Function to get page content as markdown with image references
function getPageAsMarkdown(): { markdown: string, images: { url: string, filename: string }[] } {
  // Get the main content of the page
  const mainContent = document.body;
  
  // Collect all images
  const images = collectImages();
  
  // Convert HTML to markdown (basic implementation)
  let markdown = `# ${document.title}\n\n`;
  
  // Add main content
  markdown += htmlToMarkdown(mainContent);
  
  // Add image references at the end
  if (images.length > 0) {
    markdown += '\n## Images\n\n';
    images.forEach(image => {
      markdown += `![Image](images/${image.filename})\n\n`;
    });
  }
  
  return {
    markdown,
    images
  };
}

// Listen for messages from the popup or background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Message received in content script:', message);
  
  if (message.action === 'getPageContent') {
    const pageContent = getPageAsMarkdown();
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
