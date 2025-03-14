import React, { useState } from 'react';
import axios from 'axios';

// Définition des types pour les questions
interface Question {
  question_id: string;
  question: string;
  options: string[];
  correct_answer: string;
  points: number;
  type: string;
}

const AdminPage: React.FC = () => {
  const [roomCode, setRoomCode] = useState<string>('');
  const [questions, setQuestions] = useState<Question[]>([
    {
      question_id: '', // ID de la question, généré ou passé
      question: '',
      options: ['', '', '', ''],
      correct_answer: '',
      points: 0,
      type: '' // Type de la question (choix multiple, vrai/faux, etc.)
    },
  ]);

  // Fonction pour générer un ID de question unique
  const generateQuestionId = () => {
    return 'q' + Math.random().toString(36).substring(2, 9); // Simple ID unique
  };

  // Fonction pour créer une room
  const handleCreateRoom = async () => {
    try {
      // Préparer les questions avec un ID unique pour chaque question
      const response = await axios.post('http://localhost:5000/api/create_room', {
        admin_id: '1234567890', // Remplacer avec l'ID de l'admin
        questions: questions.map((q) => ({
          ...q,
          question_id: generateQuestionId(),
        })),
      });
      setRoomCode(response.data.room_code); // Afficher le code de la room après la création
    } catch (error) {
      console.error('Error creating room', error);
    }
  };

  // Fonction pour ajouter une question
  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        question_id: generateQuestionId(),
        question: '',
        options: ['', '', '', ''],
        correct_answer: '',
        points: 0,
        type: '', // Remplacer par le type de question
      },
    ]);
  };

  return (
    <div>
      <h2>Create Room</h2>
      <button onClick={handleCreateRoom}>Create Room</button>
      {roomCode && <p>Room Code: {roomCode}</p>} {/* Affiche le code de la room après la création */}

      <h3>Add Questions</h3>
      {questions.map((q, idx) => (
        <div key={idx}>
          <input
            type="text"
            placeholder="Question"
            value={q.question}
            onChange={(e) => {
              const newQuestions = [...questions];
              newQuestions[idx].question = e.target.value;
              setQuestions(newQuestions);
            }}
          />
          {q.options.map((option, optionIdx) => (
            <input
              key={optionIdx}
              type="text"
              placeholder={`Option ${String.fromCharCode(65 + optionIdx)}`} // A, B, C, D
              value={option}
              onChange={(e) => {
                const newQuestions = [...questions];
                newQuestions[idx].options[optionIdx] = e.target.value;
                setQuestions(newQuestions);
              }}
            />
          ))}
          <input
            type="text"
            placeholder="Correct Answer"
            value={q.correct_answer}
            onChange={(e) => {
              const newQuestions = [...questions];
              newQuestions[idx].correct_answer = e.target.value;
              setQuestions(newQuestions);
            }}
          />
          <input
            type="number"
            placeholder="Points"
            value={q.points}
            onChange={(e) => {
              const newQuestions = [...questions];
              newQuestions[idx].points = parseInt(e.target.value, 10);
              setQuestions(newQuestions);
            }}
          />
          <input
            type="text"
            placeholder="Question Type"
            value={q.type}
            onChange={(e) => {
              const newQuestions = [...questions];
              newQuestions[idx].type = e.target.value;
              setQuestions(newQuestions);
            }}
          />
        </div>
      ))}
      <button onClick={handleAddQuestion}>Add another question</button>
    </div>
  );
};

export default AdminPage;
