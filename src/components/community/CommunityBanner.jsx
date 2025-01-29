import React from 'react';

function CommunityBanner() {
  return (
    <div className="h-[35vh] relative">
      <img 
        src="https://mrwallpaper.com/images/hd/minimalist-neon-lights-4k-purple-40k82xyg4n3au9cn.jpg"
        alt="Community Banner"
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black" />
    </div>
  );
}

export default CommunityBanner;
