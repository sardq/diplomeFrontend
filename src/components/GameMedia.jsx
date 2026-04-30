export const GameMedia = ({ screenshotUrls, trailerUrl }) => {
  if (!screenshotUrls?.length && !trailerUrl) return null;

  return (
    <div className="space-y-8">
      {screenshotUrls?.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-bold mb-4">Скриншоты</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {screenshotUrls.map((url, i) => (
              <img 
                key={i} 
                src={url} 
                alt="screenshot" 
                className="rounded-lg shadow-sm hover:scale-105 transition-transform duration-300 cursor-zoom-in" 
                onClick={() => window.open(url, "_blank")}
              />
            ))}
          </div>
        </div>
      )}

      {trailerUrl && (
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-bold mb-4">Трейлер</h2>
          <div className="aspect-video w-full overflow-hidden rounded-xl shadow-lg border">
            <video controls className="w-full h-full bg-black">
              <source src={trailerUrl} type="video/mp4" />
              Ваш браузер не поддерживает видео.
            </video>
          </div>
        </div>
      )}
    </div>
  );
};