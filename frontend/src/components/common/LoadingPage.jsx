import React from 'react';
import './LoadingPage.css';

export default function LoadingPage({ message = 'Chargement...' }) {
  return (
    <div className="loading-page">
      <div className="loading-content">
        <div className="loading-logo">
          TRY<span>ON</span>
        </div>

        <div className="loading-spinner">
          <span />
          <span />
          <span />
        </div>

        <p className="loading-message">{message}</p>
      </div>
    </div>
  );
}
