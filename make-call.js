// DOM Elements
const accountSidInput = document.getElementById('accountSid');
const authTokenInput = document.getElementById('authToken');
const twilioNumberInput = document.getElementById('twilioNumber');
const phoneNumberInput = document.getElementById('phoneNumber');
const pasteBtn = document.getElementById('pasteBtn');
const callBtn = document.getElementById('callBtn');
const errorDisplay = document.getElementById('error');
const callStatus = document.getElementById('callStatus');

// Twilio Device
let device;
let activeCall;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  // Load saved credentials (if any)
  loadCredentials();
});

// --- Core Functions ---

// 1. Paste Phone Number
pasteBtn.addEventListener('click', async () => {
  try {
    const text = await navigator.clipboard.readText();
    phoneNumberInput.value = formatPhoneNumber(text);
    validateForm();
  } catch (err) {
    showError("Couldn't paste. Please paste manually.");
  }
});

// 2. Start/End Call
callBtn.addEventListener('click', async () => {
  if (activeCall) {
    endCall();
  } else {
    await startCall();
  }
});

// 3. Save Credentials on Input
[accountSidInput, authTokenInput, twilioNumberInput].forEach(input => {
  input.addEventListener('input', () => {
    saveCredentials();
    validateForm();
  });
});

// --- Twilio Voice Functions ---

async function startCall() {
  try {
    showError("");
    callBtn.disabled = true;
    callBtn.textContent = "Connecting...";
    
    // Initialize Twilio Device if not already done
    if (!device) {
      await setupTwilioDevice();
    }

    // Start the call
    activeCall = device.connect({
      params: {
        To: phoneNumberInput.value,
        From: twilioNumberInput.value
      }
    });

    updateCallStatus("Calling...");

    activeCall.on('accept', () => {
      updateCallStatus("Call connected - speak now!");
      callBtn.textContent = "☎️ End Call";
      callBtn.disabled = false;
    });

    activeCall.on('disconnect', () => {
      endCall();
    });

    activeCall.on('error', (error) => {
      showError(`Call failed: ${error.message}`);
      endCall();
    });

  } catch (error) {
    showError(`Error: ${error.message}`);
    endCall();
  }
}

function endCall() {
  if (activeCall) {
    activeCall.disconnect();
  }
  resetCallUI();
}

function resetCallUI() {
  activeCall = null;
  callBtn.textContent = "📞 Start Call";
  callBtn.disabled = !isFormValid();
  updateCallStatus("");
}

async function setupTwilioDevice() {
  const response = await fetch('/.netlify/functions/get-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      accountSid: accountSidInput.value,
      authToken: authTokenInput.value
    })
  });

  const { token, identity } = await response.json();

  device = new Twilio.Device(token, {
    codecPreferences: ['opus', 'pcmu'],
    logLevel: 1
  });

  device.on('ready', () => {
    console.log("Twilio Device Ready");
  });

  device.on('error', (error) => {
    showError(`Device error: ${error.message}`);
  });

  // Optional: Handle incoming calls
  device.on('incoming', call => {
    call.reject(); // We're only making outbound calls
  });
}

// --- Helper Functions ---

function validateForm() {
  callBtn.disabled = !isFormValid();
}

function isFormValid() {
  return (
    accountSidInput.value.startsWith('AC') &&
    authTokenInput.value.length > 30 &&
    twilioNumberInput.value.startsWith('+') &&
    phoneNumberInput.value.startsWith('+')
  );
}

function formatPhoneNumber(num) {
  return '+' + num.replace(/\D/g, '').slice(0, 15);
}

function showError(message) {
  errorDisplay.textContent = message;
  errorDisplay.style.display = message ? 'block' : 'none';
}

function updateCallStatus(message) {
  callStatus.textContent = message;
  callStatus.style.display = message ? 'block' : 'none';
}

// Local storage for credentials
function saveCredentials() {
  const credentials = {
    accountSid: accountSidInput.value,
    authToken: authTokenInput.value,
    twilioNumber: twilioNumberInput.value
  };
  localStorage.setItem('twilioCredentials', JSON.stringify(credentials));
}

function loadCredentials() {
  const saved = JSON.parse(localStorage.getItem('twilioCredentials'));
  if (saved) {
    accountSidInput.value = saved.accountSid || '';
    authTokenInput.value = saved.authToken || '';
    twilioNumberInput.value = saved.twilioNumber || '';
    validateForm();
  }
}
