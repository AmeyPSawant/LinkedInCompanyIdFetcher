window.addEventListener('load', function() {
    // Fetch the page source
    let pageSource = document.documentElement.outerHTML;
  
    // Search for the first occurrence of "fsd_company:"
    let regex = /fsd_company:\s*(\S+)/;
    let match = pageSource.match(regex);
  
    if (match) {
      // The value of "fsd_company:" is in match[1]
      alert('fsd_company value: ' + match[1]);
    }
  });
  