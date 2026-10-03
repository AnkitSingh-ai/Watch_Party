import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { RoomProvider } from './context/RoomContext';
import Home from './pages/Home';
import Room from './pages/Room';
import Explore from './pages/Explore';
import About from './pages/About';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <BrowserRouter>
      <RoomProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/about" element={<About />} />
          <Route path="/room/:roomCode" element={<Room />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </RoomProvider>
    </BrowserRouter>
  );
}
