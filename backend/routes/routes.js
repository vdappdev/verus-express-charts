require('dotenv').config();
const express = require('express');
const axios = require('axios');

// This enables express router
const router = express.Router();

// Here we use axios to create an axios instance to connect our vrsc node
// We use the .env file to store the user and password
const vrsc = axios.create({
  baseURL:"https://api.verus.services/",
  auth: {
      username:process.env.VERUS_RPC_USER,
      password:process.env.VERUS_RPC_PASS
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
        console.error((`Error calling RPC method ${method}:`), error.message);
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

//List Currencies by name Route
router.get('/api/listcurrencynames', async (req, res) => {
  const result = await callRPC('listcurrencies');
  if (result.error) {
    res.status(500).json({ error: result.error });
  } else {
    const currencyNames = result.map(currency => currency.currencydefinition.name);
    res.json(currencyNames);
    console.log(currencyNames)
  }
});

//Current Block Height Route

router.get('/api/currentblockheight', async (req, res) => {
  const result = await callRPC('getmininginfo');
  if (result.error) {
    res.status(500).json({ error: result.error });
  } else {
    res.send(result.blocks.toString());
    console.log('Current block height:', result.blocks);
  }
});

//Stakingsupply Route
router.get('/api/stakingsupply', async (req, res) => {
  const result = await callRPC('getmininginfo');
  if (result.error) {
    res.status(500).json({ error: result.error });
  } else {
    res.json(result.stakingsupply);
    console.log(result.stakingsupply)
  }
});

//Blocks Route
router.get('/api/Blocks', async (req, res) => {
  const result = await callRPC('getmininginfo');
  if (result.error) {
    res.status(500).json({ error: result.error });
  } else {
    res.json(result.blocks);
    console.log(result.blocks)
  }
});

//Difficulty Route
router.get('/api/Difficulty', async (req, res) => {
  const result = await callRPC('getmininginfo');
  if (result.error) {
    res.status(500).json({ error: result.error });
  } else {
    res.json(result.difficulty);
    console.log(result.difficulty)
  }
});

//Avgerage Block Fees Route
router.get('/api/avgblockfees', async (req, res) => {
  const result = await callRPC('getmininginfo');
  if (result.error) {
    res.status(500).json({ error: result.error });
  } else {
    res.json(result.averageblockfees);
    console.log(result.averageblockfees)
  }
});

//Getnetworksolps endpoint
router.get('/api/getnetworksolps', async (req, res) => {
  const result = await callRPC('getnetworksolps');
  if (result.error) {
    res.status(500).json({ error: result.error });
  } else {
    res.json(result);
    console.log(result)
  }
});

//Get Identity Route
router.get('/api/getidentity/:name', async (req, res) => {
  const {name} = req.params; //Extract the identity name from the URL
  const result = await callRPC('getidentity', [name]);
  if (result.error) {
    res.status(500).json({ error: result.error });
  } else {
    res.json(result);
    console.log(result)
  }
});

//Get Currency Route
router.get('/api/getcurrency/:currencyname', async (req, res) => {
  const {currencyname} = req.params; //Extract the currency  name from the URL
  const result = await callRPC('getcurrency', [currencyname]);
  if (result.error) {
    res.status(500).json({ error: result.error });
  } else {
    res.json(result);
    console.log(result)
  }
});

// Getmininginfo details endpoint
router.get('/api/getmininginfodetails', async (req, res) => {
  const result = await callRPC('getmininginfo');
  if (result.error) {
    res.status(500).json({ error: result.error });
  } else {
    res.json(`blocks: ${result.blocks}, average block fees: ${result.averageblockfees}, staking supply: ${result.stakingsupply}, difficulty: ${result.difficulty}, network hash ps: ${result.networkhashps}`);
    console.log(result)
  }
});

//Get Identity Multiple Route
router.get('/api/getidentityinfo/:name', async (req, res) => {
  const {name} = req.params; //Extract the identity name from the URL
  const result = await callRPC('getidentity', [name]);
  if (result.error) {
    res.status(500).json({ error: result.error });
  } else {
    res.json(`fully qualified name: ${result.fullyqualifiedname}, primary addresses: ${result.identity.primaryaddresses}, i-address: ${result.identity.identityaddress}, revoke: ${result.identity.revocationauthority}, recover: ${result.identity.recoveryauthority}, vault: ${result.identity.timelock}`);
    console.log(result)
  }
});

//Get Currency Startblock
router.get('/api/getstartblock/:currencyname', async (req, res) => {
  const {currencyname} = req.params; //Extract the currency  name from the URL
  const result = await callRPC('getcurrency', [currencyname]);
  if (result.error) {
    res.status(500).json({ error: result.error });
  } else {
    res.send(result.startblock.toString());
    console.log(result)
  }
});

//Get Currency Multiple Route
router.get('/api/getcurrencyinfo/:currencyname', async (req, res) => {
  const {currencyname} = req.params; //Extract the currency  name from the URL
  const result = await callRPC('getcurrency', [currencyname]);
  if (result.error) {
    res.status(500).json({ error: result.error });
  } else {
    const currencyNames = Object.values(result.currencynames).join(','); // Get currencynames values
    res.json(`name: ${result.name}, options: ${result.options}, supply: ${result.bestcurrencystate.supply}, initial supply: ${result.bestcurrencystate.initialsupply}, id registration fees: ${result.idregistrationfees}, id referral levels: ${result.idreferrallevels}, idimportfees: ${result.idimportfees}, currency names: ${currencyNames}`);
    console.log(result)
  }
});

//Get Currency State Route
router.get('/api/getcurrencystate/:currencyname/*?', async (req, res) => {
  const { currencyname } = req.params;
  const additionalParams = req.params[0] ? req.params[0].split('/').filter(Boolean) : [];
  
  // Initialize params array with required currencyname
  const params = [currencyname];
  
  // Handle block/range parameter
  if (additionalParams.length >= 1) {
    let rangeParam;
    const numbers = additionalParams[0].split(',').map(n => n.trim());
    
    if (numbers.length === 1) {
      // Single block number
      rangeParam = numbers[0];
    } else if (numbers.length === 2 || numbers.length === 3) {
      // Range without interval or with interval
      rangeParam = additionalParams[0];
    }
    
    if (rangeParam) {
      params.push(rangeParam);
    }
    
    // If there's a volume currency (last parameter)
    if (additionalParams[1]) {
      params.push(additionalParams[1]);
    }
  }

  const result = await callRPC('getcurrencystate', params);
  
  if (result.error) {
    res.status(500).json({ error: result.error });
  } else {
    res.json(result);
    console.log(result);
  }
});

//Get Conversion Data Route from getcurrencystate rpc
router.get('/api/getconversiondata/:currencyname/*?', async (req, res) => {
  const { currencyname } = req.params;
  const additionalParams = req.params[0] ? req.params[0].split('/').filter(Boolean) : [];
  
  // Initialize params array with required currencyname
  const params = [currencyname];
  
  // Handle block/range parameter
  if (additionalParams.length >= 1) {
    let rangeParam;
    const numbers = additionalParams[0].split(',').map(n => n.trim());
    
    if (numbers.length === 1) {
      // Single block number
      rangeParam = numbers[0];
    } else if (numbers.length === 2 || numbers.length === 3) {
      // Range without interval or with interval
      rangeParam = additionalParams[0];
    }
    
    if (rangeParam) {
      params.push(rangeParam);
    }
    
    // If there's a volume currency (last parameter)
    if (additionalParams[1]) {
      params.push(additionalParams[1]);
    }
  }

  const result = await callRPC('getcurrencystate', params);
  
  if (result.error) {
    res.status(500).json({ error: result.error });
  } else {
    // Extract both block height & blocktime in addition to conversion data from each result
    const formattedData = Array.isArray(result) 
      ? result.map(item => ({
          height: item.height,
          blocktime: item.blocktime,
          conversiondata: item.conversiondata
        })).filter(item => item.conversiondata)
      : result.conversiondata 
        ? [{
            height: result.height,
            blocktime: result.blocktime,
            conversiondata: result.conversiondata
          }] 
        : [];
        
    res.json(formattedData);
    console.log(formattedData);
  }
});


//Help command endpoint
router.get('/api/help', async (req, res) => {
  const result = await callRPC('help');
  if (result.error) {
    res.status(500).json({ error: result.error });
  } else {
    res.json(result);
    console.log(result)
  }
});

module.exports = router;
