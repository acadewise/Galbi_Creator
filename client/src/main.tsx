import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Analytics initialization for Acadewise 
// This is just a placeholder - replace with actual analytics code
const initAnalytics = () => {
  // Don't track in development mode
  if (process.env.NODE_ENV !== 'production') return;

  // Track pageviews
  const trackPageView = () => {
    if (typeof window !== 'undefined' && window.location) {
      console.log('Page view tracked:', window.location.pathname);
      // Here you would send data to your analytics service
    }
  };

  // Track initial pageview
  trackPageView();

  // Track navigation events
  window.addEventListener('popstate', trackPageView);
};

// Initialize analytics
initAnalytics();

// Render the app
createRoot(document.getElementById("root")!).render(<App />);
