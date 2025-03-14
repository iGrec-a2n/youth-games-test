import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import socket from "../../socket";  // Utilise le socket global

interface Question {
  question: string;
  question_id: string;
  type: string;
  options: string[];
  correct_answer: string;
  points: number;
}

const Quiz = () => {
  const { roomCode } = useParams();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [player, setPlayer] = useState<string>('');

  useEffect(() => {
    // Écoute les événements liés à la connexion au quiz
    socket.on("quiz_started", (data: { questions: Question[] }) => {
      if (data.questions && data.questions.length > 0) {
        setQuestions(data.questions);
        setIsStarted(true);
      }
    });

    socket.on("player_joined", (data) => {
      alert(`Bienvenue ${data.username}, vous avez rejoint la salle !`);
      setPlayer(data.username);
    });
    socket.on("player_list", (data) => {
      console.log("new player", data.players);
      
    });
    socket.on("error", (data: { message: string }) => {
      alert(data.message);
    });

    return () => {
      socket.off("quiz_started");
      socket.off("player_joined");
      socket.off("plauer_list");
      socket.off("error");
    };
  }, []);

  return (
    <div>
      <h2>Room : {roomCode}</h2>
      <h1>Joueur: {player}</h1>
      {isStarted ? (
        <div>
          <h3>{questions[currentQuestion]?.question}</h3>
          {questions[currentQuestion].options &&
              questions[currentQuestion].options.map((option: string, index: number) => (
                <div key={index}>
                  <button
                    type="button"
                    onClick={() => {console.log("ok");
                    }}
                    // disabled={isAnswerSubmitted} // Désactiver après soumission
                  >
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
