import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from './siteRouter'
import App from './NexumApp'
import './styles.css'
import './nexum.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
