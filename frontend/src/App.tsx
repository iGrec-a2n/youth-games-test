import './App.scss'
import GamePlay from './views/GamePlay/GamePlay'
import GameUI from './views/GameUI/GameUI'
// import SignUp from './views/SignUp/SignUp'
import {Quizz} from './data/quizzData';

const App: React.FC = () => {

  return (
    <div className="App">
      {/* <SignUp /> */}
      <GameUI />
      {/* <GamePlay questions={Quizz.questions}/> */}
    </div>
  )
};

export default App;
