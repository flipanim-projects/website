import * as React from 'react';
import * as ReactDOM from 'react-dom';
import './app/css/stylesheet.css';
import Home from './app/Home';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Browse, Follows } from './pages/index'
import Navbar from './components/Navbar'
ReactDOM.render(
  <div>
    <Navbar>
    <Router>
      <Routes>
        <Route path="/browse" element={<Browse />} />
        <Route path="/follows" element={<Follows />} />
      </Routes>
    </Router>
    </Navbar>
    <Home />
  </div>,
  document.getElementById('root')
);
