chrome.runtime.onInstalled.addListener(() => {
    chrome.identity.getAuthToken({ interactive: true }, (token) => {
      console.log("OAuth token:", token);
      // You can now use this token to call Google Sheets API
    });
  });
  