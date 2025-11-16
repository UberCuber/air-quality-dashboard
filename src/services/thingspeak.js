import { THINGSPEAK_CONFIG, FIELD_MAPPINGS } from '../config.js';

const BASE_URL = 'https://api.thingspeak.com';

/**
 * Fetch latest data from ThingSpeak channel
 */
export const fetchLatestData = async () => {
  try {
    const url = `${BASE_URL}/channels/${THINGSPEAK_CONFIG.CHANNEL_ID}/feeds/last.json?api_key=${THINGSPEAK_CONFIG.READ_API_KEY}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      temperature: parseFloat(data[`field${FIELD_MAPPINGS.temperature}`]) || null,
      humidity: parseFloat(data[`field${FIELD_MAPPINGS.humidity}`]) || null,
      pm25: parseFloat(data[`field${FIELD_MAPPINGS.pm25}`]) || null,
      pm10: parseFloat(data[`field${FIELD_MAPPINGS.pm10}`]) || null,
      co2: parseFloat(data[`field${FIELD_MAPPINGS.co2}`]) || null,
      no2: parseFloat(data[`field${FIELD_MAPPINGS.no2}`]) || null,
      timestamp: data.created_at,
    };
  } catch (error) {
    console.error('Error fetching latest data:', error);
    throw error;
  }
};

/**
 * Fetch historical data from ThingSpeak channel
 * @param {Date} startDate - Start date for data range
 * @param {Date} endDate - End date for data range
 * @param {number} results - Number of results (max 8000)
 */
export const fetchHistoricalData = async (startDate, endDate, results = 8000) => {
  try {
    // ThingSpeak uses ISO 8601 format for dates (YYYY-MM-DD HH:MM:SS)
    const start = startDate.toISOString().replace('T', ' ').split('.')[0];
    const end = endDate.toISOString().replace('T', ' ').split('.')[0];
    
    const params = new URLSearchParams({
      api_key: THINGSPEAK_CONFIG.READ_API_KEY,
      start: start,
      end: end,
      results: results.toString(),
    });
    
    const url = `${BASE_URL}/channels/${THINGSPEAK_CONFIG.CHANNEL_ID}/feeds.json?${params.toString()}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.feeds || data.feeds.length === 0) {
      return [];
    }
    
    // Transform feeds into chart-ready format
    return data.feeds.map(feed => ({
      timestamp: feed.created_at,
      temperature: parseFloat(feed[`field${FIELD_MAPPINGS.temperature}`]) || null,
      humidity: parseFloat(feed[`field${FIELD_MAPPINGS.humidity}`]) || null,
      pm25: parseFloat(feed[`field${FIELD_MAPPINGS.pm25}`]) || null,
      pm10: parseFloat(feed[`field${FIELD_MAPPINGS.pm10}`]) || null,
      co2: parseFloat(feed[`field${FIELD_MAPPINGS.co2}`]) || null,
      no2: parseFloat(feed[`field${FIELD_MAPPINGS.no2}`]) || null,
    })).filter(feed => 
      feed.temperature !== null || 
      feed.humidity !== null || 
      feed.pm25 !== null || 
      feed.pm10 !== null || 
      feed.co2 !== null || 
      feed.no2 !== null
    );
  } catch (error) {
    console.error('Error fetching historical data:', error);
    throw error;
  }
};

