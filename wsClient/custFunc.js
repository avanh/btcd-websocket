/* eslint-disable no-await-in-loop */
/* eslint-disable comma-dangle */
const axiosPostConfig = require('../config/axiosPost');

const { axiosPost } = axiosPostConfig;

async function getBlockLoop(client, request, k, hash) {
  const data = [];
  for (let i = 0; i < k; i += 1) {
    await axiosPost(request.id, 'getblock', [hash])
      .then((response) => {
        hash = response.data.result.previousblockhash;
        data.push(response.data.result);
      }).catch(() => {
        const error = { error: 'BTC RPC error' };
        client.send(JSON.stringify(error));
      });
  }
  const result = {
    jsonrpc: '1.0',
    id: `${request.id}`,
    method: request.method,
    error: null,
    result: data.sort((a, b) => b.height - a.height)
  };
  client.send(JSON.stringify(result));
}

function getTenBlocks(client, request) {
  axiosPost(request.id, 'getblockcount', [])
    .then((gbcResponse) => {
      const offset = +gbcResponse.data.result - ((+request.params[0] - 1) * +request.params[1]);
      axiosPost(request.id, 'getblockhash', [offset])
        .then((gbhResponse) => {
          if (offset < 10) {
            getBlockLoop(client, request, offset + 1, gbhResponse.data.result);
          } else {
            getBlockLoop(client, request, 10, gbhResponse.data.result);
          }
        })
        .catch(() => {
          const error = { error: 'BTC RPC error' };
          client.send(JSON.stringify(error));
        });
    })
    .catch(() => {
      const error = { error: 'BTC RPC error' };
      client.send(JSON.stringify(error));
    });
}

function getBlockByHeight(client, request) {
  axiosPost(request.id, 'getblockhash', request.params)
    .then((gbhResponse) => {
      axiosPost(request.id, 'getblock', [gbhResponse.data.result])
        .then((gbResponse) => {
          client.send(JSON.stringify(gbResponse.data));
        })
        .catch(() => {
          const error = { error: 'BTC RPC error' };
          client.send(JSON.stringify(error));
        });
    })
    .catch(() => {
      const error = { error: 'BTC RPC error' };
      client.send(JSON.stringify(error));
    });
}

function getLastTenBlocks(client, request) {
  axiosPost(request.id, 'getbestblockhash', [])
    .then((response) => {
      getBlockLoop(client, request, 10, response.data.result);
    }).catch(() => {
      const error = { error: 'BTC RPC error' };
      client.send(JSON.stringify(error));
    });
}

function customCommand(client, request) {
  if (request.method === 'getlasttenblocks') {
    getLastTenBlocks(client, request);
  } else if (request.method === 'getblockbyheight') {
    getBlockByHeight(client, request);
  } else if (request.method === 'gettenblocks') {
    getTenBlocks(client, request);
  }
}

exports.custFunc = customCommand;
