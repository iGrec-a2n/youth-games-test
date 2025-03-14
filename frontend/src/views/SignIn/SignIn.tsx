import React, { useState } from 'react';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      const response = await fetch('http://127.0.0.1:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Enregistrer l'ID de l'utilisateur dans localStorage
        localStorage.setItem('user_id', data.user_id);
        console.log("✅ User ID enregistré:", data.user_id);

        // Rediriger vers la page du quiz
        window.location.href = '/join';
      } else {
        setMessage(data.message || "Identifiants incorrects.");
      }
    } catch (error) {
      console.error("❌ Erreur lors de la connexion :", error);
      setMessage("Erreur de connexion. Veuillez réessayer.");
    }
  };

  return (
    <div>
      <h2>Connexion</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Se connecter</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default LoginPage;
