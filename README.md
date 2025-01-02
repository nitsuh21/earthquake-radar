# 🌍 Earthquake Radar

A real-time earthquake monitoring application built with Next.js 13, TypeScript, and Mapbox GL JS. Track seismic activity worldwide, receive alerts for significant earthquakes, and view detailed earthquake information with an interactive map interface.

URL: https://earthquake-radar.vercel.app 

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
```

```bash
git clone https://github.com/yourusername/eq_radar.git
cd eq_radar

npm install
# or
yarn install

npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🛠️ Built With

- **Framework**: [Next.js 13](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Mapping**: [Mapbox GL JS](https://www.mapbox.com/mapbox-gl-js)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Data Source**: [USGS Earthquake API](https://earthquake.usgs.gov/fdsnws/event/1/)
- **Date Handling**: [date-fns](https://date-fns.org/)

## 📱 Features Breakdown

### Home Page
- Interactive map showing recent earthquakes
- List view of earthquakes with sorting and filtering
- Search functionality by location
- Magnitude filter (All, M4.0+, M5.0+, M6.0+)

### Earthquake Details
- Comprehensive information about each earthquake
- Location details with coordinates
- Magnitude and depth information
- Tsunami warning indicators
- Interactive map focused on the earthquake location

### Alerts Page
- Real-time notifications for significant earthquakes
- Risk assessment based on recent seismic activity
- Location-based alerts
- Push notification support

## 🔒 Privacy

The application requests location access to:
- Show earthquakes in your vicinity
- Provide relevant alerts
- Calculate distance from seismic events

Location data is used only within the browser and is not stored on any server.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [USGS](https://www.usgs.gov/) for providing earthquake data
- [Mapbox](https://www.mapbox.com/) for mapping capabilities
- [Next.js](https://nextjs.org/) team for the amazing framework
