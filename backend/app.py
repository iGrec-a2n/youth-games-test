from flask import Flask, request
from flask_cors import CORS
from flask_socketio import SocketIO, emit, join_room, leave_room

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# Stocke les joueurs et leurs scores
rooms = {}

@app.route("/")
def index():
    return "Serveur WebSocket prêt 🚀"

@socketio.on("connect")
def handle_connect():
    print("Un joueur s'est connecté.")

@socketio.on("join_game")
def join_game(data):
    room = data["room"]
    username = data["username"]

    if room not in rooms:
        rooms[room] = {"players": {}}
    
    rooms[room]["players"][username] = {"score": 0}
    join_room(room)
    emit("player_joined", {"username": username, "players": list(rooms[room]["players"].keys())}, room=room)
    print(f"{username} a rejoint la partie {room}.")

@socketio.on("answer")
def receive_answer(data):
    room = data["room"]
    username = data["username"]
    is_correct = data["is_correct"]

    if is_correct:
        rooms[room]["players"][username]["score"] += 1

    emit("update_scores", {"players": rooms[room]["players"]}, room=room)

@socketio.on("disconnect")
def handle_disconnect():
    print("Un joueur s'est déconnecté.")

if __name__ == "__main__":
    socketio.run(app, debug=True, host="0.0.0.0", port=5001)
