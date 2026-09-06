import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./Layout";
import AtomicSimulationPage from "./pages/AtomicSimulationPage";
import BlackHoleSimulatorPage from "./pages/BlackHoleSimulatorPage";
import BubbleUniverseSimulatorPage from "./pages/BubbleUniverseSimulatorPage";
import EarthSimulatorPage from "./pages/EarthSimulatorPage";
import HomePage from "./pages/HomePage";
import JupiterSimulatorPage from "./pages/JupiterSimulatorPage";
import MagnetarSimulatorPage from "./pages/MagnetarSimulatorPage";
import NeutronBinarySimulatorPage from "./pages/NeutronBinarySimulatorPage";
import MarsSimulatorPage from "./pages/MarsSimulatorPage";
import MilkyWaySimulatorPage from "./pages/MilkyWaySimulatorPage";
import NeptuneSimulatorPage from "./pages/NeptuneSimulatorPage";
import SaturnSimulatorPage from "./pages/SaturnSimulatorPage";
import SunSimulatorPage from "./pages/SunSimulatorPage";
import UranusSimulatorPage from "./pages/UranusSimulatorPage";
import VenusSimulatorPage from "./pages/VenusSimulatorPage";

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: "/neutron-binary", element: <NeutronBinarySimulatorPage /> },
      {
        path: "/",
        element: <HomePage />,
      },
      {
        path: "/earth",
        element: <EarthSimulatorPage />,
      },
      {
        path: "/atomic-simulation",
        element: <AtomicSimulationPage />,
      },
      {
        path: "/black-hole",
        element: <BlackHoleSimulatorPage />,
      },
      {
        path: "/bubble-universe",
        element: <BubbleUniverseSimulatorPage />,
      },
      {
        path: "/magnetar",
        element: <MagnetarSimulatorPage />,
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
        path: "/milky-way",
        element: <MilkyWaySimulatorPage />,
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
