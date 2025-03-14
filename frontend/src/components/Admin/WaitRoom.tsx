import React, { useState, useEffect } from "react";
import socket from "../../socket";

const Results: React.FC = () => {
  const [scores, setScores] = useState([]);

  useEffect(() => {
    socket.on("quiz_results", (data) => {
      setScores(data.scores);
    });

    return () => {
      socket.off("quiz_results");
    };
  }, []);

  return (
    <div>
      <h2>Résultats</h2>
      {scores.map((s, index) => (
        <p key={index}>{s.username}: {s.score} points</p>
      ))}
    </div>
  );
};

export default Results;
