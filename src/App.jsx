import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./Layout";
import EarthSimulatorPage from "./pages/EarthSimulatorPage";
import HomePage from "./pages/HomePage";
import JupiterSimulatorPage from "./pages/JupiterSimulatorPage";
import SaturnSimulatorPage from "./pages/SaturnSimulatorPage";
import SunSimulatorPage from "./pages/SunSimulatorPage";

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
      {
        path: "/saturn",
        element: <SaturnSimulatorPage />,
      },
      {
        path: "/sun",
        element: <SunSimulatorPage />,
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
