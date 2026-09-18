import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/italiana'
import '@fontsource/pinyon-script'
import '@fontsource-variable/jost'
import './index.css'
import './immersif.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
