import { Link } from "react-router-dom";
import { routes } from "../router/routes";

export default function Home() {
  const visibleRoutes = routes.filter((route) => !route.hidden);

  const downloadChallengesJSONL = () => {
    const jsonl = visibleRoutes
      .map((route) =>
        JSON.stringify({
          id: route.path,
          title: route.title,
          description: route.description,
          path: route.path,
          password: route.password,
          tags: route.tags,
        })
      )
      .join("\n");

    const blob = new Blob([jsonl], { type: "application/x-jsonlines" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "webgames-v0-challenges.jsonl";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto px-2 py-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-center flex-grow">WebGames</h1>
        <button
          onClick={downloadChallengesJSONL}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-200"
        >
          Download Challenges JSONL
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {visibleRoutes.map((route, index) => (
          <Link
            key={route.path}
            to={route.path}
            className="group flex gap-3 p-3 bg-white hover:bg-gray-50 border border-gray-200 hover:border-blue-500 rounded-md transition-colors duration-200"
          >
            <div className="shrink-0 w-10 flex items-start pt-1">
              <span className="text-2xl" role="img" aria-label={route.title}>
                {route.icon}
              </span>
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-xs font-medium text-gray-400">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h2 className="text-sm font-medium text-gray-900">
                  {route.title}
                </h2>
              </div>
              <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                {route.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
      <footer className="mt-8 text-center text-sm text-gray-500">
        Built by <a href="https://convergence.ai">convergence.ai</a>
      </footer>
    </div>
  );
}
