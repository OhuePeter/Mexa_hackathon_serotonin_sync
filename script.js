// script.js
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
const sendButton = document.getElementById('send-button');
const messageInput = document.getElementById('message-input');
const chatArea = document.getElementById('chat-area');
const targetLanguageSelect = document.getElementById('target-language');
const faceRecButton = document.getElementById('face-rec-button');
const faceRecResults = document.getElementById('face-rec-results');

// Mobile Navigation Toggle
menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});

// Translation Function
async function translateText(text, targetLanguage) {
    try {
        const response = await fetch('/api/translate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text: text, target_language: targetLanguage })
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Translation failed: ${response.status} - ${errorData.error || response.statusText}`);
        }
        const data = await response.json();
        return data.translated_text;
    } catch (error) {
        console.error("Translation error:", error);
        return "Translation failed.";
    }
}

// Chatbot Functionality
if (sendButton && messageInput && chatArea && targetLanguageSelect) { // Check if elements exist
    sendButton.addEventListener('click', async () => {
        const message = messageInput.value.trim();
        if (message !== "") {
            chatArea.innerHTML += `<div class="message">You: ${message}</div>`;
            messageInput.value = '';
            chatArea.scrollTop = chatArea.scrollHeight;

            try {
                const translatedMessage = await translateText(message, targetLanguageSelect.value);
                chatArea.innerHTML += `<div class="message translated">Translated: ${translatedMessage}</div>`;
            } catch (error) {
                console.error("Translation error:", error);
                chatArea.innerHTML += `<div class="error">Translation failed.</div>`;
            }
        }
    });
}

// Face Recognition Functionality (Placeholder)
if (faceRecButton && faceRecResults) { // Check if elements exist
    faceRecButton.addEventListener('click', async () => {
        faceRecResults.textContent = "Analyzing face... (This is a placeholder)";
        try {
            // In a real app, capture image and send it here
            const response = await fetch('/api/analyze_face', {
                method: 'POST',
                // Include image data in the request (FormData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Face analysis failed: ${response.status} - ${errorData.error || response.statusText}`);
            }

            const data = await response.json();
            faceRecResults.textContent = JSON.stringify(data); // Display backend response
        } catch (error) {
            console.error("Face Analysis Error:", error);
            faceRecResults.textContent = `Face analysis failed: ${error.message}`;
        }
    });
}


// Function to handle smooth scrolling to sections (if needed later)
function scrollToSection(id) {
    const element = document.getElementById(id);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
}

// Add event listeners for navigation if you want smooth scrolling
// Example:
// document.querySelector('a[href="#features"]').addEventListener('click', function(e) {
//     e.preventDefault();
//     scrollToSection('features');
// });





// Face Recognition
const faceRecButton = document.getElementById('face-rec-button');
const faceRecResults = document.getElementById('face-rec-results');

faceRecButton.addEventListener('click', async () => {
    const imageInput = document.createElement('input');
    imageInput.type = 'file';
    imageInput.accept = 'image/*'; // Accept only images

    imageInput.addEventListener('change', async (event) => {
        const file = event.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onloadend = async () => {
            const base64String = reader.result.split(',')[1];
            faceRecResults.textContent = "Analyzing face...";
            try {
              const response = await fetch('/api/analyze_face', {
                  method: 'POST',
                  body: new URLSearchParams({ 'image': base64String})
              });
              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }
              const data = await response.json();
              faceRecResults.textContent = JSON.stringify(data);
            } catch (error) {
              console.error("Face Analysis Error:", error);
              faceRecResults.textContent = `Face analysis failed: ${error.message}`;
            }
          };
          reader.readAsDataURL(file);
        }
    });

    imageInput.click(); // Programmatically open file selection dialog
});

// Speech Recognition
const speechRecognition = new webkitSpeechRecognition() || new SpeechRecognition();
speechRecognition.continuous = false;
speechRecognition.lang = 'en-US';

const speechButton = document.createElement('button');
speechButton.textContent = 'Start Speech Recognition';
document.getElementById('chatbot-feature').appendChild(speechButton);

speechButton.addEventListener('click', () => {
  speechRecognition.start();
});

speechRecognition.onresult = async (event) => {
  const transcript = event.results[0][0].transcript;
  try {
    const formData = new FormData();
    const blob = new Blob([event.results[0][0].transcript], { type: "text/plain"});
    formData.append('audio', blob, 'audio.wav');

    const response = await fetch('/api/recognize_speech', {
      method: 'POST',
      body: formData
    });
    const data = await response.json();
    if(data.transcript){
      messageInput.value = data.transcript;
    } else {
      console.log("no transcript")
    }
  } catch (error) {
    console.error("Speech Recognition Error:", error);
  }
};
speechRecognition.onerror = (event) => {
    console.error("Speech recognition error:", event.error);
};
