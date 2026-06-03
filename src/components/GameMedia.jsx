import { useState, useEffect, useMemo } from 'react';
import LiteYouTubeEmbed from 'react-lite-youtube-embed';
import 'react-lite-youtube-embed/dist/LiteYouTubeEmbed.css';

export const GameMedia = ({ screenshotUrls, trailerUrls, walkthroughUrls }) => {
  const [activeMedia, setActiveMedia] = useState(null);

  const mediaList = useMemo(() => {
    const items = [];
    if (trailerUrls) {
      trailerUrls.forEach(id => {
        items.push({
          type: 'video',
          id: id,
          thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
          badge: 'Трейлер'
        });
      });
    }
    if (walkthroughUrls) {
      walkthroughUrls.forEach(id => {
        items.push({
          type: 'video',
          id: id,
          thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
          badge: 'Прохождение'
        });
      });
    }
    if (screenshotUrls) {
      screenshotUrls.forEach(url => {
        items.push({
          type: 'image',
          url: url,
          thumbnail: url,
          badge: 'Скриншот'
        });
      });
    }
    return items;
  }, [screenshotUrls, trailerUrls, walkthroughUrls]);

  useEffect(() => {
    if (mediaList.length > 0) {
      setActiveMedia(mediaList[0]);
    }
  }, [mediaList]);

  if (mediaList.length === 0) return null;

  return (
    <div className="bg-black rounded-[2rem] overflow-hidden border border-gray-800">
      
      <div className="w-full h-[350px] md:h-[500px] lg:h-[600px] bg-black relative flex items-center justify-center overflow-hidden">
        
        {activeMedia && (
          <div className="absolute top-6 left-6 z-10 bg-purple-600/90 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg">
            {activeMedia.badge}
          </div>
        )}

        {activeMedia?.type === 'video' ? (
          <div className="w-full h-full animate-fade-in">
            <LiteYouTubeEmbed 
              id={activeMedia.id}
              title={activeMedia.badge}
              wrapperClass="yt-lite w-full h-full flex items-center"
              playerClass="lty-playbtn"
              poster="maxresdefault"
              noCookie={true}
              params="modestbranding=1&rel=0&iv_load_policy=3&fs=1&color=white"
            />
          </div>
        ) : (
          <img 
            src={activeMedia?.url} 
            alt="Main Screenshot" 
            className="w-full h-full object-contain animate-fade-in cursor-zoom-in"
            onClick={() => window.open(activeMedia?.url, "_blank")}
          />
        )}
      </div>

      <div className="bg-[#1a1a1a] p-4 flex gap-3 overflow-x-auto custom-scrollbar border-t border-gray-800">
        {mediaList.map((item, index) => {
          const isActive = activeMedia === item;

          return (
            <div 
              key={index}
              onClick={() => setActiveMedia(item)}
              className={`relative flex-shrink-0 w-28 md:w-36 aspect-video cursor-pointer transition-all duration-300 rounded-xl overflow-hidden border-2 ${
                isActive 
                  ? 'border-purple-500 scale-105 z-10' 
                  : 'border-transparent opacity-40 hover:opacity-100 hover:border-gray-600'
              }`}
            >
              <img 
                src={item.thumbnail} 
                alt="thumbnail" 
                className="w-full h-full object-cover"
              />
              
              {item.type === 'video' && (
                <div className="absolute inset-0 flex items-center justify-center bg-purple-900/20">
                  <div className="w-7 h-7 bg-black/80 rounded-full flex items-center justify-center border border-white/20">
                    <span className="text-white text-[10px] ml-0.5">▶</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <style>{`
        .animate-fade-in { animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .custom-scrollbar::-webkit-scrollbar { height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
      `}</style>
    </div>
  );
};