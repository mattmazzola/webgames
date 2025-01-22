import { createBrowserRouter } from "react-router-dom";
import RequireAuth from "../components/RequireAuth";
import Home from "../pages/Home";
import Login from "../pages/Login";
import { routes } from "./routes";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/",
    element: (
      <RequireAuth>
        <Home />
      </RequireAuth>
    ),
  },
  ...routes.map((route) => ({
    path: route.path,
    element: (
      <RequireAuth>
        <route.component />
      </RequireAuth>
    ),
  })),
]);
