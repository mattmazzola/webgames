import { Link } from "react-router-dom";
import { routes } from "../router/routes";

export default function Home() {
  const visibleRoutes = routes.filter((route) => !route.hidden);

  return (
    <div className="container mx-auto px-2 py-4">
      <h1 className="text-3xl font-bold mb-6 text-center">WebVoyager++</h1>
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
