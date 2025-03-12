import React, { useState, useEffect } from "react";
import socket from "../../utils/socket";
import { Quizz } from "../../data/quizzData";

const GameUI: React.FC = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
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

  const handleSelectAnswer = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const handleNextQuestion = () => {
    const isCorrect = selectedAnswer === Quizz.questions[currentQuestionIndex].correctAnswer;
    socket.emit("answer", { room, username, is_correct: isCorrect });

    setSelectedAnswer(null);
    setCurrentQuestionIndex((prev) => prev + 1);
  };

  return (
    <div className="flex flex-col items-center h-screen bg-gray-100 p-6">
      <h2 className="text-2xl font-bold mb-4">Multiplayer Quiz</h2>
      
      {/* Liste des joueurs */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Joueurs :</h3>
        {players.map((player) => (
          <p key={player}>{player} - Score: {scores[player] || 0}</p>
        ))}
      </div>

      {/* Affichage de la question */}
      <div className="bg-white p-4 rounded shadow-lg max-w-lg w-full text-center">
        <p className="text-lg font-semibold">{Quizz.questions[currentQuestionIndex].question}</p>

        {Quizz.questions[currentQuestionIndex].choices && (
          <div className="mt-4">
            {Quizz.questions[currentQuestionIndex].choices.map((choice, index) => (
              <button
                key={index}
                className={`block w-full p-3 my-2 rounded-lg border ${selectedAnswer === choice ? "bg-blue-200 border-blue-500" : "bg-gray-200 border-gray-400"}`}
                onClick={() => handleSelectAnswer(choice)}
              >
                {choice}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Bouton de validation */}
      <button
        className="mt-4 px-6 py-2 bg-yellow-500 text-white rounded-lg disabled:bg-gray-400"
        disabled={!selectedAnswer}
        onClick={handleNextQuestion}
      >
        {currentQuestionIndex < Quizz.questions.length - 1 ? "Next Question" : "Finish Quiz"}
      </button>
    </div>
  );
};

export default GameUI;
