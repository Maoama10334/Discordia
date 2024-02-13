const { ipcRenderer } = require('electron');
const fs = require('fs');
let currentServer = '1'; // Default to '1'
const chatMessages = document.querySelector('#chat-messages');
const messageInput = document.getElementById('message-input');
const imageInput = document.getElementById('image-input');
const sendButton = document.getElementById('send-button');

// Load previous messages from storage
document.addEventListener('DOMContentLoaded', () => {
  // Get the server icons
  const serverIcons = document.querySelectorAll('.server-icon');

  // Add event listeners to the server icons
  serverIcons.forEach(icon => {
    icon.addEventListener('click', function() {
      chatMessages.innerHTML = '';
      currentServer = this.dataset.server;
      loadMessages(`messages${currentServer}.json`);
    });
  });
});

// Function to load messages from storage
function loadMessages(filename) {
  fs.readFile(filename, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return;
    }
    const messages = JSON.parse(data);
    messages.forEach(message => {
      appendMessage(message);
    });
    chatMessages.scrollTop = chatMessages.scrollHeight;
  });
}

// Function to append a message to the chat interface
function appendMessage(message) {
  const messageElement = document.createElement('div');
  messageElement.classList.add('message');

  const profilePicElement = document.createElement('img');
  profilePicElement.src = 'Screenshot_9.png'; // Replace with the path to your profile picture
  profilePicElement.classList.add('profile-pic');
  messageElement.appendChild(profilePicElement);

  const messageContentElement = document.createElement('div');
  messageContentElement.classList.add('message-content');

  let contentElement;
  if (message.content.endsWith('.png') || message.content.endsWith('.jpg') || message.content.endsWith('.jpeg')){
    // If the message content is a Data URL of an image, create an img element
    contentElement = document.createElement('img');
    contentElement.src = message.content;
    contentElement.classList.add('message-image');
    contentElement.width = 500; // Limit the initial width
    contentElement.height = 500; // Limit the initial height
    contentElement.style.objectFit = 'cover'; // Ensure the aspect ratio is maintained
    contentElement.onclick = function() {
      // When the image is clicked, increase the size to 70% of the original size
      this.width = this.naturalWidth * 0.7;
      this.height = this.naturalHeight * 0.7;
    };
    contentElement.ondblclick = function() {
      // When the image is double-clicked, reset the size
      this.width = 500;
      this.height = 500;
    };
  } else if (message.content.endsWith('.mp4') || message.content.endsWith('.mov')) {
    // If the message content is a Data URL of a video, create a video element
    contentElement = document.createElement('video');
    contentElement.src = message.content;
    contentElement.controls = true;
    contentElement.width = 400; // Limit the initial width
    contentElement.height = 400; // Limit the initial height
    contentElement.style.objectFit = 'cover'; // Ensure the aspect ratio is maintained
    contentElement.onclick = function() {
      // When the video is clicked, play or pause it
      if (this.paused) {
        this.play();
      } else {
        this.pause();
      }
    };
  } else {
    // Otherwise, create a div
    contentElement = document.createElement('div');
    contentElement.textContent = message.content;
  }

  const timestampElement = document.createElement('div');
  timestampElement.classList.add('message-timestamp');
  timestampElement.textContent = formatTimestamp(message.timestamp);

  messageElement.appendChild(contentElement);
  messageElement.appendChild(timestampElement);

  messageElement.appendChild(messageContentElement);

  chatMessages.appendChild(messageElement);
}

// Function to format timestamp as HH:MM:SS
function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

// Function to handle sending a message
function sendMessage() {
  console.log('sendMessage called'); // Add this line
  const content = messageInput.value.trim();
  if (content === '') return;

  const timestamp = Date.now();
  const message = { content, timestamp };

  console.log('Appending message'); // Add this line
  appendMessage(message); // Append the message immediately

  console.log('Saving message'); // Add this line
  saveMessage(message);

  messageInput.value = '';
  messageInput.focus();

}



// Function to save a message to storage
function saveMessage(message) {
  console.log('saveMessage called with', message); // Add this line
  fs.readFile(`messages${currentServer}.json`, 'utf8', (err, data) => {
    let messages = [];
    if (!err) {
      messages = JSON.parse(data);
    }
    messages.push(message);
    fs.writeFile(`messages${currentServer}.json`, JSON.stringify(messages), err => {
      if (err) {
        console.error(err);
        return;
      }
    });
  });
}

// Event listener for the send button
sendButton.addEventListener('click', sendMessage);

// Event listener for the image input
imageInput.addEventListener('change', () => {
  const file = imageInput.files[0];
  const reader = new FileReader();
  reader.onload = () => {
    // Generate a unique filename for the video file
    const filename = `${Date.now()}.${file.type.split('/')[1]}`;
    // Write the video file to disk
    fs.writeFile(filename, new Buffer.from(reader.result), err => {
      if (err) {
        console.error('An error occurred while writing the file:', err);
        return;
      }
      // Use the file path as the message content
      const content = filename;
      const timestamp = Date.now();
      const message = { content, timestamp };
      appendMessage(message);
      saveMessage(message);
    });
  };
  reader.onerror = () => {
    console.error('An error occurred while reading the file:', reader.error);
  };
  reader.readAsArrayBuffer(file); // Read the file as an ArrayBuffer
});

// Event listener for pressing Enter in the message input
messageInput.addEventListener('keypress', event => {
  if (event.key === 'Enter') {
    sendMessage();
  }
});

const observer = new MutationObserver(() => {
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Start observing the #chat-messages container for child list changes
observer.observe(chatMessages, { childList: true });
