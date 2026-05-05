import { useState, useEffect, useMemo } from 'react';
import LiteYouTubeEmbed from 'react-lite-youtube-embed';
import 'react-lite-youtube-embed/dist/LiteYouTubeEmbed.css';

export const GameMedia = ({ screenshotUrls, trailerUrls, walkthroughUrls }) => {
  // Состояние для текущего выбранного медиафайла
  const [activeMedia, setActiveMedia] = useState(null);

  // Собираем все медиафайлы в один массив при изменении пропсов
  const mediaList = useMemo(() => {
    const items = [];

    // 1. Добавляем трейлеры (Видео идут первыми, как в Steam)
    if (trailerUrls) {
      trailerUrls.forEach(id => {
        items.push({
          type: 'video',
          id: id,
          // Ссылка на обложку видео YouTube
          thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
          badge: 'Трейлер'
        });
      });
    }

    // 2. Добавляем прохождения
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

    // 3. Добавляем скриншоты
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

  // Устанавливаем первый элемент активным по умолчанию
  useEffect(() => {
    if (mediaList.length > 0) {
      setActiveMedia(mediaList[0]);
    }
  }, [mediaList]);

  // Если медиафайлов вообще нет, ничего не рендерим
  if (mediaList.length === 0) return null;

  return (
    <div className="bg-gray-900 rounded-xl shadow-2xl overflow-hidden">
      
      {/* --- ГЛАВНЫЙ ЭКРАН (Большой) --- */}
      <div className="w-full aspect-video bg-black relative flex items-center justify-center">
        
        {/* Бейдж с типом контента (Трейлер/Скриншот) */}
        {activeMedia && (
          <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider">
            {activeMedia.badge}
          </div>
        )}

        {/* Рендеринг активного элемента */}
        {activeMedia?.type === 'video' ? (
          <div className="w-full h-full">
            <LiteYouTubeEmbed 
              id={activeMedia.id}
              title={activeMedia.badge}
              wrapperClass="yt-lite w-full h-full"
              playerClass="lty-playbtn"
              poster="maxresdefault" // Загружаем самое высокое качество обложки для большого экрана
              noCookie={true}
              params="modestbranding=1&rel=0&iv_load_policy=3&fs=0&color=white"
            />
          </div>
        ) : (
          <img 
            src={activeMedia?.url} 
            alt="Main Screenshot" 
            className="w-full h-full object-contain cursor-zoom-in"
            onClick={() => window.open(activeMedia?.url, "_blank")}
          />
        )}
      </div>

      {/* --- ЛЕНТА МИНИАТЮР (Как в Steam) --- */}
      <div className="bg-gray-800 p-3 overflow-x-auto flex gap-2 custom-scrollbar">
        {mediaList.map((item, index) => {
          const isActive = activeMedia === item;

          return (
            <div 
              key={index}
              onClick={() => setActiveMedia(item)}
              className={`relative flex-shrink-0 w-32 md:w-40 aspect-video cursor-pointer transition-all duration-200 border-2 rounded-lg overflow-hidden ${
                isActive ? 'border-blue-500 opacity-100' : 'border-transparent opacity-50 hover:opacity-100 hover:border-gray-500'
              }`}
            >
              {/* Миниатюра */}
              <img 
                src={item.thumbnail} 
                alt="thumbnail" 
                className="w-full h-full object-cover"
              />
              
              {/* Иконка Play, если это видео (Steam style) */}
              {item.type === 'video' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <div className="w-8 h-8 bg-black/60 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <span className="text-white text-sm ml-1">▶</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
};