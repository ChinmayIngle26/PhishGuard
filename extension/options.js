
const urlInput = document.getElementById('urlInput');
const saveButton = document.getElementById('saveButton');
const statusDiv = document.getElementById('status');

const DEFAULT_APP_URL = 'https://phishguard-testapp.vercel.app';

// Load the saved URL and display it in the input
function restoreOptions() {
  chrome.storage.sync.get({
    appUrl: DEFAULT_APP_URL 
  }, (items) => {
    urlInput.value = items.appUrl;
  });
}

// Save the URL to chrome.storage
function saveOptions() {
  let url = urlInput.value;

  // Basic validation to ensure it's a valid-looking URL
  try {
    const urlObject = new URL(url);
    if (urlObject.protocol !== 'https:' && urlObject.protocol !== 'http:') {
        throw new Error('Invalid protocol.');
    }
    // Remove trailing slash if present
    url = url.endsWith('/') ? url.slice(0, -1) : url;

  } catch (e) {
    statusDiv.textContent = 'Error: Please enter a valid URL (e.g., https://example.com)';
    statusDiv.classList.remove('success');
    return;
  }
  
  chrome.storage.sync.set({
    appUrl: url
  }, () => {
    // Update status to let user know options were saved.
    statusDiv.textContent = 'Options saved.';
    statusDiv.classList.add('success');
    setTimeout(() => {
      statusDiv.textContent = '';
      statusDiv.classList.remove('success');
    }, 1500);
  });
}

document.addEventListener('DOMContentLoaded', restoreOptions);
saveButton.addEventListener('click', saveOptions);
