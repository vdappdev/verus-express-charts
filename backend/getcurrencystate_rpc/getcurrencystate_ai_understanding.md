./verus help getcurrencystate

Looking at the help documentation, here are the key points relevant to our charting project:


1. Key Parameters we'll need:

- "currencynameorid": This will be the currency pair we want to chart
- "n" (height/range): This is crucial - we can specify ranges to get historical data
- "conversiondatacurrency": We'll use this to get consistent volume measurements


2. Most Important Response Data (for charting):


"conversiondata": {
    "volumecurrency": "reserveorbasket",
    "volumethisinterval": n,
    "volumepairs": [
        {
            "currency": "sourcecurrency",
            "convertto": "destinationcurrency",
            "volume": n,
            "open": n,
            "high": n,
            "low": n,
            "close": n
        }
    ]
}

This matches perfectly with what Lightweight Charts needs:

- We get OHLC (Open, High, Low, Close) data
- We get volume data
- We can specify intervals (1440 blocks for daily, 10080 for weekly)

For our implementation, we'll need to:

1. Make RPC calls with specific block ranges
2. Transform the timestamp (blocktime) to match Lightweight Charts' time format
3. Map the OHLCV data directly to the chart library's format


-----------------------


./verus getcurrencystate "pure" "3200000, 3300000, 1440" "vrsc"

This is a great example of the data! Let me analyze the key patterns we need for the charting:

1. Every 1440 blocks (1 day) has a "conversiondata" object containing:


"conversiondata": {
    "volumecurrency": "VRSC",
    "volumethisinterval": number,
    "volumepairs": [
        {
            "currency": string,      // e.g., "VRSC", "Pure", "tBTC.vETH"
            "convertto": string,     // which currency it's converting to
            "volume": number,
            "open": number,
            "high": number,
            "low": number,
            "close": number
        }
    ]
}


2. Important patterns:

Each interval gives us perfect OHLCV (Open, High, Low, Close, Volume) data
The "height" field can be used for time reference
Multiple currency pairs in each interval
Volume is denominated in VRSC


For Lightweight Charts, we'll need to:

1. Transform each interval into candlestick data:


interface CandlestickData {
    time: number;        // from height/blocktime
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}



2. Create a data processing function that:

Filters for specific currency pairs
Converts block heights to timestamps
Structures the OHLCV data correctly


-------------------------------


./verus getcurrencystate "pure" "3200000, 3300000, 10080" "vrsc"

and

./verus getcurrencystate "pure" "3200000, 3300000, 10080" "tbtc.veth"


This comparison clearly shows how specifying different volume currencies affects the data presentation. Here are the key insights:


1. Data Structure Consistency:


Both timeframes (1440 and 10080) maintain the same structure
The volume currency parameter changes how the volumes are denominated
The OHLC data remains consistent regardless of volume currency



2. Weekly (10080) vs Daily (1440) Benefits:


Weekly data provides a cleaner overview with fewer data points
Transaction volumes are aggregated over longer periods
Less noisy for trend analysis



3. Important Implementation Notes:


interface ChartDataPoint {
    time: number;             // from blocktime
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;           // depends on volumecurrency parameter
    currencyPair: string;     // e.g., "VRSC/tBTC.vETH"
}

// We'll need to track currency pairs separately
interface CurrencyPair {
    from: string;
    to: string;
    volumeCurrency: string;
}



4. Data Processing Strategy:


function processRPCData(data: RPCResponse, selectedPair: CurrencyPair) {
    return data.map(interval => {
        // Find the relevant pair in volumepairs
        const pairData = interval.conversiondata.volumepairs
            .find(p => p.currency === selectedPair.from && 
                      p.convertto === selectedPair.to);
        
        return {
            time: interval.blocktime,
            open: pairData.open,
            high: pairData.high,
            low: pairData.low,
            close: pairData.close,
            volume: pairData.volume
        };
    });
}