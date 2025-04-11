function waitForElement(selector, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const interval = 100;
    let elapsed = 0;

    const check = () => {
      const el = document.querySelector(selector);
      if (el) resolve(el);
      else if ((elapsed += interval) >= timeout) reject('Element not found');
      else setTimeout(check, interval);
    };

    check();
  });
}

window.addEventListener('load', async function () {
  try {
    // 1. Wait for dynamically loaded company name
    const titleElement = await waitForElement('h1.org-top-card-summary__title');
    const companyName = titleElement.textContent.trim();

    // 2. Extract the company ID from outerHTML
    const html = document.documentElement.outerHTML;
    // const regex = "/fsd_company:(\d+)&quot;/";
    const regex = /fsd_company:\s*(\S+)/;
    const match = html.match(regex);
    const companyId = match ? match[1].split('"')[0] : 'Not Found';

    // 3. Show simple alert with company info
    // alert(`Company Name: ${companyName}\nCompany ID: ${companyId}`);

    // // 4. Send data to Google Sheet
    // sendDataToGoogleSheet(companyName, companyId);

    // Send data to Google Sheets
    chrome.runtime.sendMessage({
      action: "sendToGoogleSheet",
      companyName: companyName,
      companyId: companyId
    });

  } catch (err) {
    console.error('❌ Error:', err);
  }
});

// // Function to send data to Google Sheet
// function sendDataToGoogleSheet(companyName, companyId) {
//   const spreadsheetId = '1f-MDapjwCo5MdN90eimuxsslHHY3VV3m5kG3reWV-fs';
//   const sheetName = 'Visited_Companies';
//   const sheetApiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}:append?valueInputOption=USER_ENTERED`;

//   chrome.identity.getAuthToken({ interactive: true }, function (token) {
//     if (!token) {
//       console.error('❌ OAuth token not available');
//       return;
//     }

//     const requestBody = {
//       values: [
//         [companyName, companyId]
//       ]
//     };

//     fetch(sheetApiUrl, {
//       method: 'POST',
//       headers: {
//         'Authorization': `Bearer ${token}`,
//         'Content-Type': 'application/json'
//       },
//       body: JSON.stringify(requestBody)
//     })
//     .then(response => response.json())
//     .then(data => {
//       console.log('✅ Data added to Google Sheets:', data);
//     })
//     .catch(error => {
//       console.error('❌ Error updating Google Sheets:', error);
//     });
//   });
// }
