import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import socket from "../../socket"; 

// Définition du type pour les joueurs
type PlayerType = {
  username: string;
  user_id: string;
  joined_at: number;
};

const AdminRoom = () => {
  const { roomCode } = useParams();
  const [playersCount, setPlayersCount] = useState(0);  // Nombre de joueurs
  const [playersList, setPlayersList] = useState<PlayerType[]>([]);  // Liste des joueurs
  const [quizStarted, setQuizStarted] = useState(false);

  useEffect(() => {
    // Réception de l'événement 'broadcast_message' 
    socket.on("broadcast_message", (data) => {
      console.log("Message diffusé à tous les clients:", data.message);
      console.log("Nombre de joueurs:", data.players_count);
      console.log("Liste des joueurs:", data.players);

      setPlayersCount(data.players_count);
      setPlayersList(data.players);  
    });

    return () => {
      socket.off("broadcast_message");  
    };
  }, []);

  const startQuiz = () => {
    socket.emit("start_quiz", { room_code: roomCode });
    setQuizStarted(true);
  };

  return (
    <div>
      <h2>Admin - Room {roomCode}</h2>
      <div>
        <h2>Nombre de joueurs : {playersCount}</h2>
        <ul>
          {playersList.map((player, index) => (
            <li key={index}>{player.username} (ID: {player.user_id})</li>
          ))}
        </ul>
      </div>
      {!quizStarted ? (
        <button onClick={startQuiz}>Démarrer le quiz</button>
      ) : (
        <h3>Quiz en cours...</h3>
      )}
    </div>
  );
};

export default AdminRoom;
