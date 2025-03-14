import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; 
import socket from "../../socket";

const JoinRoom: React.FC = () => {
  const [roomCode, setRoomCode] = useState("");
  const [username, setUsername] = useState("");
  const navigate = useNavigate(); 
  const [players, setPlayers] = useState<string[]>([]);
  const user_id = localStorage.getItem("user_id");
  const joinRoom = () => {
    socket.emit("join_room", { room_code: roomCode, username, user_id });

    socket.on("player_joined", () => {
      navigate(`/quiz/${roomCode}`); 
    });
    socket.on("error", (data: { message: string }) => {
      alert(data.message);
    });
  };
  useEffect(() => {
    socket.on("new_player", (data) => {
      console.log("Nouveau joueur reçu :", data.username);
      setPlayers((prev) => {
        const updatedPlayers = [...prev, data.username];
        console.log("Liste mise à jour des joueurs : ", updatedPlayers);
        return updatedPlayers;
      });
    });
  
    return () => {
      socket.off("new_player");
    };
  }, []);
  return (
    <div>
      <h2>Rejoindre une salle {user_id}</h2>
      <input type="text" placeholder="Code de la salle" onChange={(e) => setRoomCode(e.target.value)} />
      <input type="text" placeholder="Nom" onChange={(e) => setUsername(e.target.value)} />
      <button onClick={joinRoom}>Rejoindre</button>
    </div>
  );
};

export default JoinRoom;
