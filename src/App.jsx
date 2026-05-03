import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./Layout";
import EarthSimulatorPage from "./pages/EarthSimulatorPage";
import HomePage from "./pages/HomePage";
import JupiterSimulatorPage from "./pages/JupiterSimulatorPage";

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <HomePage />,
      },
      {
        path: "/earth",
        element: <EarthSimulatorPage />,
      },
      {
        path: "/jupiter",
        element: <JupiterSimulatorPage />,
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
