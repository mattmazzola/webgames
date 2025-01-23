import { Link } from "react-router-dom";
import Balancer from "react-wrap-balancer";
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
    <div>
      <div className="bg-gradient-to-b from-blue-50 to-white border-b border-gray-200/50">
        <div className="container mx-auto px-2 py-12">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
            <h1 className="text-6xl font-bold bg-gradient-to-br from-gray-900 to-gray-600 bg-clip-text text-transparent">
              WebGames
            </h1>
            <button
              onClick={downloadChallengesJSONL}
              className="hidden sm:block px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              ↓ Download Challenges
            </button>
          </div>
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-2xl text-gray-600 mb-6">
              <span className="sm:hidden">
                <Balancer>
                  Welcome to WebGames - a collection of challenges designed for
                  testing general-purpose web-browsing AI agents.
                </Balancer>
              </span>
              <span className="hidden sm:inline">
                Welcome to WebGames - a collection of challenges designed for
                testing general-purpose web-browsing AI agents.
              </span>
            </p>
            <p className="text-xl text-gray-500 mb-8">
              <span className="sm:hidden">
                <Balancer>
                  These challenges are easy for humans but hard for AI agents to
                  complete. Each task provides a unique password to indicate
                  successful completion.
                </Balancer>
              </span>
              <span className="hidden sm:inline">
                These challenges are easy for humans but hard for AI agents to
                complete. Each task provides a unique password to indicate
                successful completion.
              </span>
            </p>
            <p className="text-2xl font-medium text-gray-700 mb-8">
              <span className="sm:hidden">
                <Balancer>Let the WebGames begin!</Balancer>
              </span>
              <span className="hidden sm:inline">Let the WebGames begin!</span>
            </p>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-2 py-4">
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
    </div>
  );
}
