import { useParams } from "react-router-dom";

const mockGame = {
  id: 1,
  name: "Cyberpunk 2077",
  description: "Описание игры",
  tags: ["RPG","Open World","Sci-Fi"],
  platforms: ["PC","PS5","Xbox"],
  rating: 4.6,
  poster: "https://upload.wikimedia.org/wikipedia/ru/b/bb/%D0%9E%D0%B1%D0%BB%D0%BE%D0%B6%D0%BA%D0%B0_%D0%BA%D0%BE%D0%BC%D0%BF%D1%8C%D1%8E%D1%82%D0%B5%D1%80%D0%BD%D0%BE%D0%B9_%D0%B8%D0%B3%D1%80%D1%8B_Cyberpunk_2077.jpg"
};

export default function GameDetailsPage() {
  const { id } = useParams();

  const game = mockGame;

  return (
    <div className="p-6 flex gap-6">
      <img src={game.poster} alt={game.name} className="w-72 rounded" />

      <div>
        <h1 className="text-3xl font-bold">{game.name}</h1>
        <p className="mt-2 text-gray-700">{game.description}</p>

        <p className="mt-4 font-semibold">Теги:</p>
        <div className="flex flex-wrap gap-2">
          {game.tags.map(t => (
            <span key={t} className="bg-gray-200 px-2 py-1 text-sm rounded">{t}</span>
          ))}
        </div>

        <p className="mt-4 font-semibold">Платформы:</p>
        <p>{game.platforms.join(", ")}</p>

        <button className="mt-4 px-4 py-2 bg-yellow-500 text-white rounded">
          Добавить в избранное (заглушка)
        </button>
      </div>
    </div>
  );
}