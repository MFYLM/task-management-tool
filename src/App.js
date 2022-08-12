import logo from './logo.svg';
import './App.css';
import Home from './components/Homepage';
import { Routes, Route } from 'react-router-dom';
import ProjectDetail from './components/ProjectDetail';
import LoginPage from './components/Login';

/*
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
      <Home />
    </div>

*/


function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/home" element={<Home />}/>
      <Route path="/home/projectdetail/*" element={<ProjectDetail />}/>
    </Routes>
  );
}

export default App;
