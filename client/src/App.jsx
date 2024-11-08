import HomePage from "./router/homePage/homePage";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ListPage from "./router/listPage/listPage";
import { Layout, RequireAuth } from "./router/layout/layout";
import SinglePage from "./router/singlePage/singlePage.jsx";
import ProfilePage from "./router/profilePage/profilePage.jsx";
import ProfileUpdatePage from "./router/profileUpdatePage/profileUpdatePage.jsx";
import Register from "./router/register/register.jsx";
import NewPostPage from "./router/newPostPage/NewPostPage.jsx";
import Login from "./router/login/login.jsx";
import {
  listPageLoader,
  profilePageLoader,
  singlePageLoader,
} from "./lib/loader.js";

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      children: [
        {
          path: "/",
          element: <HomePage />,
        },
        {
          path: "/login",
          element: <Login />,
        },
        {
          path: "/register",
          element: <Register />,
        },
        {
          path: "/list",
          element: <ListPage />,
          loader: listPageLoader,
        },
        {
          path: "/:id",
          element: <SinglePage />,
          loader: singlePageLoader,
        },
      ],
    },
    {
      path: "/",
      element: <RequireAuth />,
      children: [
        {
          path: "/profile",
          element: <ProfilePage />,
          loader: profilePageLoader,
        },
        {
          path: "/profile/update",
          element: <ProfileUpdatePage />,
        },
        {
          path: "/add",
          element: <NewPostPage />,
        },
      ],
    },
  ]);
  return <RouterProvider router={router} />;
}

export default App;
