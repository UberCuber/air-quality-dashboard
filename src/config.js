// ThingSpeak Configuration
// Replace these with your actual ThingSpeak Channel ID and Read API Key

export const THINGSPEAK_CONFIG = {
  CHANNEL_ID: '3124782', // Replace with your ThingSpeak Channel ID
  READ_API_KEY: '77AFZC71W91ZVTVV', // Replace with your ThingSpeak Read API Key
  UPDATE_INTERVAL: 15000, // Update interval in milliseconds (15 seconds default, same as ThingSpeak)
};

// Field mappings (adjust these based on your ThingSpeak channel field assignments)
export const FIELD_MAPPINGS = {
  temperature: 2,    // Field 1: Temperature
  humidity: 3,       // Field 2: Humidity
  pm25: 5,           // Field 3: PM2.5
  pm10: 6,           // Field 4: PM10
  co2: 1,            // Field 5: CO2
  no2: 4,            // Field 6: NO2
};

