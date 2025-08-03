import React from 'react';

const images = [
  {
    src: "https://i.pinimg.com/736x/bb/11/63/bb1163347f853e6e8963bc19e75c5b88.jpg",
    alt: "There's too matcha stress",
  },
  {
    src: "https://i.pinimg.com/736x/29/68/bd/2968bde39e0e390c767f6b8c0d35bf39.jpg",
    alt: "Unpeppy mint",
  },
  {
    src: "https://i.pinimg.com/736x/d4/7b/bb/d47bbb51c69715a86d65b8e517686629.jpg",
    alt: "Don't be sauce-picious",
  },
  {
    src: "https://i.pinimg.com/1200x/b1/b0/88/b1b0888af2a580139bd211bbfdeb1db6.jpg",
    alt: "Popcorn with lions",
  },
  {
    src: "https://i.pinimg.com/736x/a0/0a/c5/a00ac5885e3f867e548a9671ba33435f.jpg",
    alt: "Dumpling cuties",
  },
  {
    src: "https://i.pinimg.com/1200x/03/f6/60/03f660a93a49b886aa6871546c4b2bc5.jpg",
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
