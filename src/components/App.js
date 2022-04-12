/** @format */

import React from "react";
import { HashRouter, Link, Route, Routes } from "react-router-dom";
import Features from "./Features";
import Scenarios from "./Scenarios";
import Steps from "./Steps";

const App = () => {
  return (
    <HashRouter>
      <div className='App'>
        <Routes>
          <Route exact path='/' element={<Features />} />
          <Route exact path='/scenarios' element={<Scenarios />} />
          <Route exact path='/steps' element={<Steps />} />
        </Routes>
      </div>
    </HashRouter>
  );
};

export default App;
