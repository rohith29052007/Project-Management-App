import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { store } from './app/store.js'
import { Provider } from 'react-redux'
import { ClerkProvider } from '@clerk/clerk-react'

// Import your Publishable Key (optional - can use placeholder for development)
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || 'pk_test_placeholder'

// Wrap app with ClerkProvider only if key is provided, otherwise use placeholder
const AppWrapper = PUBLISHABLE_KEY && PUBLISHABLE_KEY !== 'pk_test_placeholder' 
  ? ({ children }) => <ClerkProvider publishableKey={PUBLISHABLE_KEY}>{children}</ClerkProvider>
  : ({ children }) => <>{children}</>

createRoot(document.getElementById('root')).render(
    <BrowserRouter>
      <AppWrapper>
        <Provider store={store}>
                <App />
            </Provider>
      </AppWrapper>          
    </BrowserRouter>,
)