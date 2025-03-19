import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import socket from "../../socket";  

interface Question {
  _id: string;
  question: string;
  options: string[];
  points: number;
}

interface PlayerScore {
  username: string;
  score: number;
}

const Quiz = () => {
  const  roomCode  = "VGQZCN";
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [player, setPlayer] = useState<string>('');
  const [isFinished, setIsFinished] = useState(false); 
  const [finalScores, setFinalScores] = useState<PlayerScore[]>([]); 

  useEffect(() => {
    socket.on("quiz_started", (data: { questions: Question[] }) => {
      if (data.questions && data.questions.length > 0) {
        console.log("Questions reçues du serveur :", data.questions); // Vérifier les données reçues
        setQuestions(data.questions);
        setIsStarted(true);
      } else {
        console.log("Aucune question reçue.");
      }
    });
  
    socket.on("score_updated", (data) => {
      if (data.user_id === localStorage.getItem('user_id')) {
        console.log(data.new_score);
        
        setScore(data.new_score);
      }
    });
  
    socket.on("player_joined", (data) => {
      alert(`Bienvenue ${data.username}, vous avez rejoint la salle !`);
      setPlayer(data.username);
    });
  
    socket.on("end_room", (data: { player_scores: PlayerScore[] }) => {
      setFinalScores(data.player_scores);
      setIsFinished(true);
    });
  
    socket.on("error", (data: { message: string }) => {
      alert(data.message);
    });
  
    return () => {
      socket.off("quiz_started");
      socket.off("player_joined");
      socket.off("error");
      socket.off("score_updated");
      socket.off("end_room");
    };
  }, []);
  

  const Send_answer = (answer: string) => {
    socket.emit('receive_answer', {
      room_code: roomCode,
      question: questions[currentQuestion]._id,
      answer: answer 
    });

    // ✅ Passer immédiatement à la question suivante
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setIsFinished(true); // ✅ Fin du quiz
    }
  };

  return (
    <div>
      <h1>Joueur: {player}</h1>
      <h1>Score: {score}</h1>
      
      {isFinished ? (
        <div>
          <h2>🎉 Quiz terminé ! 🎉</h2>
          <h3>🏆 Classement des joueurs :</h3>
          <ul>
            {finalScores.map((p, index) => (
              <li key={index}>
                {p.username} - {p.score} points
              </li>
            ))}
          </ul>
        </div>
      ) : isStarted ? (
        <div>
          <h3>{questions[currentQuestion]?.question}</h3>
          {questions[currentQuestion]?.options.map((option: string, index: number) => (
            <div key={index}>
              <button type="button" onClick={() => Send_answer(option)}>
                {option}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <h2>En attente du démarrage...</h2>
      )}
    </div>
  );
};

export default Quiz;
