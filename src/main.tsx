import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { injectSpeedInsights } from '@vercel/speed-insights';
import { ensureSupabaseReady } from './lib/supabase';
import { redirectBareDomainToWww } from './lib/siteOrigin';
import App from './App.tsx';
import ErrorBoundary from './components/ErrorBoundary.tsx';
import LenisProvider from './providers/LenisProvider.tsx';
import './index.css';

injectSpeedInsights();

redirectBareDomainToWww();

ensureSupabaseReady().finally(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <ErrorBoundary>
        <LenisProvider>
          <App />
        </LenisProvider>
      </ErrorBoundary>
    </StrictMode>,
  );
});
