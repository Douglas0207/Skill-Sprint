 // src/components/LoadingSpinner.js

import React from 'react';
import './LoadingSpinner.css'; // Optional, only if you want to style it

const LoadingSpinner = () => {
  return (
    <div className="loading-spinner">
      <div className="spinner" />
      <p>Loading...</p>
    </div>
  );
};

export default LoadingSpinner;
