import { createBrowserRouter } from "react-router-dom";
import LoginPage from "../pages/login";
import DashboardPage from "@/pages/dashboard/dashboard";
import PublicRoute from "./public-route";
import ProtectedRoute from "./protect-route";
import NotFoundPage from "@/pages/404";

export const router = createBrowserRouter([
  {
    element: <PublicRoute />,
    children: [
      {
        path: "/login",
        element: <LoginPage />,
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/",
        element: <DashboardPage />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);