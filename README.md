# BTCD Websocket  
Middleware for connecting to a [BTCD](https://github.com/btcsuite/btcd) node via websocket to get realtime block notifications as well as relaying supported RPC calls and returning the response over websocket.  

* [About](#About)
* [Requirements](#Requirements)
* [Use](#Use)
* [Formatting Commands](#Formatting-Commands)
* [Allowed Commands](#Allowed-Commands)
* [Custom Commands](#Custom-Commands)
  * [getblockbyheight](#getblockbyheight)
  * [getlasttenblocks](#getlasttenblocks)
* [Deployment](#Deployment)

## About  
Clients connect over websocket on port 5011 and can then send RPC commands over websocket. A websocket is established to the BTCD node to get realtime notifications of new blocks. All other RPC commands are done via HTTP JSON-RPC to the BTCD node and the responses are then sent back across websocket to the client.  
Any BTCD supported RPC command is able to be relayed through this by simply adding the RPC command to the `rpcCmd.js` file. If the command isn't listed in that file then it won't be relayed to the BTCD node. This enables you to define what RPC commands you want the users of this to have access to.  
There are custom commands defined as well that help to provide more specific data in order to offload multiple RPC calls and data procecssing from the client. This can be expanded by writing the function for the desired command and defining it in `custCmd.js`. 

## Requirements  
BTCD requires TLS for both the websocket and HTTP calls. In order to establish a websocket secure connection you'll need to provide the cert generated from BTCD for authentication. Read more about the rpc cert and BTCD authentication [here](https://github.com/btcsuite/btcd/blob/master/docs/json_rpc_api.md#Authentication)  
In order to use this you'll need to have your rpc.cert file included in the root of the directory when you run this or build a docker image from it.  

## Use  
Once deployed make a websocket connection to port 5011. New block notifications will be broadcast to all connected clients.  

## Formatting Commands  
All commands must be JSON formatted and follow the below structure:  
* `{ "id": "some ID", "method": "RPC command", "params": [] }`  

If the RPC command does not require parameters you must still send params with the empty array.  

## Allowed Commands  
Commands must be added to either rpcCmd.js or custCmd.js in order for the request to be relayed to the BTCD node, otherwise an error will be returned about the command not being found. Remove and commands from these files that you don't want clients to be able to run.  

## Custom Commands  
Right now there are two custom commands defined to provide some additional functionality. They are as follows:  

### getblockbyheight  
Query a block without needing to know it's hash first.
* `{ "id": "some ID", "method": "getblockbyheight", "params": [block number] }`  
* Performs `getblockhash` for the block number and then `getblock` on that hash
* Returns the result of `getblock`

### getlasttenblocks  
Returns the block data for the 10 most recent blocks
* `{ "id": "some ID", "method": "getlasttenblocks", "params": [] }`  
* Performs `getbestblockhash` and then `getblock` on the most recent block and then 9 previous blocks
* Returns an array of the `getblock` results for all 10 blocks

## Deployment  
As outlined above, you will need the rpc.cert from BTCD. You'll also need to have configured an RPC user and password. When running this you'll need to specify the below environment variables

### Environment Variables  
`BTCD_URL=BTCD_Address:PORT'`  
`RPC_USER=USER`  
`RPC_PASSWORD=PASS`  
