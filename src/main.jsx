import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { CharacterCreationProvider } from './hooks/useCharacterCreation.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <CharacterCreationProvider>
        <App />
      </CharacterCreationProvider>
    </BrowserRouter>
  </StrictMode>,
)
