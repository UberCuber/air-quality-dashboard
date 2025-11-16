import React, { useState, useEffect, useRef } from 'react';
import { fetchLatestData, fetchHistoricalData } from './services/thingspeak';
import { THINGSPEAK_CONFIG } from './config';
import MetricCard from './components/MetricCard';
import AirQualityChart from './components/AirQualityChart';
import './App.css';

function App() {
  const [mode, setMode] = useState('live'); // 'live', 'historical', or 'compare'
  const [theme, setTheme] = useState('dark'); // 'dark' or 'light'
  const [data, setData] = useState([]);
  const [compareData, setCompareData] = useState([]);
  const [latestData, setLatestData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Historical mode state
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Comparison mode state
  const [compareStartDate, setCompareStartDate] = useState('');
  const [compareEndDate, setCompareEndDate] = useState('');
  
  // Ref for interval to clear on unmount
  const intervalRef = useRef(null);
  const hasSetDefaultsRef = useRef({ historical: false, compare: false });

  // Fetch latest data
  const loadLatestData = async () => {
    try {
      setError(null);
      const latest = await fetchLatestData();
      setLatestData(latest);
      
      // Add to historical data array for live mode
      if (mode === 'live') {
        setData(prev => {
          const newData = [...prev, latest];
          // Keep only last 100 data points for performance
          return newData.slice(-100);
        });
      }
    } catch (err) {
      setError(err.message);
      console.error('Error loading latest data:', err);
    }
  };

  // Fetch historical data
  const loadHistoricalData = async () => {
    if (!startDate || !endDate) {
      setError('Please select both start and end dates');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (start > end) {
        setError('Start date must be before end date');
        setLoading(false);
        return;
      }

      const historicalData = await fetchHistoricalData(start, end);
      setData(historicalData);
      
      // Set latest data to the most recent entry
      if (historicalData.length > 0) {
        setLatestData(historicalData[historicalData.length - 1]);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error loading historical data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch comparison data
  const loadComparisonData = async () => {
    if (!startDate || !endDate || !compareStartDate || !compareEndDate) {
      setError('Please select all date ranges for comparison');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const start = new Date(startDate);
      const end = new Date(endDate);
      const compareStart = new Date(compareStartDate);
      const compareEnd = new Date(compareEndDate);
      
      if (start > end || compareStart > compareEnd) {
        setError('Start date must be before end date for both ranges');
        setLoading(false);
        return;
      }

      const [historicalData, compData] = await Promise.all([
        fetchHistoricalData(start, end),
        fetchHistoricalData(compareStart, compareEnd)
      ]);
      
      setData(historicalData);
      setCompareData(compData);
      
      // Set latest data to the most recent entry from first range
      if (historicalData.length > 0) {
        setLatestData(historicalData[historicalData.length - 1]);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error loading comparison data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Setup live mode with auto-refresh
  useEffect(() => {
    if (mode === 'live') {
      // Clear existing data for fresh start
      setData([]);
      setCompareData([]);
      
      // Load initial data
      loadLatestData();
      
      // Set up interval for auto-refresh
      intervalRef.current = setInterval(() => {
        loadLatestData();
      }, THINGSPEAK_CONFIG.UPDATE_INTERVAL);
      
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    } else {
      // Clear interval when switching away from live mode
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      
      // Clear compare data when switching away from compare mode
      if (mode !== 'compare') {
        setCompareData([]);
      }
    }
  }, [mode]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Set default date range (last 24 hours) - only when mode changes
  useEffect(() => {
    if (mode === 'historical' && !hasSetDefaultsRef.current.historical) {
      const end = new Date();
      const start = new Date();
      start.setHours(start.getHours() - 24);
      
      setEndDate(end.toISOString().slice(0, 16));
      setStartDate(start.toISOString().slice(0, 16));
      hasSetDefaultsRef.current.historical = true;
      hasSetDefaultsRef.current.compare = false; // Reset when switching modes
    }
    
    if (mode === 'compare' && !hasSetDefaultsRef.current.compare) {
      const end = new Date();
      const start = new Date();
      start.setHours(start.getHours() - 24);
      
      const compareEnd = new Date();
      compareEnd.setDate(compareEnd.getDate() - 1);
      const compareStart = new Date(compareEnd);
      compareStart.setHours(compareStart.getHours() - 24);
      
      setStartDate(start.toISOString().slice(0, 16));
      setEndDate(end.toISOString().slice(0, 16));
      setCompareStartDate(compareStart.toISOString().slice(0, 16));
      setCompareEndDate(compareEnd.toISOString().slice(0, 16));
      hasSetDefaultsRef.current.compare = true;
      hasSetDefaultsRef.current.historical = false; // Reset when switching modes
    }
    
    // Reset flags when switching to live mode
    if (mode === 'live') {
      hasSetDefaultsRef.current.historical = false;
      hasSetDefaultsRef.current.compare = false;
    }
  }, [mode]); // Only depend on mode, not on date values

  // Apply theme to body
  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  const metricColors = {
    temperature: '#ef4444',  // Red
    humidity: '#3b82f6',     // Blue
    pm25: '#10b981',         // Green
    pm10: '#8b5cf6',         // Purple
    co2: '#f59e0b',          // Amber
    no2: '#ec4899',          // Pink
  };

  const metricIcons = {
    temperature: null,
    humidity: null,
    pm25: null,
    pm10: null,
    co2: null,
    no2: null,
  };

  const metricUnits = {
    temperature: '°C',
    humidity: '%',
    pm25: ' µg/m³',
    pm10: ' µg/m³',
    co2: ' ppm',
    no2: ' ppm',
  };

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <h1>Air Quality Monitoring Dashboard</h1>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <button
              className="theme-toggle"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <div className="mode-toggle">
              <button
                className={mode === 'live' ? 'active' : ''}
                onClick={() => setMode('live')}
              >
                Live Mode
              </button>
              <button
                className={mode === 'historical' ? 'active' : ''}
                onClick={() => setMode('historical')}
              >
                Historical Mode
              </button>
              <button
                className={mode === 'compare' ? 'active' : ''}
                onClick={() => setMode('compare')}
              >
                Compare Dates
              </button>
            </div>
          </div>
        </header>

        {mode === 'historical' && (
          <div className="date-selector">
            <div className="date-input-group">
              <label>
                Start Date & Time:
                <input
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  max={new Date().toISOString().slice(0, 16)}
                />
              </label>
              <label>
                End Date & Time:
                <input
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  max={new Date().toISOString().slice(0, 16)}
                />
              </label>
              <button onClick={loadHistoricalData} disabled={loading}>
                {loading ? 'Loading...' : 'Load Data'}
              </button>
            </div>
          </div>
        )}

        {mode === 'compare' && (
          <div className="date-selector">
            <h3 style={{ marginBottom: '16px', fontSize: '16px', fontWeight: '600' }}>First Date Range</h3>
            <div className="date-input-group" style={{ marginBottom: '20px' }}>
              <label>
                Start Date & Time:
                <input
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  max={new Date().toISOString().slice(0, 16)}
                />
              </label>
              <label>
                End Date & Time:
                <input
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  max={new Date().toISOString().slice(0, 16)}
                />
              </label>
            </div>
            <h3 style={{ marginBottom: '16px', fontSize: '16px', fontWeight: '600' }}>Second Date Range (to compare)</h3>
            <div className="date-input-group">
              <label>
                Start Date & Time:
                <input
                  type="datetime-local"
                  value={compareStartDate}
                  onChange={(e) => setCompareStartDate(e.target.value)}
                  max={new Date().toISOString().slice(0, 16)}
                />
              </label>
              <label>
                End Date & Time:
                <input
                  type="datetime-local"
                  value={compareEndDate}
                  onChange={(e) => setCompareEndDate(e.target.value)}
                  max={new Date().toISOString().slice(0, 16)}
                />
              </label>
              <button onClick={loadComparisonData} disabled={loading}>
                {loading ? 'Loading...' : 'Compare Data'}
              </button>
            </div>
          </div>
        )}

        {mode === 'live' && (
          <div className="live-indicator">
            <span className="pulse"></span>
            <span>Live data updating every {THINGSPEAK_CONFIG.UPDATE_INTERVAL / 1000} seconds</span>
          </div>
        )}

        {error && (
          <div className="error-message">
            <span>Error:</span> {error}
          </div>
        )}

        {latestData && (
          <div className="metrics-grid">
            <MetricCard
              title="Temperature"
              value={latestData.temperature}
              unit="°C"
              color={metricColors.temperature}
              icon={metricIcons.temperature}
              theme={theme}
            />
            <MetricCard
              title="Humidity"
              value={latestData.humidity}
              unit="%"
              color={metricColors.humidity}
              icon={metricIcons.humidity}
              theme={theme}
            />
            <MetricCard
              title="PM2.5"
              value={latestData.pm25}
              unit=" µg/m³"
              color={metricColors.pm25}
              icon={metricIcons.pm25}
              theme={theme}
            />
            <MetricCard
              title="PM10"
              value={latestData.pm10}
              unit=" µg/m³"
              color={metricColors.pm10}
              icon={metricIcons.pm10}
              theme={theme}
            />
            <MetricCard
              title="CO2"
              value={latestData.co2}
              unit=" ppm"
              color={metricColors.co2}
              icon={metricIcons.co2}
              theme={theme}
            />
            <MetricCard
              title="NO2"
              value={latestData.no2}
              unit=" ppm"
              color={metricColors.no2}
              icon={metricIcons.no2}
              theme={theme}
            />
          </div>
        )}

        {data.length > 0 && (
          <div className="charts-container">
            <h2 className="section-title">
              {mode === 'compare' ? 'Comparison: Date Range 1 vs Date Range 2' : 'Historical Trends'}
            </h2>
            <div className="charts-grid">
              <AirQualityChart
                data={data}
                compareData={mode === 'compare' ? compareData : null}
                metric="temperature"
                color={metricColors.temperature}
                unit="°C"
                label="Temperature"
                theme={theme}
              />
              <AirQualityChart
                data={data}
                compareData={mode === 'compare' ? compareData : null}
                metric="humidity"
                color={metricColors.humidity}
                unit="%"
                label="Humidity"
                theme={theme}
              />
              <AirQualityChart
                data={data}
                compareData={mode === 'compare' ? compareData : null}
                metric="pm25"
                color={metricColors.pm25}
                unit=" µg/m³"
                label="PM2.5"
                theme={theme}
              />
              <AirQualityChart
                data={data}
                compareData={mode === 'compare' ? compareData : null}
                metric="pm10"
                color={metricColors.pm10}
                unit=" µg/m³"
                label="PM10"
                theme={theme}
              />
              <AirQualityChart
                data={data}
                compareData={mode === 'compare' ? compareData : null}
                metric="co2"
                color={metricColors.co2}
                unit=" ppm"
                label="CO2"
                theme={theme}
              />
              <AirQualityChart
                data={data}
                compareData={mode === 'compare' ? compareData : null}
                metric="no2"
                color={metricColors.no2}
                unit=" ppm"
                label="NO2"
                theme={theme}
              />
            </div>
          </div>
        )}

        {data.length === 0 && !loading && mode === 'historical' && (
          <div className="empty-state">
            <p>Select a date range and click "Load Data" to view historical trends</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

