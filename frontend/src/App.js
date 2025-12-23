import React from "react";
import { Route, Router, Routes } from "react-router-dom";
import { Web3Provider } from "./contexts/Web3Context";
import Navbar from "./components/Navbar/Navbar";
import Home from "./pages/Home/Home";
import Profile from "./pages/Profile/Profile";
import Mint from "./pages/Mint/Mint";

function App() {
  return (
    <Web3Provider>
      <Router>
        <div className="min-h-screen bg-gray-100">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/mint" element={<Mint />} />
          </Routes>
        </div>
      </Router>
    </Web3Provider>
  );
}

export default App;