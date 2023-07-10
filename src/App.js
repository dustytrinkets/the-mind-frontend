import './App.css';
import * as React from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom";

import Home from './components/pages/Home/Home.component';
import Room from './components/pages/Room/Room.component';
import Game from './components/pages/Game/Game.component';

const App = () => {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route index element={<Home />} />
          <Route path="room/:id" element={<Room />} />
          <Route path="room/:id/game/:id" element={<Game />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </BrowserRouter>


    </div>
  );
}

export default App;
