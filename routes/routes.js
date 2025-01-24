require('dotenv').config();
const express = require('express');
const axios = require('axios');

// This enables express router
const router = express.Router();

// Here we use axios to create an axios instance to connect our vrsctest node
// We use the .env file to store the user and password
const vrsc = axios.create({
  baseURL:"http://localhost:18843",
  auth: {
      username:process.env.VRSCTEST_RPC_USER,
      password:process.env.VRSCTEST_RPC_PASS
  }
});

// We then place the above instance within verusClient. Other chains can be added here also 
const verusClient = {
  vrsc,
};

exports.verusClient = verusClient

// Helper function to make RPC calls
// The function waits for an RPC call and returns the result or an error
async function callRPC(method, params = []) {
    try {
        const response = await verusClient.vrsc.post('', {
            jsonrpc: '2.0',
            id: 1,
            method,
            params
        });
        return response.data.result || { error: response.data.error };
    } catch (error) {
        console.error(colors.red(`Error calling RPC method ${method}:`), error.message);
        return { error: error.message };
    }
};

// Example route
router.get('/api/example', (req, res) => {
    console.log('Example route accessed');
    res.json({ message: 'Example route is working!' });
});


// Get Verus Daemon info endpoint
router.get('/api/getinfo', async (req, res) => {
  const result = await callRPC('getinfo');
  if (result.error) {
    res.status(500).json({ error: result.error });
  } else {
    res.json(result);
    console.log(result)
  }
});

// Getmininginfo endpoint
router.get('/api/getmininginfo', async (req, res) => {
  const result = await callRPC('getmininginfo');
  if (result.error) {
    res.status(500).json({ error: result.error });
  } else {
    res.json(result);
    console.log(result)
  }
});

//List Currencies Route
router.get('/api/listcurrencies', async (req, res) => {
  const result = await callRPC('listcurrencies');
  if (result.error) {
    res.status(500).json({ error: result.error });
  } else {
    res.json(result);
    console.log(result)
  }
});

module.exports = router;