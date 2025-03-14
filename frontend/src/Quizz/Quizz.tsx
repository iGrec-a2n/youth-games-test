import React, { useState, useEffect } from 'react';

const Quiz: React.FC = () => {
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [answer, setAnswer] = useState<string>('');
  const [score, setScore] = useState<number>(0);
  const [message, setMessage] = useState<string>('');
  const [isQuizFinished, setIsQuizFinished] = useState<boolean>(false);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);

  const userId = localStorage.getItem('user_id'); // Récupérer l'ID de l'utilisateur depuis localStorage
  console.log(localStorage.getItem('user_id'));

  useEffect(() => {
    // Récupérer les questions depuis le serveur
    fetch('http://127.0.0.1:5000/api/send_questions')
      .then((response) => response.json())
      .then((data) => {
        setQuestions(data);
      });
  }, []);

  const handleSubmitAnswer = (event: React.FormEvent) => {
    event.preventDefault();

    if (isQuizFinished || isAnswerSubmitted) return; // Empêcher la soumission multiple

    const currentQuestion = questions[currentQuestionIndex];
    console.log(currentQuestion);
    
    // Envoyer la réponse au back-end pour vérifier la réponse
    const questionData = {
      user_id: userId,
      question_id: currentQuestion._id,
      answer,
    };

    // Émettre l'événement de réponse au back-end via socket
    fetch('http://127.0.0.1:5000/quiz_answer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(questionData),
    })
    .then((response) => response.json())
    .then((data) => {
      if (data.isCorrect) {
        setScore((prevScore) => prevScore + currentQuestion.points); // Ajouter des points si la réponse est correcte
        setMessage("Bonne réponse !");
      } else {
        setMessage("Mauvaise réponse !");
      }

      setIsAnswerSubmitted(true); 
    })
    .catch((error) => {
      console.error('Erreur lors de la soumission de la réponse:', error);
    });
  };

  const handleOptionClick = (option: string) => {
    setAnswer(option);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setIsAnswerSubmitted(false); 
    } else {
      setIsQuizFinished(true);
      setMessage('Quiz terminé !');
      fetch('http://127.0.0.1:5000/nb_battle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id : userId
        })})
        .then((response) => response.json())
    }
  };

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div>
      <h1>Quiz Multijoueur</h1>
      {currentQuestion ? (
        <div>
          <h2>{currentQuestion.question} - Nombre de points : {currentQuestion.points}</h2>
          <form onSubmit={handleSubmitAnswer}>
            {currentQuestion.options &&
              currentQuestion.options.map((option: string, index: number) => (
                <div key={index}>
                  <button
                    type="button"
                    onClick={() => handleOptionClick(option)}
                    disabled={isAnswerSubmitted}
                  >
                    {option}
                  </button>
                </div>
              ))}
            <button type="submit" disabled={isAnswerSubmitted}>
              Soumettre la réponse
            </button>
          </form>

          {isAnswerSubmitted && (
            <button onClick={handleNextQuestion} disabled={isQuizFinished}>
              Question suivante
            </button>
          )}
        </div>
      ) : (
        <p>Chargement des questions...</p>
      )}

      {message && <p>{message}</p>}
      <h3>Score: {score}</h3>
    </div>
  );
};

export default Quiz;
