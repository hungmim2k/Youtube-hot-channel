// Simple content functionality
let data = null;

document.addEventListener('DOMContentLoaded', function() {
  // Try to get the content-data element
  let contentData = document.getElementById('content-data');

  // Create the element if it doesn't exist
  if (!contentData) {
    contentData = document.createElement('div');
    contentData.id = 'content-data';
    contentData.style.display = 'none';
    document.body.appendChild(contentData);

    // Create a data property on the element
    contentData.data = {};
    console.log('Content data element created');
  }

  // Safely access data
  if (contentData.data) {
    data = contentData.data;
  } else {
    // If the element exists but has no data property, create one
    contentData.data = {};
    data = contentData.data;
    console.log('Content data property created');
  }
});

// Function to handle data processing
async function processData() {
  try {
    if (data) {
      // Process data here
      return data;
    } else {
      throw new Error('Data is null');
    }
  } catch (error) {
    console.error('http:error', error);
    console.error('content/content.js -> error::', error);
    return null;
  }
}

// Export for use in other modules
export { processData };
