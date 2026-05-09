export const GameNews = ({ articles }) => {
  if (!articles || articles.length === 0) return null;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        📰 Последние новости
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {articles.map((article, i) => (
          <a 
            key={i} 
            href={article.url} 
            target="_blank" 
            rel="noreferrer"
            className="group flex flex-col gap-3"
          >
            <img 
              src={article.urlToImage || 'https://via.placeholder.com/300x200'} 
              className="h-40 w-full object-cover rounded-lg group-hover:opacity-80 transition"
              alt=""
            />
            <div>
              <h4 className="font-bold text-sm text-gray-900 group-hover:text-blue-600 line-clamp-2">
                {article.title}
              </h4>
              <p className="text-xs text-gray-500 mt-1 line-clamp-3">
                {article.description}
              </p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};