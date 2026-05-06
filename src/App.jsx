import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./Layout";
import BlackHoleSimulatorPage from "./pages/BlackHoleSimulatorPage";
import EarthSimulatorPage from "./pages/EarthSimulatorPage";
import HomePage from "./pages/HomePage";
import JupiterSimulatorPage from "./pages/JupiterSimulatorPage";
import MarsSimulatorPage from "./pages/MarsSimulatorPage";
import NeptuneSimulatorPage from "./pages/NeptuneSimulatorPage";
import SaturnSimulatorPage from "./pages/SaturnSimulatorPage";
import SunSimulatorPage from "./pages/SunSimulatorPage";
import UranusSimulatorPage from "./pages/UranusSimulatorPage";
import VenusSimulatorPage from "./pages/VenusSimulatorPage";

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
        path: "/black-hole",
        element: <BlackHoleSimulatorPage />,
      },
      {
        path: "/venus",
        element: <VenusSimulatorPage />,
      },
      {
        path: "/uranus",
        element: <UranusSimulatorPage />,
      },
      {
        path: "/jupiter",
        element: <JupiterSimulatorPage />,
      },
      {
        path: "/mars",
        element: <MarsSimulatorPage />,
      },
      {
        path: "/saturn",
        element: <SaturnSimulatorPage />,
      },
      {
        path: "/neptune",
        element: <NeptuneSimulatorPage />,
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
