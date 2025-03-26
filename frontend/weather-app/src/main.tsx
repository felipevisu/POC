import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ScaleProvider } from './ScaleContext.tsx';

import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ScaleProvider>
      <App />
    </ScaleProvider>
  </StrictMode>
);
