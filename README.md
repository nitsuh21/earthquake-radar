# 🌍 Earthquake Radar

A real-time earthquake monitoring application built with Next.js 13, TypeScript, and Mapbox GL JS. Track seismic activity worldwide, receive alerts for significant earthquakes, and view detailed earthquake information with an interactive map interface.

## ✨ Features

- **Real-time Earthquake Tracking**: Monitor global seismic activity using USGS data
- **Interactive Map**: Visual representation of earthquakes with magnitude-based markers
- **Search & Filter**: Find earthquakes by location and magnitude
- **Detailed Information**: View comprehensive details about each earthquake event
- **Alerts System**: Get notifications for significant earthquakes (M4.5+)
- **Mobile Responsive**: Fully responsive design for all devices
- **Dark Mode Map**: Easy-to-read dark themed map

## 🚀 Getting Started

### Prerequisites

- Node.js 16.8 or later
- npm or yarn
- Mapbox API key

### Environment Setup

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token_here

git clone https://github.com/yourusername/eq_radar.git
cd eq_radar

npm install
# or
yarn install

npm run dev
# or
yarn dev