import React from 'react';

/**
 * LoadingSpinner
 * A reusable animated loader styled like a rotating planet with rings.
 * Suitable for inline usage.
 */
const LoadingSpinner = () => {
  return (
    <div className="planet-spinner">
      <div className="circular_ring circular_ring-1" />
      <div className="circular_ring circular_ring-2" />
      <div className="planet" />
    </div>
  );
};

/**
 * FullPageLoader
 * Displays the LoadingSpinner centered on the screen.
 * Best for page-level or full-screen loading states.
 */
const FullPageLoader = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <LoadingSpinner />
    </div>
  );
};

export { LoadingSpinner, FullPageLoader };
