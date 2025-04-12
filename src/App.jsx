import { useEffect, useState } from "react";

import {
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
  Route,
} from "react-router-dom";

import ScannerPage from "./pages/ScannerPage";
import HomePage from "./pages/HomePage";
import GeneratorPage from "./pages/GeneratorPage";

function App() {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route path="/" element={<HomePage />} />
        <Route path="/scanner" element={<ScannerPage />} />
        <Route path="/generator" element={<GeneratorPage />} />
      </>
    )
  );

  return <RouterProvider router={router} />;
}

export default App;
