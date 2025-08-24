const urlInput = document.getElementById('urlInput');
const scanButton = document.getElementById('scanButton');
const resultDiv = document.getElementById('result');

const API_URL = 'https://YOUR_VERCEL_URL/api/scan'; // This will need to be your deployed app's URL later

// Get current tab's URL and set it in the input
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  const currentTab = tabs[0];
  if (currentTab && currentTab.url) {
    // Avoid filling in chrome:// or other internal URLs
    if (currentTab.url.startsWith('http')) {
      urlInput.value = currentTab.url;
    }
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
            <div class="result-section">
                <p>${message}</p>
            </div>
        </div>
    `;
}

function displayResult(result) {
  const { riskLevel, reason, impersonatedBrand, recommendation } = result;
  
  let status, cardClass;

  if (riskLevel > 75) {
      status = 'Dangerous';
      cardClass = 'dangerous';
  } else if (riskLevel > 40) {
      status = 'Suspicious';
      cardClass = 'suspicious';
  } else if (riskLevel > 10) {
    status = 'Low Risk';
    cardClass = 'low-risk';
  } else {
      status = 'Safe';
      cardClass = 'safe';
  }
  
  let impersonatedHtml = '';
  if (impersonatedBrand) {
    impersonatedHtml = `
      <div class="result-section">
        <h4>Impersonated Brand</h4>
        <p>${impersonatedBrand}</p>
      </div>
    `;
  }

  resultDiv.innerHTML = `
    <div class="result-card ${cardClass}">
      <div class="result-header">
        <span>${status}</span>
        <span class="risk-score">${riskLevel}/100</span>
      </div>
      <div class="result-section">
        <h4>AI Analysis</h4>
        <p>${reason}</p>
      </div>
      ${impersonatedHtml}
      <div class="result-section recommendation">
        <h4>Recommendation</h4>
        <p>${recommendation}</p>
      </div>
    </div>
  `;
}
