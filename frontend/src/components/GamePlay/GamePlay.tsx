import React from 'react'
import Header from '../Header/Header'
import './GamePlay.scss'

interface GamePlayProps {
  questions: string[];
  answers: string[];
  correctAnswer: string;
  score: number;
  setScore: React.Dispatch<React.SetStateAction<number>>;
  setGamePlay: React.Dispatch<React.SetStateAction<boolean>>;
}


const GamePlay: React.FC<GamePlayProps>= () => {
  return (
    <div>      
      <Header titlePage='Ranking' descriptionPage='Discover your'>
        <div className='progress-bar-container'>
          <div className='progress-bar-fill'></div>
          <p className='pagination'></p>
        </div>
      </Header>
    </div>
  )
}

export default GamePlay