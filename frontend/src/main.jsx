import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { NextUIProvider } from "@nextui-org/react";
import store from "./store/store.js";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import Register from "./pages/Register.jsx";
import Login from "./pages/Login.jsx";
import Home from "./pages/Home.jsx";
import Upload from "./pages/Upload.jsx";
import VideoPlayerPage from "./pages/VideoPlayerPage.jsx";
import Profile from "./pages/Profile.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Playlist from "./pages/Playlist.jsx";
import Tweet from "./pages/Tweet.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <Login />,
      },
      {
        path: "/users/login",
        element: <Login />,
      },
      {
        path: "/users/sign-up",
        element: <Register />,
      },
      {
        path: "/users/home",
        element: <Home />,
      },
      {
        path: "/users/upload",
        element: <Upload />,
      },
      {
        path: "/videos/:id",
        element: <VideoPlayerPage />,
      },
      {
        path: "/users/profile",
        element: <Profile />,
      },
      {
        path: "/users/dashboard/:username",
        element: <Dashboard />,
      },
      {
        path: "/playlist",
        element: <Playlist />,
      },
      {
        path: "/tweet",
        element: <Tweet />,
      },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <NextUIProvider>
      <main>
        <RouterProvider router={router} />
      </main>
    </NextUIProvider>
  </Provider>
);
