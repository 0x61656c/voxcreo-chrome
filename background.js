chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'submitToVoxcreo') {
    chrome.storage.sync.get(['submissionUrl'], function(data) {
      if (data.submissionUrl) {
        const submissionUrl = new URL(data.submissionUrl);
        
        fetch(submissionUrl.toString(), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: request.url,
            title: request.title
          })
        })
        .then(response => response.json())
        .then(result => {
          console.log('Submission result:', result);
          sendResponse({status: 'success', result: result});
        })
        .catch(error => {
          console.error('Error submitting to Voxcreo:', error);
          sendResponse({status: 'error', message: error.toString()});
        });
      } else {
        sendResponse({status: 'error', message: 'Missing submission URL'});
      }
    });
    return true; // Indicates that the response is sent asynchronously
  }
});
