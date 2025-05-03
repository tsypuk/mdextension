// Content script that runs on web pages
console.log('Markdown extension content script loaded');

// Interface for image information
interface ImageInfo {
  url: string;
  filename: string;
  element: HTMLImageElement;
  id: string; // Unique ID to replace in the markdown
}

// Function to convert HTML to Markdown with images in their original positions
function htmlToMarkdown(element: HTMLElement, images: ImageInfo[]): string {
  // Create a clone of the element to work with
  const clone = element.cloneNode(true) as HTMLElement;
  
  // Create a mapping of image elements to their markdown placeholders
  const imageMap = new Map<HTMLImageElement, string>();
  images.forEach(img => {
    const imgElements = clone.querySelectorAll('img');
    for (const imgElement of imgElements) {
      if (imgElement.src === img.element.src) {
        const altText = imgElement.alt || 'image';
        const placeholder = `![${altText}](images/${img.filename})`;
        imageMap.set(imgElement, placeholder);
      }
    }
  });
  
  // Process the clone element
  let markdown = '';
  
  // Add title
  markdown += `# ${document.title}\n\n`;
  markdown += `Source: [${document.URL}](${document.URL})\n\n`;
  
  // Process headings
  const headings = clone.querySelectorAll('h1, h2, h3, h4, h5, h6');
  headings.forEach(heading => {
    const level = parseInt(heading.tagName.substring(1));
    const hashes = '#'.repeat(level);
    markdown += `${hashes} ${heading.textContent?.trim()}\n\n`;
    
    // Remove processed heading to avoid duplication
    heading.parentNode?.removeChild(heading);
  });
  
  // Process paragraphs and replace images
  const paragraphs = clone.querySelectorAll('p');
  paragraphs.forEach(p => {
    let paragraphText = p.textContent?.trim() || '';
    
    // Check if paragraph contains images
    const images = p.querySelectorAll('img');
    if (images.length > 0) {
      images.forEach(img => {
        if (imageMap.has(img)) {
          // If the paragraph only contains the image, replace the whole paragraph
          if (p.textContent?.trim() === '') {
            paragraphText = imageMap.get(img) || '';
          } else {
            // Otherwise, add the image after the paragraph
            paragraphText += '\n\n' + (imageMap.get(img) || '');
          }
        }
      });
    }
    
    markdown += `${paragraphText}\n\n`;
  });
  
  // Process lists
  const lists = clone.querySelectorAll('ul, ol');
  lists.forEach(list => {
    const isOrdered = list.tagName.toLowerCase() === 'ol';
    const items = list.querySelectorAll('li');
    items.forEach((item, index) => {
      const prefix = isOrdered ? `${index + 1}. ` : '- ';
      
      // Check if list item contains images
      const images = item.querySelectorAll('img');
      let itemText = item.textContent?.trim() || '';
      
      if (images.length > 0) {
        images.forEach(img => {
          if (imageMap.has(img)) {
            // Add the image after the list item text
            itemText += ' ' + (imageMap.get(img) || '');
          }
        });
      }
      
      markdown += `${prefix}${itemText}\n`;
    });
    markdown += '\n';
  });
  
  // Process remaining images that weren't in paragraphs or lists
  images.forEach(img => {
    const imgElement = img.element;
    // Check if this image was already processed
    let wasProcessed = false;
    imageMap.forEach((placeholder, element) => {
      if (element.src === imgElement.src) {
        wasProcessed = true;
      }
    });
    
    // If not processed, add it now
    if (!wasProcessed) {
      const altText = imgElement.alt || 'image';
      markdown += `![${altText}](images/${img.filename})\n\n`;
    }
  });
  
  return markdown;
}

// Function to collect all images from the page
function collectImages(): ImageInfo[] {
  const images: ImageInfo[] = [];
  const imgElements = document.querySelectorAll('img');
  
  imgElements.forEach((img, index) => {
    const src = img.src;
    if (src && src.trim() !== '' && img.width > 10 && img.height > 10) { // Skip tiny images
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
          filename: filename,
          element: img,
          id: `img_${index}`
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
  
  // Convert HTML to markdown with images in their original positions
  const markdown = htmlToMarkdown(mainContent, images);
  
  return {
    markdown,
    images: images.map(img => ({ url: img.url, filename: img.filename }))
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
