import './App.css';
import Home from './components/Homepage';
import { Routes, Route } from 'react-router-dom';
import ProjectDetail from './components/ProjectDetail';
import LoginPage from './components/Login';


function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/home" element={<Home />}/>
      <Route path="/home/projectdetail/*" element={<ProjectDetail key={Math.random()}/>}/>
    </Routes>
  );
}


export default App;