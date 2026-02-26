import { StrictMode } from 'react'
import { scan } from 'react-scan';
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

scan({
  enabled: true,
  log: true,
  animationSpeed: "slow",
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
