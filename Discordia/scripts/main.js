const { app, BrowserWindow, ipcMain } = require('electron');


function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  win.loadFile('C:/Users/LukasPC/Documents/Github/Discordia/Discordia/index.html');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});


/////////////////////////////////////////////////////////////////////////////////////
// MongoDB Code
const { MongoClient } = require('mongodb');

// Connection URL
const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);

// Database Name
const dbName = 'DiscordiaDB';

async function main() {
  // Use connect method to connect to the server
  await client.connect();
  console.log('Connected successfully to server');
  const db = client.db(dbName);

  // Get the collections
  const users = db.collection('users');
  const servers = db.collection('servers');
  const messages = db.collection('messages');

  // Example: Insert a document into the users collection
  const insertResult = await users.insertOne({ name: "John Doe", email: "john@example.com" });
  console.log('Inserted document into the users collection', insertResult);

  // Example: Find a document in the users collection
  const findResult = await users.findOne({ name: "John Doe" });
  console.log('Found document', findResult);

  // Close connection
  await client.close();
}

main().catch(console.error);

