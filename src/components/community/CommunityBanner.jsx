import React from 'react';

function CommunityBanner() {
  return (
    <div className="h-64 relative">
      <img 
        src="https://i.ibb.co/4R0P38V/Screenshot-1455.png"
        alt="Community Banner"
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-[#030303]" />
      <div className="absolute bottom-0 left-0 right-0 p-8">
        <h1 className="text-4xl font-bold text-white"></h1>
        <p className="text-white/80 mt-2"></p>
      </div>
    </div>
  );
}

export default CommunityBanner;