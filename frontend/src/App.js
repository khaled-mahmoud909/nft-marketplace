import React from "react";
import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import Home from "./pages/Home/Home";
import Profile from "./pages/Profile/Profile";
import Mint from "./pages/Mint/Mint";
import NFTDetail from "./pages/NFTDetail/NFTDetail";

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/mint" element={<Mint />} />
        <Route path="/nft/:tokenId" element={<NFTDetail />} />
      </Routes>
    </div>
  );
}

export default App;