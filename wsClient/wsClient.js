/* eslint-disable comma-dangle */
const rpcCmd = require('./rpcCmd');
const custCmd = require('./custCmd');
const custFunctions = require('./custFunc');
const axiosPostConfig = require('../config/axiosPost');

const { axiosPost } = axiosPostConfig;
const { custFunc } = custFunctions;
const rpcOption = rpcCmd.dataOptions;
const custOption = custCmd.dataOptions;

function checkJSON(str) {
  try {
    return (JSON.parse(str));
  } catch (e) {
    return false;
  }
}

// After all verification send request to BTCD node
function sendRPC(client, request) {
  axiosPost(request.id, request.method, request.params)
    .then((response) => {
      client.send(JSON.stringify(response.data));
    }).catch(() => {
      const error = { error: 'BTC RPC error' };
      client.send(JSON.stringify(error));
    });
}

// Checking to see if requested method is supported
function checkMethod(client, request) {
  if (rpcOption.includes(request.method)) {
    sendRPC(client, request);
  } else if (custOption.includes(request.method)) {
    // Custom function send to custFunc.js
    custFunc(client, request);
  } else {
    const error = { error: 'Command Not Found' };
    client.send(JSON.stringify(error));
  }
}

// Checking if request is JSON and has required fields
function cmdReceived(client, request) {
  const jData = checkJSON(request);
  if (jData === false) {
    const error = { error: 'please send JSON formatted request' };
    client.send(JSON.stringify(error));
  } else if (
    Object.prototype.hasOwnProperty.call(jData, 'id')
    && Object.prototype.hasOwnProperty.call(jData, 'method')
    && Object.prototype.hasOwnProperty.call(jData, 'params')
  ) {
    checkMethod(client, jData);
  } else {
    const error = { error: 'id, method, params required' };
    client.send(JSON.stringify(error));
  }
}

exports.cmdReceived = cmdReceived;
