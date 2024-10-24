import React from 'react';
import ReactDOM from 'react-dom/client'; // Import createRoot
import './index.css'; // Ensure you have Tailwind CSS or any required styles
import App from './App';
import { BrowserRouter } from 'react-router-dom';

// Create the root and render the App component
const root = ReactDOM.createRoot(document.getElementById('root')); // Create a root

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
