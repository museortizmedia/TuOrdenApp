import { useState, useEffect, useRef } from 'react';

const ImageSlider = ({
  images,
  height = 'h-[300px]',
  autoSlideInterval = 5000,
  className = '',
}) => {
  const [current, setCurrent] = useState(0);
  const intervalRef = useRef(null);

  const startAutoSlide = () => {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, autoSlideInterval);
  };

  useEffect(() => {
    startAutoSlide();
    return () => clearInterval(intervalRef.current);
  }, [images.length, autoSlideInterval]);

  const handleNext = () => {
    setCurrent((prev) => (prev + 1) % images.length);
    startAutoSlide();
  };

  const handlePrev = () => {
    setCurrent((prev) => (prev - 1 + images.length) % images.length);
    startAutoSlide();
  };

  if (!images || images.length === 0) return null;

  return (
    <div className={`w-full overflow-hidden relative ${height} ${className}`}>
      <div
        className="flex transition-transform duration-500"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {images.map((img, index) => (
          <div key={index} className="w-full flex-shrink-0 h-full">
            <img
              src={img.image}
              alt={`Slide ${index}`}
              className="w-full h-full object-cover block"
            />
          </div>
        ))}
      </div>

      {/* Flechas de navegación */}
      { images.length > 1 && (<>
      <button
        onClick={handlePrev}
        className="absolute top-0 bottom-0 left-2 my-auto bg-black bg-opacity-50 text-white rounded-full w-8 h-8 flex items-center justify-center cursor-pointer hover:scale-105"
      >
        ‹
      </button>
      <button
        onClick={handleNext}
        className="absolute top-0 bottom-0 right-2 my-auto bg-black bg-opacity-50 text-white rounded-full w-8 h-8 flex items-center justify-center cursor-pointer hover:scale-105"
      >
        ›
      </button>
      </>)}
    </div>
  );
};

export default ImageSlider;