const axios = require('axios').default;
const dotenv = require('dotenv');

dotenv.config();

const btcurl = `https://${process.env.BTCD_URL}`;
const user = process.env.RPC_USER;
const password = process.env.RPC_PASSWORD;

async function axiosPost(id, method, param) {
  const config = {
    method: 'post',
    url: `${btcurl}`,
    headers: {
      'content-type': 'text/plain;',
    },
    auth: {
      username: `${user}`,
      password: `${password}`,
    },
    data: {
      jsonrpc: '1.0',
      id: `${id}`,
      method: `${method}`,
      params: param,
    }
  };
  try {
    const response = await axios(config);
    return response;
  } catch (error) {
    console.log(error);
    return error;
  }
}

exports.axiosPost = axiosPost;
