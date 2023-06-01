import './App.css';
import * as React from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom";

import Home from './components/pages/Home/Home.component';
import Join from './components/pages/Join/Join.component';
import Room from './components/pages/Room/Room.component';

const App = () => {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route index element={<Home />} />
          <Route path="join" element={<Join />} />
          <Route path="room/:id" element={<Room />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </BrowserRouter>


    </div>
  );
}

export default App;
