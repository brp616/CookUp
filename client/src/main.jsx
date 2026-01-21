import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { GoogleOAuthProvider } from '@react-oauth/google';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="767423546462-cm07ka28nl4i05nm86c91ldqmuptg3qt.apps.googleusercontent.com">
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
)

import "./styles/variables.css";  // Import CSS variables
import "./styles/Layout.css";     // Import CSS layout
