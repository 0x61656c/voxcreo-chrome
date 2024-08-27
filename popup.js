document.addEventListener('DOMContentLoaded', function() {
  const settingsForm = document.getElementById('settingsForm');
  const submissionControls = document.getElementById('submissionControls');
  const currentSettings = document.getElementById('currentSettings');
  const submissionUrlInput = document.getElementById('submissionUrl');
  const saveSettingsButton = document.getElementById('saveSettings');
  const editSettingsButton = document.getElementById('editSettings');
  const submitButton = document.getElementById('submitToVoxcreo');
  const statusMessage = document.getElementById('statusMessage');

  function showStatus(message, type = 'info') {
    statusMessage.textContent = message;
    statusMessage.className = `alert mt-3 alert-${type}`;
    statusMessage.classList.remove('hidden');
    setTimeout(() => {
      statusMessage.classList.add('hidden');
    }, 3000);
  }

  function updateUI(settings) {
    console.log('Updating UI with settings:', settings);
    
    if (!settingsForm || !submissionControls || !currentSettings || !submissionUrlInput || !submitButton) {
      console.error('One or more UI elements not found');
      return;
    }

    if (settings.submissionUrl) {
      console.log('Submission URL exists, hiding settings form');
      settingsForm.style.display = 'none';
      submissionControls.style.display = 'block';
      currentSettings.textContent = `URL: ${settings.submissionUrl.substring(0, 20)}...`;
      submissionUrlInput.style.display = 'none';
      
      if (isValidUrl(settings.submissionUrl)) {
        console.log('Valid URL, showing submit button');
        submitButton.style.display = 'block';
      } else {
        console.log('Invalid URL, hiding submit button');
        submitButton.style.display = 'none';
      }
    } else {
      console.log('No submission URL, showing settings form');
      settingsForm.style.display = 'block';
      submissionControls.style.display = 'none';
      submitButton.style.display = 'none';
      submissionUrlInput.style.display = 'block';
    }
    
    console.log('UI update complete');
  }

  function isValidUrl(string) {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  }

  // Load saved settings
  chrome.storage.sync.get(['submissionUrl'], function(data) {
    if (data.submissionUrl) submissionUrlInput.value = data.submissionUrl;
    updateUI(data);
  });

  // Save settings
  saveSettingsButton.addEventListener('click', function() {
    const settings = {
      submissionUrl: submissionUrlInput.value.trim()
    };

    console.log('Saving settings:', settings);

    if (!settings.submissionUrl) {
      showStatus('Please fill in the submission URL', 'danger');
      return;
    }

    if (!isValidUrl(settings.submissionUrl)) {
      showStatus('Please enter a valid URL', 'danger');
      return;
    }

    chrome.storage.sync.set(settings, function() {
      console.log('Settings saved, updating UI');
      updateUI(settings);
      showStatus('Settings saved successfully', 'success');
    });
  });

  // Edit settings
  editSettingsButton.addEventListener('click', function() {
    console.log('Edit button clicked');
    settingsForm.style.display = 'block';
    submissionControls.style.display = 'none';
    submissionUrlInput.style.display = 'block';
    
    // Retrieve the current URL from storage and set it in the input field
    chrome.storage.sync.get(['submissionUrl'], function(data) {
      if (data.submissionUrl) {
        submissionUrlInput.value = data.submissionUrl;
        console.log('Loaded existing URL:', data.submissionUrl);
      }
    });
  });

  // Submit to Voxcreo
  submitButton.addEventListener('click', function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      const currentUrl = tabs[0].url;
      const currentTitle = tabs[0].title;
      chrome.runtime.sendMessage({
        action: 'submitToVoxcreo',
        url: currentUrl,
        title: currentTitle
      }, function(response) {
        if (response && response.status === 'success') {
          showStatus('Submitted successfully', 'success');
        } else {
          showStatus('Submission failed', 'danger');
        }
      });
    });
  });
});
