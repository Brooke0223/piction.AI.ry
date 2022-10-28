import React from 'react';

import Game from './components/Game';
import Join from './components/Join';

//I don't think I need Router/Route/Routes/BrowserRouter though because I'm not sending users to any other pages?
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

const App = () => {
  return (
    <Router>
        <Routes>
            <Route path="/" exact element={ <Join/> } />
            <Route path="/game" element={ <Game/> } />
        </Routes>
    </Router>
  );
}

export default App;