# IoT Air Quality Dashboard

A full-stack React application for monitoring air quality with real-time data visualization, predictive analytics, and alert management.

## 🚀 Features

- **Real-time Monitoring** - Live air quality metrics (SO₂, Temperature, Humidity, AQI, Wind Speed)
- **Predictive Analytics** - AI-powered forecasting with confidence intervals
- **Historical Analysis** - 24-hour trend charts and comparative metrics
- **Alert Management** - Critical event tracking and notifications
- **Responsive Design** - Modern, industrial-themed UI with dark mode support

## 🛠️ Tech Stack

- **Frontend**: React 18, React Router 6, TailwindCSS 3, Radix UI
- **Build Tool**: Vite
- **Testing**: Vitest
- **Package Manager**: npm

## 📦 Project Structure

```
├── client/               # React frontend
│   ├── components/       # Reusable components
│   │   ├── ui/          # UI component library (40+ components)
│   │   └── Layout.jsx   # Main layout with sidebar
│   ├── pages/           # Route pages
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utilities
│   └── global.css       # Global styles
├── public/              # Static assets
├── index.html           # Entry HTML
└── vite.config.ts       # Vite configuration
```

## 🚦 Getting Started

### Prerequisites

- Node.js 18+ 
- npm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:8080` (or the next available port)

### Available Scripts

```bash
npm run dev        # Start development server
npm run build      # Production build
npm run preview    # Preview production build
npm test           # Run tests
npm run format     # Format code with Prettier
```

## 🎨 Design System

The application uses a custom industrial IoT theme with:

- **Status Colors**: Critical, High, Medium, Low, Good
- **Sidebar Navigation**: Collapsible with route highlighting
- **Dark Mode Support**: Defined in CSS variables
- **Responsive Layout**: Mobile-first approach

## 📊 Dashboard Features

### Current Measurements
- SO₂ Level monitoring
- Temperature tracking
- Humidity levels
- Air Quality Index (AQI)
- Wind speed data

### Analytics
- Line charts for historical trends
- Prediction charts with confidence bands
- Real-time data updates
- Event log with severity indicators

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3000
PING_MESSAGE=pong
```

### Vite Configuration

The project uses Vite for fast development and optimized builds. Configuration files:
- `vite.config.ts` - Client build config
- `vite.config.server.ts` - Server build config

## 📱 API Routes
🎯 Development Tips

1. **Add New Pages**: Create in `client/pages/` and add route in `client/App.jsx`
2. **UI Components**: Pre-built components available in `client/components/ui/`
3. **Styling**: Use TailwindCSS utility classes and custom theme variables
4. **State Management**: Use React hooks and context as needed

## 🚀 Production Deployment

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview
```

The build outputs to `dist/` folder as static files. Deploy to any static hosting service:
- Netlify
- Vercel
- GitHub Pages
- AWS S3 + CloudFront
- Any web server
## 📄 License

This project is private and proprietary.

## 🤝 Support

For questions or issues, please contact the development team.
