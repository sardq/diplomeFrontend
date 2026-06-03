import React from 'react';

export const GameNews = ({ articles }) => {
  if (!articles || articles.length === 0) return null;

  return (
    <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-white">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <span className="text-blue-500 font-black text-[10px] uppercase tracking-[0.2em] mb-2 block">
            Свежая повестка
          </span>
          <h2 className="text-3xl font-black text-gray-900 tracking-tighter flex items-center gap-3">
            Новости по игре
          </h2>
        </div>
        <p className="text-gray-400 text-xs font-medium max-w-xs md:text-right">
          Мы подобрали самые актуальные статьи, чтобы вы были в курсе обновлений
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {articles.map((article, i) => (
          <a 
            key={i} 
            href={article.url} 
            target="_blank" 
            rel="noreferrer"
            className="group flex flex-col h-full bg-gray-50/50 rounded-[2rem] overflow-hidden border border-transparent hover:border-blue-100 hover:bg-white hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
          >
            <div className="relative h-48 w-full overflow-hidden">
              <img 
                src={article.urlToImage || 'https://via.placeholder.com/400x250?text=News'} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                alt={article.title}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>

            <div className="p-6 flex flex-col flex-1">
              <h4 className="font-black text-gray-900 leading-tight group-hover:text-blue-600 transition-colors line-clamp-2 mb-3">
                {article.title}
              </h4>
              <p className="text-gray-500 text-xs leading-relaxed line-clamp-3 mb-6">
                {article.description || "Нажмите, чтобы прочитать подробнее об этом событии в источнике..."}
              </p>
              
              <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100">
                <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">
                  Читать источник
                </span>
                <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  →
                </span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};