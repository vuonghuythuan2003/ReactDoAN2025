import React from 'react';

const ExampleCarouselImage = ({ text }) => {
    return (
        <div style={{ height: '400px', backgroundColor: '#ddd', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <h2>{text}</h2>
        </div>
    );
};

export default ExampleCarouselImage;
