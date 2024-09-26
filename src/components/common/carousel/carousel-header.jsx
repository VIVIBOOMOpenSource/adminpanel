import React from 'react';
import './carousel-header.scss';

function CarouselHeader({ slideTo, className, children }) {
  return (
    <ul className={`carousel-header ${className || ''}`}>
      {children.map((child, i) => (
        <div key={`carousel-header_${i}`} className={i + 1 === slideTo ? 'active' : ''}>
          {child}
        </div>
      ))}
    </ul>
  );
}

export default CarouselHeader;
