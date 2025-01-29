import React from 'react';

function CommunityBanner() {
  return (
    <div className="h-[50vh] relative">
      <img 
        src="https://mrwallpaper.com/images/hd/minimalist-neon-lights-4k-purple-40k82xyg4n3au9cn.jpg"
        alt="Community Banner"
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-[#030303]" />
      <div className="absolute bottom-0 left-0 right-0 p-4">
      </div>
    </div>
  );
}

export default CommunityBanner;