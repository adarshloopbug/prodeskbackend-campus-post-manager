// ==============================================================================
// LOADING COMPONENT
// ==============================================================================
// In fullstack applications, fetching data over the network takes time (latency).
// Instead of leaving the screen blank or freezing the UI, we show a friendly
// loading indicator so the user knows an asynchronous background operation is active.

import React from "react";

function Loading({ message = "Loading posts..." }) {
  return (
    <div className="loading-container" id="loading-spinner">
      <div className="spinner"></div>
      <p className="loading-text">{message}</p>
    </div>
  );
}

export default Loading;
