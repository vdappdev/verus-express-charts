
# Verus Blockchain Charts Frontend

A dynamic web interface for viewing trading pair data from the Verus blockchain using TradingView's Lightweight Charts library.

## Overview

This frontend application provides an interactive charting interface for viewing conversion data from various trading pairs in the Verus blockchain ecosystem. The application uses vanilla HTML, CSS, and JavaScript with TradingView's Lightweight Charts for visualization.

## Parameters

The chart data is fetched using five main parameters:

1. **Basket Currency** - The base currency (e.g., bridge.veth)
2. **Start Block** - Beginning block height for data range
    - use getcurrency (or listcurrencies?) and use the "startblock" listed in the json result
3. **End Block** - Ending block height for data range
    - use the current block height from get current block height (or getmininginfo "blocks" listen in the json result)
4. **Interval** - Block interval for data aggregation
5. **Volume Currency** - Currency used for volume calculations

### Interval Options
- 1440 blocks (approximately 1 day)
- 10080 blocks (approximately 1 week)

### Current Block Height
The application displays the current block height of the Verus blockchain, providing users with a reference point when selecting block ranges for their queries.

## Interface Layout

### Controls Panel
- Dropdown selectors for basket and volume currencies
- Trading pair selection dropdown
    "convertto" field matches our numerator
    "currency" field matches our denominator
- Block range inputs (start and end)
- Interval selector (1440, or 10080 blocks)
- Update/Refresh button
- currency block height display

### Chart Area
- TradingView Lightweight Chart display
- Candlestick visualization
- Volume indicators
- Time/block navigation

### Attribution
- Required TradingView attribution

## Data Flow
- User Input → Parameter Selection → API Request → Data Processing → Chart Update


## Technical Details

### Dependencies
- TradingView Lightweight Charts (via CDN)
- HTTP Server for local development

### Local Development
```bash
# Install dependencies
npm install

# Start development server
npm start
- Server runs on port 5273 by default

## Backend Integration

- Connects to backend API running on port 5500

## License
MIT

## Attribution
- Powered by TradingView





Current questions for consideration:

Do you have a list of all possible basket currencies?
    - 1st iteration:  we can use some main baskets, there are:  "Bridge.vETH", "Pure", "Super🛒", "NATI🦉".  First we will use Pure and Bridge.vETH.  Once those are working we'll add Super🛒, and NATI🦉
    - 2nd iteration:  we can use "listcurrencies" RPC and filter for all the currencies with "options":33 and "options":41 in the json result; that would give us all the basket currencies that have been defined on the network

What's a typical range for intervals?
    - 1 minute average blocks, therefore 240 = 4hrs candle, 1440 = 1 day candle, 10080 = 1 week candle.

Should we add any default values?
    - first iteration:  if user chooses Pure from the dropdown, then the startblock is Pure's currency definition startblock, and for Bridge.vETH we can do the same, use its actual startblock as the startblock in the getcurrencystate rpc we use to return the conversiondata.
    - first iteration:  for endblock, we can use the block height returned from the getmininginfo rpc, for which we have a specific blockheight api or we can just use getmininginfo.  The current block height will serve as the "endblock" in the getcurrencystate rpc parameters. 
    - second iteration:  as the user clicks on a currency from the list of all possible baskets; or, as the user selects a basket currency from the dropdown containing all possibile baskets, the startblock and endblock can be populated based on the basketcurrency's original startblock for the startblock(we fetch it from "listcurrencies" or "getcurrency"), and for the endblock we can use the current block height from "getmininginfo" or another more specific api that uses getmininginfo to fetch the current block height.
    
Do you want to add any validation (like max block range)?
    - first iteration, let's do it as outlined above

Would you like to display:
Just candlestick charts, or
Additional features like volume bars, technical indicators?
    - additional features like volume bars
    - yes technical indicators