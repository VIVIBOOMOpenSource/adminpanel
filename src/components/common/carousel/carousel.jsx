import React from 'react';
import './carousel.scss';

// Wrapped children components must be placed inside of <div> elements
function Carousel({ slideTo, children }) {
  const carouselContainerStyle = {
    left: `${((slideTo * 100) - 100) * -1}%`,
    width: `${children.length * 100}%`,
  };

  return (
    <div className="carousel">
      <div style={carouselContainerStyle} className="carousel-container">
        {children.map((child, i) => (
          <div key={`carousel-tab_${i}`} className={i + 1 === slideTo ? 'active' : ''}>
            {child}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Carousel;
