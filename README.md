# Air Quality Dashboard

A real-time and historical air quality monitoring dashboard that connects to ThingSpeak to visualize IoT sensor data. Displays temperature, humidity, PM2.5, PM10, CO2, and NO2 readings with live updates and historical trend analysis.

## Features

- 📡 **Live Mode**: Real-time data updates every 15 seconds (configurable)
- 📊 **Historical Mode**: View data for any custom date/time range
- 📈 **Interactive Charts**: Beautiful time-series charts for all 6 metrics
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile devices
- 🚀 **Easy Deployment**: Static site ready for deployment to Vercel, Netlify, GitHub Pages, etc.

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure ThingSpeak

Open `src/config.js` and update the following:

```javascript
export const THINGSPEAK_CONFIG = {
  CHANNEL_ID: 'YOUR_CHANNEL_ID',        // Your ThingSpeak Channel ID
  READ_API_KEY: 'YOUR_READ_API_KEY',    // Your ThingSpeak Read API Key
  UPDATE_INTERVAL: 15000,               // Update interval in milliseconds
};

export const FIELD_MAPPINGS = {
  temperature: 1,    // Field 1: Temperature
  humidity: 2,       // Field 2: Humidity
  pm25: 3,           // Field 3: PM2.5
  pm10: 4,           // Field 4: PM10
  co2: 5,            // Field 5: CO2
  no2: 6,            // Field 6: NO2
};
```

**Important**: Make sure your ThingSpeak channel fields match the field numbers above. If your sensors use different field assignments, update the `FIELD_MAPPINGS` accordingly.

### 3. Run Development Server

```bash
npm run dev
```

The dashboard will be available at `http://localhost:3000`

### 4. Build for Production

```bash
npm run build
```

The production-ready files will be in the `dist` folder.

## Deployment

This is a static site that can be deployed to any static hosting service.

### Vercel (Recommended)

1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Follow the prompts

Or connect your GitHub repository to Vercel for automatic deployments.

### Netlify

1. Install Netlify CLI: `npm i -g netlify-cli`
2. Build: `npm run build`
3. Deploy: `netlify deploy --prod --dir=dist`

Or drag and drop the `dist` folder to [Netlify Drop](https://app.netlify.com/drop).

### GitHub Pages

1. Update `vite.config.js` to add:
   ```javascript
   export default defineConfig({
     base: '/your-repo-name/',
     // ... rest of config
   })
   ```

2. Build: `npm run build`
3. Push the `dist` folder to the `gh-pages` branch

### Other Platforms

The `dist` folder contains static files that can be uploaded to any web hosting service:
- AWS S3 + CloudFront
- Google Cloud Storage
- Azure Static Web Apps
- Any traditional web hosting service

## ThingSpeak Configuration

### Getting Your Channel ID and API Key

1. Log in to [ThingSpeak](https://thingspeak.com/)
2. Go to your channel
3. Note the **Channel ID** from the URL or channel page
4. Go to **API Keys** tab
5. Copy the **Read API Key**

### Field Assignments

Make sure your ESP32 code sends data to the correct ThingSpeak fields:

- Field 1: Temperature
- Field 2: Humidity  
- Field 3: PM2.5
- Field 4: PM10
- Field 5: CO2
- Field 6: NO2

If your setup uses different field assignments, update the `FIELD_MAPPINGS` in `src/config.js`.

## Usage

### Live Mode

- Automatically fetches the latest data every 15 seconds
- Shows real-time updates in the metric cards
- Charts accumulate data points as they come in (last 100 points displayed)

### Historical Mode

1. Click "Historical Mode"
2. Select start date and time
3. Select end date and time
4. Click "Load Data"
5. View charts for the selected time range (up to 8000 data points)

## Technology Stack

- **React** - UI framework
- **Vite** - Build tool and dev server
- **Chart.js** - Charting library
- **react-chartjs-2** - React wrapper for Chart.js
- **date-fns** - Date formatting utilities

## Troubleshooting

### No Data Showing

1. Verify your Channel ID and Read API Key in `src/config.js`
2. Check that your ThingSpeak channel is public or the Read API Key has access
3. Verify that data is being sent to the correct field numbers
4. Open browser console (F12) to check for error messages

### CORS Errors

If you encounter CORS errors, you may need to:
- Ensure you're using the Read API Key (not Write API Key)
- Check that your ThingSpeak channel is properly configured
- Consider using a CORS proxy for development (not recommended for production)

### Charts Not Updating

- Check the browser console for errors
- Verify that data is being returned from ThingSpeak API
- Ensure field mappings match your ThingSpeak channel configuration

## License

MIT

