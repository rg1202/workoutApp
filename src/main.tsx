import React from 'react';
import ReactDOM from 'react-dom/client';
import Root from './Root';
import './styles.css';
import './integrations.css';
import './bjj.css';
import './calendar.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
);
