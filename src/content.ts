// Content script that runs on web pages
console.log('Markdown extension content script loaded');

// Function to convert HTML to Markdown
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
  
  // Process links
  const links = element.querySelectorAll('a');
  links.forEach(link => {
    const text = link.textContent?.trim() || '';
    const href = link.getAttribute('href') || '';
    if (text && href) {
      // Replace inline links in the markdown
      const markdownLink = `[${text}](${href})`;
      // This is a simplified approach - in a real implementation you'd need to
      // replace the actual link in the context of the surrounding text
    }
  });
  
  return markdown;
}

// Function to collect all images from the page
function collectImages(): { url: string, filename: string, element: HTMLImageElement }[] {
  const images: { url: string, filename: string, element: HTMLImageElement }[] = [];
  const imgElements = document.querySelectorAll('img');
  
  imgElements.forEach((img, index) => {
    const src = img.src;
    if (src) {
      // Create a filename from the image URL
      let filename = src.split('/').pop() || `image_${index}.jpg`;
      // Clean up the filename
      filename = filename.split('?')[0]; // Remove query parameters
      if (!filename.includes('.')) {
        filename += '.jpg'; // Add extension if missing
      }
      
      images.push({
        url: src,
        filename: `images/${filename}`,
        element: img
      });
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
  
  // Replace image references in the markdown
  images.forEach(image => {
    const imgElement = image.element;
    const altText = imgElement.alt || 'image';
    const markdownImgRef = `![${altText}](${image.filename})`;
    
    // In a real implementation, you'd need to find where this image appears
    // in the content and replace it with the markdown reference
    markdown += `\n${markdownImgRef}\n`;
  });
  
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
