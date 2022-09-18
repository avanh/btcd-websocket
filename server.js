const fs = require('fs');
const WebSocket = require('ws');
const WebSocketServer = require('ws');
const dotenv = require('dotenv');
const throttledQueue = require('throttled-queue');
const wsFunction = require('./wsClient/wsClient');

const { cmdReceived } = wsFunction;

dotenv.config();

// Limit commands across the ws to 5 per 1 sec
const throttle = throttledQueue(5, 1000, true);
const btcwss = `wss://${process.env.BTCD_URL}/ws`;

// Websocket Server
const wss = new WebSocketServer.Server({ port: 5011 });

wss.on('connection', (ws) => {
  ws.on('message', (data) => {
    throttle(() => {
      cmdReceived(ws, data);
    });
  });
});
wss.on('error', (error) => {
  console.log(`ERROR:${error}`);
});

// Load the LND RPC cert and user/pass needed for connection to RPC
const cert = fs.readFileSync('rpc.cert');
const user = process.env.RPC_USER;
const password = process.env.RPC_PASSWORD;
// Required because rpc.cert is self-signed
process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

// Broadcast message to all connected clients
function wssBroadcast(msg) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(msg);
    }
  });
}

// Initiating ws connection to BTCD node
const ws = new WebSocket(btcwss, {
  headers: {
    Authorization: `Basic ${new Buffer.from(`${user}:${password}`).toString('base64')}`,
  },
  cert,
  ca: [cert],
});
ws.on('open', () => {
  console.log('CONNECTED');
  // Sending RPC command to be notified on any new blocks
  ws.send('{"jsonrpc":"1.0","id":"0","method":"notifyblocks","params":[]}');
});
// Inbound message from BTCD node will be new block notification
ws.on('message', (data) => {
  const jData = JSON.parse(data);
  wssBroadcast(JSON.stringify(jData));
});
ws.on('error', (error) => {
  console.log(`ERROR:${error}`);
});
