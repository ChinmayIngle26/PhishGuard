
const DANGEROUS_RISK_THRESHOLD = 75;
const DEFAULT_APP_URL = 'https://phishguard-testapp.vercel.app';

let appUrl = DEFAULT_APP_URL;

// Load the saved URL from storage when the extension starts
chrome.storage.sync.get('appUrl', (data) => {
    if (data.appUrl) {
        appUrl = data.appUrl;
    }
});

// Listen for changes to the URL in storage
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'sync' && changes.appUrl) {
        appUrl = changes.appUrl.newValue;
        console.log('PhishGuard App URL updated to:', appUrl);
    }
});

chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
    // We only want to intercept top-level frame navigations
    if (details.frameId !== 0) {
        return;
    }

    const url = new URL(details.url);

    // Ignore internal chrome pages, localhost, and URLs with the override flag
    if (url.protocol.startsWith('chrome') || url.hostname === 'localhost' || url.searchParams.has('phishguard-override')) {
        return;
    }
    
    try {
        const apiUrl = `${appUrl}/api/scan`;
        const shieldPageUrl = `${appUrl}/shield`;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: details.url }),
        });

        if (!response.ok) {
            console.error(`PhishGuard API error: ${response.status}`);
            return; // Don't block if the API fails
        }

        const result = await response.json();

        if (result.riskLevel && result.riskLevel >= DANGEROUS_RISK_THRESHOLD) {
            const shieldUrl = `${shieldPageUrl}?url=${encodeURIComponent(details.url)}`;
            
            // Redirect the tab to the shield page
            chrome.tabs.update(details.tabId, { url: shieldUrl });
        }
    } catch (error) {
        console.error("PhishGuard: Failed to scan URL.", error);
        // If the local server isn't running or there's a network error,
        // we should let the navigation proceed.
    }
},
{
    // We specify the URL patterns we want to listen for.
    // This is more efficient than listening to all URLs.
    url: [{ schemes: ['http', 'https'] }]
});
