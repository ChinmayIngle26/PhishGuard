const urlInput = document.getElementById('urlInput');
const scanButton = document.getElementById('scanButton');
const resultDiv = document.getElementById('result');

const API_URL = 'http://localhost:9002/api/scan'; // This will need to be your deployed app's URL later

// Get current tab's URL and set it in the input
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  const currentTab = tabs[0];
  if (currentTab && currentTab.url) {
    urlInput.value = currentTab.url;
  }
});

scanButton.addEventListener('click', async () => {
  const urlToScan = urlInput.value;
  if (!urlToScan || !urlToScan.startsWith('http')) {
    displayError('Please enter a valid URL.');
    return;
  }

  setLoadingState(true);

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: urlToScan }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    displayResult(result);
  } catch (error) {
    console.error('Error scanning URL:', error);
    displayError(`An error occurred: ${error.message}`);
  } finally {
    setLoadingState(false);
  }
});

function setLoadingState(isLoading) {
  scanButton.disabled = isLoading;
  if (isLoading) {
    scanButton.textContent = 'Scanning...';
    resultDiv.innerHTML = '<div class="loader">Analyzing URL...</div>';
  } else {
    scanButton.textContent = 'Scan';
  }
}

function displayError(message) {
    resultDiv.innerHTML = `
        <div class="result-card dangerous">
            <div class="result-header">Error</div>
            <p>${message}</p>
        </div>
    `;
}

function displayResult(result) {
  const { isPhishing, confidence, reason } = result;
  
  let status, cardClass, icon;

  if (isPhishing) {
    if (confidence >= 0.75) {
      status = 'Dangerous';
      cardClass = 'dangerous';
    } else {
      status = 'Suspicious';
      cardClass = 'suspicious';
    }
  } else {
    status = 'Safe';
    cardClass = 'safe';
  }
  
  resultDiv.innerHTML = `
    <div class="result-card ${cardClass}">
      <div class="result-header">${status}</div>
      <p class="result-reason">${reason}</p>
    </div>
  `;
}
