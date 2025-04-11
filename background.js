// Background script for Microsoft Edge Extension

import config from './config.js';
// Configuration
const CLIENT_ID = config.GOOGLE_CLIENT_ID; // Replace with your actual client ID
const SPREADSHEET_ID = config.GOOGLE_SPREADSHEET_ID; // Replace with your actual spreadsheet ID
const SHEET_NAME = config.GOOGLE_SHEET_NAME // Default sheet name
const SCOPES = chrome.runtime.getManifest().oauth2.scopes; // Replace with your actual scopes

// Install listener
chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed and running!");
});

// Main function to get OAuth token
function getOAuthToken(callback) {
  console.log("Attempting to get OAuth token...");
  
  // First try Edge's identity API if available
  if (typeof edge !== 'undefined' && edge.identity) {
    edge.identity.getAuthToken({ 
      interactive: true,
      scopes: SCOPES
    }, (token) => {
      if (edge.runtime.lastError) {
        console.error('Edge identity error:', edge.runtime.lastError);
        authenticateWithGoogle(callback);
        return;
      }
      callback(token);
    });
  } 
  // If neither API is available, use web auth flow
  else {
    authenticateWithGoogle(callback);
  }
}

// Web authentication fallback
function authenticateWithGoogle(callback) {
  const redirectUrl = chrome.identity.getRedirectURL();
  console.log("Using redirect URL:", redirectUrl);
  
  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authUrl.searchParams.set('response_type', 'token');
  authUrl.searchParams.set('client_id', CLIENT_ID);
  authUrl.searchParams.set('redirect_uri', redirectUrl);
  authUrl.searchParams.set('scope', SCOPES.join(' '));
  
  chrome.identity.launchWebAuthFlow({
    url: authUrl.toString(),
    interactive: true
  }, (responseUrl) => {
    if (chrome.runtime.lastError) {
      console.error('Web auth flow error:', chrome.runtime.lastError);
      return;
    }
    
    if (responseUrl) {
      const url = new URL(responseUrl);
      const params = new URLSearchParams(url.hash.slice(1));
      const accessToken = params.get('access_token');
      
      if (accessToken) {
        console.log('Successfully obtained access token');
        callback(accessToken);
      } else {
        console.error('Access token not found in response');
      }
    }
  });
}

// Function to send data to Google Sheets
function sendDataToGoogleSheet(companyName, companyId) {
  getOAuthToken((token) => {
    if (!token) {
      console.error('❌ OAuth token not available');
      return;
    }

    const sheetApiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}:append?valueInputOption=USER_ENTERED`;

    const requestBody = {
        values: [
        [companyName, companyId]
        ]
    };

    fetch(sheetApiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })
    .then(response => {
      if (!response.ok) {
        return response.json().then(err => { throw err; });
      }
      return response.json();
    })
    .then(data => {
      console.log('✅ Data added to Google Sheets:', data);
    })
    .catch(error => {
      console.error('❌ Error updating Google Sheets:', error);
      if (error.error && error.error.code === 401) {
        // Remove cached token and retry
        if (typeof edge !== 'undefined' && edge.identity) {
          edge.identity.removeCachedAuthToken({ token }, () => {
            sendDataToGoogleSheet(companyName, companyId);
          });
        }
      }
    });
  });
}

// Message listener
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "sendToGoogleSheet") {
    const { companyName, companyId } = message;
    sendDataToGoogleSheet(companyName, companyId);
    sendResponse({ status: 'processing' });
  }
  return true;
});