import { useState } from "react";

const gamesMock = [
  { id: 1, name: "Cyberpunk 2077", rating: 4.6, tags: ["RPG", "Sci-Fi"], poster: "https://upload.wikimedia.org/wikipedia/ru/b/bb/%D0%9E%D0%B1%D0%BB%D0%BE%D0%B6%D0%BA%D0%B0_%D0%BA%D0%BE%D0%BC%D0%BF%D1%8C%D1%8E%D1%82%D0%B5%D1%80%D0%BD%D0%BE%D0%B9_%D0%B8%D0%B3%D1%80%D1%8B_Cyberpunk_2077.jpg" },
  { id: 2, name: "Witcher 3", rating: 4.9, tags: ["Fantasy", "RPG"], poster: "https://upload.wikimedia.org/wikipedia/ru/a/a2/The_Witcher_3-_Wild_Hunt_Cover.jpg" },
  { id: 3, name: "Doom Eternal", rating: 4.8, tags: ["Shooter"], poster: "https://upload.wikimedia.org/wikipedia/ru/8/8c/%D0%9E%D0%B1%D0%BB%D0%BE%D0%B6%D0%BA%D0%B0_Doom_Eternal.jpg" },
  { id: 4, name: "Baldur's Gate 3", rating: 5.0, tags: ["RPG", "Fantasy"], poster: "https://upload.wikimedia.org/wikipedia/ru/d/dc/Baldur%27s_Gate_III_Logo.png" },
  { id: 5, name: "Hades", rating: 4.7, tags: ["Rogue-like"], poster: "https://upload.wikimedia.org/wikipedia/ru/c/cc/Hades_cover_art.jpg" }
];

export default function HomePage() {
  const [query, setQuery] = useState("");

  const filtered = gamesMock.filter(game =>
    game.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100">

      <div className="max-w-6xl mx-auto p-6">

        <div className="mb-8">
          <input
            type="text"
            placeholder=" Поиск игр..."
            className="w-full p-4 rounded-xl border shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <h1 className="text-3xl font-bold mb-6">
          Каталог игр
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">

          {filtered.length === 0 && (
            <p className="col-span-full text-center text-gray-500">
              Ничего не найдено 
            </p>
          )}

          {filtered.map(game => (
            <div
              key={game.id}
              className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden"
            >
              <img
                src={game.poster}
                alt={game.name}
                className="h-48 w-full object-cover"
              />

              <div className="p-4">
                <h2 className="font-semibold text-lg mb-2">
                  {game.name}
                </h2>

                <div className="flex justify-between items-center mb-2">
                  <span className="text-yellow-500 font-bold">
                    ⭐ {game.rating}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {game.tags.map(tag => (
                    <span
                      key={tag}
                      className="text-xs bg-gray-200 px-2 py-1 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}

        </div>
      </div>
    </div>
  );
}