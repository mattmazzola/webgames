import { Link } from "react-router-dom";
import { routes } from "../router/routes";

export default function Home() {
  const visibleRoutes = routes.filter((route) => !route.hidden);

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-4xl font-bold mb-8 text-center">WebVoyager++</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleRoutes.map((route, index) => (
          <Link
            key={route.path}
            to={route.path}
            className="block p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-200 hover:border-blue-500"
          >
            <div className="flex items-center mb-3">
              <span
                className="text-3xl mr-3"
                role="img"
                aria-label={route.title}
              >
                {route.icon}
              </span>
              <h2 className="text-xl font-semibold text-gray-800">
                {index + 1}. {route.title}
              </h2>
            </div>
            <p className="text-gray-600">{route.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
