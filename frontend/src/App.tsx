import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './App.scss';
import SignUp from './views/SignUp/SignUp';
import LoginPage from './views/SignIn/SignIn';
import Quiz from './components/Admin/game';
import JoinRoom from './components/Admin/join';
import Results from './components/Admin/WaitRoom';
import AdminRoom from './components/Admin/test';
import AdminPage from './components/Admin/Admin';
function App() {

  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/quiz/:roomCode" element={<Quiz />} />
          <Route path="/join" element={<JoinRoom />} />
          <Route path="/results/:roomCode" element={<Results />} />
          <Route path="/:roomCode" element={<AdminRoom />} />
          <Route path="/ad" element={<AdminPage />} />

        </Routes>
      </Router>
    </div>
  );
}

export default App;



// import React, { useEffect, useState } from 'react';
// import io from 'socket.io-client';
// import QuizRoom from './components/Admin/test';
// const socket = io('http://localhost:5000');  // Ton serveur Flask + SocketIO

// const App: React.FC = () => {
//   const [userId, setUserId] = useState<string | null>(localStorage.getItem('user_id'));
//   const [roomCode, setRoomCode] = useState<string>('');
//   const [joinedRoom, setJoinedRoom] = useState<boolean>(false);

//   useEffect(() => {
//     if (userId && roomCode) {
//       setJoinedRoom(true);
//       socket.emit('join', { room_code: roomCode, user_id: userId });
//     }
//   }, [roomCode, userId]);

//   return (
//     <div className="App">
//       {joinedRoom ? (
//         <QuizRoom socket={socket} roomCode={roomCode} userId={userId!} />
//       ) : (
//         <div>
//           <h1>Veuillez entrer le code de la room: {userId}</h1>
//           <input
//             type="text"
//             placeholder="Code de la Room"
//             onChange={(e) => setRoomCode(e.target.value)}
//           />
//         </div>
//       )}
//     </div>
//   );
// };

// export default App;
