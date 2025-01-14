import { createBrowserRouter } from "react-router-dom";
import Layout from "../components/Layout";
import Home from "../pages/Home";
import { routes } from "./routes";

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      ...routes.map((route) => ({
        path: route.path,
        element: <route.component />,
      })),
    ],
  },
]);
