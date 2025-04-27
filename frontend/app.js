// Currency pairs configuration
const CURRENCY_PAIRS = {
    'Pure': ['Pure', 'VRSC', 'tBTC.vETH'],
    'Bridge.vETH': ['Bridge.vETH', 'VRSC', 'vETH', 'MKR.vETH', 'DAI.vETH']
};

let chart = null;
let candlestickSeries = null;
let volumeSeries = null;

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const basketSelect = document.getElementById('basketCurrency');
    const currencySelect = document.getElementById('currency');
    const convertToSelect = document.getElementById('convertTo');
    const volumeCurrencySelect = document.getElementById('volumeCurrency');
    const updateButton = document.getElementById('updateChart');
    const currentBlockHeight = document.getElementById('currentBlockHeight');

    // Update all currency dropdowns based on basket selection
    function updateCurrencyOptions() {
        const selectedBasket = basketSelect.value;
        const availableCurrencies = CURRENCY_PAIRS[selectedBasket];

        // Clear existing options in all dropdowns
        convertToSelect.innerHTML = '';
        currencySelect.innerHTML = '';
        volumeCurrencySelect.innerHTML = '';

        // Add new options to all three dropdowns
        availableCurrencies.forEach(currency => {
            currencySelect.add(new Option(currency, currency));
            convertToSelect.add(new Option(currency, currency));
            volumeCurrencySelect.add(new Option(currency, currency));
        });

        // Select different default values
        if (availableCurrencies.length > 1) {
            currencySelect.value = availableCurrencies[0];    // denominator
            convertToSelect.value = availableCurrencies[1];   // numerator
            volumeCurrencySelect.value = availableCurrencies[1]; // Default to same as convertTo
        }

        validateCurrencySelection();
    }

    // Validate currency selections
    function validateCurrencySelection() {
        const numerator = convertToSelect.value;
        const denominator = currencySelect.value;
        
        // Disable update button if same currency is selected
        const isValid = numerator !== denominator;
        updateButton.disabled = !isValid;
        
        // Show/hide error message
        const errorElements = document.querySelectorAll('.error-message');
        errorElements.forEach(el => {
            el.style.display = isValid ? 'none' : 'block';
        });
    }

    // Initialize the current block height
    async function updateBlockHeightDisplay() {
        try {
            console.log('Fetching block height...'); // Debug log
            const response = await fetch('http://localhost:5500/api/currentblockheight');
            console.log('Response:', response); // Debug log
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const blockHeight = await response.text();
            console.log('Block height received:', blockHeight); // Debug log
            
            currentBlockHeight.textContent = blockHeight;
            return blockHeight;
        } catch (error) {
            console.error('Error fetching block height:', error);
            currentBlockHeight.textContent = 'Error loading';
            throw error;
        }
    }

    // Separate function for getting block height value
async function fetchCurrentBlockHeight() {
    try {
        const response = await fetch('http://localhost:5500/api/currentblockheight');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.text();
    } catch (error) {
        console.error('Error fetching block height:', error);
        throw error;
    }
}

    async function fetchStartBlock(basketCurrency) {
        try {
            const response = await fetch(`http://localhost:5500/api/getstartblock/${basketCurrency}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.text();
        } catch (error) {
            console.error('Error fetching start block:', error);
            throw error;
        }
    }

    async function fetchConversionData() {
        try {
            const basketCurrency = basketSelect.value;
            const volumeCurrency = volumeCurrencySelect.value;
            const interval = document.getElementById('interval').value;
            
            // Get block heights
            const startBlock = await fetchStartBlock(basketCurrency);
            const endBlock = await fetchCurrentBlockHeight();
            
            const url = `http://localhost:5500/api/getconversiondata/${basketCurrency}/${startBlock},${endBlock},${interval}/${volumeCurrency}`;
            console.log('Fetching data from:', url);
    
            // Add timeout and additional logging
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
            const response = await fetch(url, {
                signal: controller.signal
            });
            clearTimeout(timeoutId);
    
            console.log('Response headers:', Object.fromEntries(response.headers));
            console.log('Response status:', response.status);
    
            if (!response.ok) {
                const errorText = await response.text();
                console.log('Error response:', errorText);
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }
            
            const data = await response.json();
            console.log('First data item detailed:', JSON.stringify(data[0], null, 2));
            return data;
        } catch (error) {
            if (error.name === 'AbortError') {
                console.error('Request timed out after 30 seconds');
            }
            console.error('Error fetching conversion data:', error);
            throw error;
        }
    }
    
    
      function transformDataForChart(apiData, numerator, denominator) {
        return apiData.map(interval => {
            // Match where convertto is our numerator and currency is our denominator
            const pairData = interval.conversiondata.volumepairs.find(
                pair => pair.convertto === numerator && pair.currency === denominator
            );
            
            if (pairData) {
                return {
                    time: interval.height,
                    open: pairData.open,
                    high: pairData.high,
                    low: pairData.low,
                    close: pairData.close,
                    volume: pairData.volume
                };
            }
            return null;
        }).filter(Boolean);
    }
    
      
    async function updateChartData() {
        try {
            console.log('Starting chart update...');
            const data = await fetchConversionData();
            const chartData = transformDataForChart(
                data,
                convertToSelect.value,   // numerator
                currencySelect.value     // denominator
            );
            
            console.log('Chart instance exists:', !!chart);
            console.log('Candlestick series exists:', !!candlestickSeries);
            console.log('Setting data points:', chartData.length);
            
            if (!chart || !candlestickSeries) {
                console.error('Chart or series not initialized');
                initializeChart();
            }
    
            candlestickSeries.setData(chartData);
            console.log('Data set to chart');
            
            // Ensure proper display
            chart.timeScale().fitContent();
            console.log('Chart fitted');
        } catch (error) {
            console.error('Error updating chart:', error);
        }
    }
    
      

      function initializeChart() {
        const chartContainer = document.getElementById('chart');
        chartContainer.innerHTML = '';
        
        const customBehavior = new (LightweightCharts.defaultHorzScaleBehavior())();
        
        chart = LightweightCharts.createChartEx(chartContainer, customBehavior, {
            layout: {
                background: { type: 'solid', color: '#2d2d2d' },
                textColor: '#DDD',
            },
            grid: {
                vertLines: { color: '#404040' },
                horzLines: { color: '#404040' },
            },
            crosshair: {
                mode: LightweightCharts.CrosshairMode.Normal,
                vertLine: {
                    width: 1,
                    color: '#2962FF',
                    style: LightweightCharts.LineStyle.Solid,
                },
                horzLine: {
                    width: 1,
                    color: '#2962FF',
                    style: LightweightCharts.LineStyle.Solid,
                },
            },
            timeScale: {
                borderColor: '#485c7b',
                timeVisible: false,  // Since we're using block heights
                tickMarkFormatter: (time) => `Block ${time}`,
            },
        });
    
        candlestickSeries = chart.addSeries(LightweightCharts.CandlestickSeries, {
            upColor: '#26a69a',
            downColor: '#ef5350',
            borderVisible: false,
            wickUpColor: '#26a69a',
            wickDownColor: '#ef5350',
        });
    
        // Enable zooming/panning
        chart.timeScale().applyOptions({
            rightOffset: 12,
            barSpacing: 6,
            lockVisibleTimeRangeOnResize: true,
            rightBarStaysOnScroll: true,
        });
    
        return chart;
    }
    
    

    // Event Listeners
    basketSelect.addEventListener('change', updateCurrencyOptions);
    currencySelect.addEventListener('change', validateCurrencySelection);
    convertToSelect.addEventListener('change', validateCurrencySelection);
    updateButton.addEventListener('click', updateChartData);

    // Initialize
updateCurrencyOptions();
updateBlockHeightDisplay();
initializeChart();
}); // Closing bracket for DOMContentLoaded
