import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.scss';
import SignUp from './views/SignUp/SignUp';
import Quiz from './Quizz/Quizz';
import LoginPage from './views/SignIn/SignIn';
import Home from './views/Home/Home';

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          {/* Route pour la page d'inscription */}
          <Route path="/signup" element={<SignUp />} />

          {/* Route pour la page de connexion */}
          <Route path="/login" element={<LoginPage />} />

          {/* Route pour la page de quiz */}
          <Route path="/quiz" element={<Quiz />} />

          {/* Page d'accueil ou route par défaut */}
          <Route path="/" element={<Home />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
