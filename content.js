window.addEventListener('load', function() {
    // Fetch the page source
    let pageSource = document.documentElement.outerHTML;
  
    // Search for the first occurrence of "fsd_company:" followed by a value until the first quote
    let regex = /fsd_company:\s*"([^"]+)"/;
    let match = pageSource.match(regex);
  
    // Fetch the company name from the <h1> tag with the specific id and class
    let companyElement = document.querySelector('h1[id="ember35"][class*="org-top-card-summary__title"]');
    let companyName = companyElement ? companyElement.getAttribute('title') : 'Unknown Company';
  
    if (match) {
      let companyId = match[1]; // Extract the company ID
      
      // Show a custom alert with the Company Id
      showCustomAlert(companyName, companyId);
    }
  });
  
  // Function to show a custom alert with the company details
  function showCustomAlert(companyName, companyId) {
    let alertContainer = document.createElement('div');
    alertContainer.style.position = 'fixed';
    alertContainer.style.top = '50%';
    alertContainer.style.left = '50%';
    alertContainer.style.transform = 'translate(-50%, -50%)';
    alertContainer.style.padding = '20px';
    alertContainer.style.backgroundColor = '#f9f9f9';
    alertContainer.style.border = '1px solid #ccc';
    alertContainer.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.1)';
    alertContainer.style.zIndex = '9999';
    alertContainer.style.width = '300px';
    
    let content = `
      <h3>Company Id</h3>
      <p><strong>Company Name:</strong> ${companyName}</p>
      <p><strong>Company Id:</strong> ${companyId}</p>
      <button id="sendToSheets">Send to Sheets</button>
    `;
    
    alertContainer.innerHTML = content;
    document.body.appendChild(alertContainer);
    
    // Send to Sheets button functionality
    document.getElementById('sendToSheets').addEventListener('click', function() {
      // Send data to Google Sheets
      sendDataToGoogleSheet(companyName, companyId);
    });
  }
  
  // Function to send data to Google Sheets API
  function sendDataToGoogleSheet(companyName, companyId) {
    // Replace with your Google Sheets API endpoint
    const sheetApiUrl = 'https://docs.google.com/spreadsheets/d/1f-MDapjwCo5MdN90eimuxsslHHY3VV3m5kG3reWV-fs/values/Visited_Companies:append?valueInputOption=USER_ENTERED';
    chrome.identity.getAuthToken({ interactive: true }, function(token) {
      fetch(sheetApiUrl, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: [[companyName, companyId]]
        })
      })
      .then(response => response.json())
      .then(data => console.log('Sheet updated', data))
      .catch(error => console.error('Sheet update error', error));
    });

    
    // Data to be sent to the Google Sheets
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
    .then(response => response.json())
    .then(data => {
      console.log('Data successfully added to Google Sheets:', data);
    })
    .catch(error => {
      console.error('Error adding data to Google Sheets:', error);
    });
  }
  