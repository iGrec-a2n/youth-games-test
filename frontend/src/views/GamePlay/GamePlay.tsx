import React, { useState, useEffect } from 'react';
import { resultInitialState } from "../../data/quizzData"; // Assure-toi du bon chemin d'import
import AnswerTimer from '../../components/AnswerTimer/AnswerTimer';
import socket from "../../utils/socket";

import './GamePlay.scss'


interface Question {
  question: string;
  choices?: string[];
  correctAnswer: string;
  type: string;
}

interface GameProps {
  questions: readonly Question[];
}

interface Result {
  score: number;
  correctAnswers: number;
  wrongAnswers: number;
}


const GamePlay: React.FC<GameProps> = ({ questions }) => {
  
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const { question, choices, correctAnswer, type } = questions[currentQuestion];
  const [answerIdx, setAnswerIdx] = useState<number | null>(null);
  const [answer, setAnswer] = useState<boolean | null>(null);
  const [result, setResult] = useState<Result>(resultInitialState);
  const [showResult, setShowResult] = useState<boolean>(false);
  const [showAnswerTimer, setShowAnswerTimer] = useState<boolean>(true);
  const [inputAnswer, setInputAnswer] = useState<string>('');
  const [players, setPlayers] = useState<string[]>([]);
  const [scores, setScores] = useState<{ [key: string]: number }>({});

  const room = "room1"; // ID de la salle (modifiable)
  const username = "Player" + Math.floor(Math.random() * 1000); // Générer un pseudo aléatoire
  
  useEffect(() => {
    socket.emit("join_game", { room, username });
  
    socket.on("player_joined", (data) => {
      setPlayers(data.players);
    });
  
    socket.on("update_scores", (data) => {
      setScores(data.players);
    });
  
    return () => {
      socket.disconnect();
    };
  }, []);
  
  const onAnswerClick = (choice: string, index: number) => {
    setAnswerIdx(index);
    setAnswer(choice === correctAnswer);
  };
  
  const onClickNext = (finalAnswer: boolean | null) => {
    setAnswerIdx(null);
    setShowAnswerTimer(false);
    setResult(prevResult => finalAnswer ? 
      {
        ...prevResult,
        score: prevResult.score + 5,
        correctAnswers: prevResult.correctAnswers + 1,
      } 
      : 
      {
        ...prevResult,
        wrongAnswers: prevResult.wrongAnswers + 1,
      }
    );

    if (currentQuestion !== questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      setCurrentQuestion(0);
      setShowResult(true);
    }

    setTimeout(() => {
      setShowAnswerTimer(true);
    });
  };

  const onTryAgain = () => {
    setResult(resultInitialState);
    setShowResult(false);
  };

  const handleTimeUp = () => {
    setAnswer(false);
    onClickNext(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputAnswer(e.target.value);
    setAnswer(e.target.value.toLowerCase() === correctAnswer);
  };

  const getAnswerUI = () => {
    if (type === 'FIB') {
      return <input type='text' value={inputAnswer} onChange={handleInputChange} />;
    }
    return (
      <ul>
        {choices?.map((choice, index) => (
          <li key={index} 
              onClick={() => onAnswerClick(choice, index)}
              className={answerIdx === index ? 'selected-answer' : ''}>
              {choice}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className='quiz-container'>
      {!showResult ? (
        <>
          {showAnswerTimer && <AnswerTimer key={currentQuestion} duration={10} onTimeUp={handleTimeUp} />}        
          <span className='active-question-no'>{currentQuestion + 1}</span>
          <span className='total-question'>/{questions.length}</span>

          <h2>{question}</h2>
          {getAnswerUI()}
          <div className='footer'>
            <button onClick={() => onClickNext(answer)} disabled={answerIdx === null && !inputAnswer}>
              {currentQuestion === questions.length - 1 ? 'Finish' : 'Next'}
            </button>
          </div>
        </>
      ) : (
        <div className='result'>
          <h3>Result</h3>
          <p>Total Questions: <span>{questions.length}</span></p>
          <p>Total Score: <span>{result.score}</span></p>
          <p>Correct Answers: <span>{result.correctAnswers}</span></p>
          <p>Wrong Answers: <span>{result.wrongAnswers}</span></p>
          <button onClick={onTryAgain}>Try again</button>
        </div>
      )}
    </div>
  );
};

export default GamePlay;