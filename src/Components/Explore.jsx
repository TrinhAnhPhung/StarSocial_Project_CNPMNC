import React from 'react';

const images = [
  {
    src: "https://i.pinimg.com/736x/bb/11/63/bb1163347f853e6e8963bc19e75c5b88.jpg",
    alt: "There's too matcha stress",
  },
  {
    src: "/images/mint.png",
    alt: "Unpeppy mint",
  },
  {
    src: "/images/sauce.png",
    alt: "Don't be sauce-picious",
  },
  {
    src: "/images/popcorn.png",
    alt: "Popcorn with lions",
  },
  {
    src: "/images/dumplings.png",
    alt: "Dumpling cuties",
  },
  {
    src: "/images/cat-dim-sum.png",
    alt: "Cat dim sum",
  },
];

const Explore = () => {
  return (
    <div className="min-h-screen bg-white p-8 flex justify-center items-center">
      <div className="grid grid-cols-3 gap-6 bg-white p-4 rounded-lg">
        {images.map((img, index) => (
          <div key={index} className="bg-gray-100 rounded-lg shadow overflow-hidden">
            <img
              src={img.src}
              alt={img.alt}
              className="object-cover w-full h-full"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Explore;
