// Simple share modal functionality
document.addEventListener('DOMContentLoaded', function() {
  try {
    // Create the share button if it doesn't exist
    let shareButton = document.getElementById('share-button');
    if (!shareButton) {
      // Create a share button and add it to the DOM
      shareButton = document.createElement('button');
      shareButton.id = 'share-button';
      shareButton.textContent = 'Share';
      shareButton.className = 'hidden'; // Hide it with CSS
      document.body.appendChild(shareButton);
      console.log('Share button created');
    }

    // Add event listener to the button
    shareButton.addEventListener('click', function() {
      // Share functionality would go here
      console.log('Share button clicked');
    });
  } catch (error) {
    console.warn('Error in share-modal.js:', error);
  }
});
