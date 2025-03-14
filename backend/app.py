from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, join_room, leave_room, emit
from werkzeug.security import check_password_hash, generate_password_hash
from bd import db
from bson import ObjectId
import random
import string
import eventlet
import time
# For WebSocket connections to work well in local mode
eventlet.monkey_patch()

app = Flask(__name__)
CORS(app, origins=['http://localhost:5173'])
socketio = SocketIO(app, cors_allowed_origins="*", engineio_logger=True, async_mode='eventlet')

# Collection pour les rooms
rooms = db["rooms"]

# Collection pour les utilisateurs
users = db["Users"]

# Collection pour les scores des joueurs
user_scores = db["Score"]

# Nb de participants à une room
room_players = {}

# 📌 Générer un code aléatoire pour une room
def generate_room_code():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))

# Route pour enregistrer un nouvel utilisateur
@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    last_name = data.get("lastName")
    first_name = data.get("firstName")
    username = data.get("username")
    email = data.get('email')
    password = data.get('password')
    hashed_password = generate_password_hash(password)
    country = data.get('country')

    if last_name and first_name and username and email and password and country:
        users.insert_one({
            "lastName": last_name,
            "firstName": first_name,
            "username": username,
            "email": email,
            "password": hashed_password,
            "country": country
        })
        return jsonify({"message": "New user registered successfully"}), 200
    else:
        return jsonify({"message": "Missing or incorrect data"}), 400

# Route pour connecter un utilisateur
@app.route('/api/login', methods=["POST"])
def signIN():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    existing_user = users.find_one({"email": email})

    if existing_user and check_password_hash(existing_user["password"], password):
        user_id = str(existing_user["_id"])
        return jsonify({"message": "Welcome", "user_id": user_id}), 200
    else:
        return jsonify({"message": "User not found"}), 400

# Route pour créer une room avec des questions
@app.route('/api/create_room', methods=["POST"])
def create_room():
    data = request.get_json()
    admin_id = data.get("admin_id")
    room_code = generate_room_code()
    questions_data = data.get("questions")

    if not questions_data or not isinstance(questions_data, list):
        return jsonify({"message": "Questions are required and must be a list"}), 400

    room = {
        "admin_id": admin_id,
        "room_code": room_code,
        "questions": [],
        "status": "Wait"
    }

    for question in questions_data:
        question_data = {
            "question": question["question"],
            "question_id": question["question_id"],
            "type": question["type"],
            "options": question["options"],
            "correct_answer": question["correct_answer"],
            "points": question["points"]
        }
        room["questions"].append(question_data)

    rooms.insert_one(room)
    return jsonify({"message": "Room created successfully", "room_code": room_code}), 200

# Route pour récupérer les questions d'une room
@app.route('/api/get_room_questions', methods=["GET"])
def get_room_questions():
    room_code = request.args.get("room_code")
    room = rooms.find_one({"room_code": room_code})

    if not room:
        return jsonify({"message": "Room not found"}), 404

    return jsonify({"questions": room["questions"]}), 200


@socketio.on("join_room")
def handle_join_room(data):
    room_code = data["room_code"]
    username = data["username"]
    user_id = data["user_id"]  # Un identifiant utilisateur unique, passé lors de la connexion

    # Trouver la room dans la base de données
    room = rooms.find_one({"room_code": room_code})
    if not room:
        emit("error", {"message": "Room not found"}, to=request.sid)
        return
    
    # Vérifier si la room est déjà en "in progress"
    if room.get("status") == "In progress":
        emit("error", {"message": "La room est déjà en cours, vous ne pouvez plus rejoindre."}, to=request.sid)
        return

    # Si la clé 'players' n'existe pas encore, on l'initialise avec une liste vide
    if "players" not in room:
        rooms.update_one({"room_code": room_code}, {"$set": {"players": []}})
    
    # Récupérer à nouveau la room après l'initialisation
    room = rooms.find_one({"room_code": room_code})

    # Vérifier si le joueur est déjà dans la room
    existing_player = next((p for p in room["players"] if str(p["user_id"]) == user_id), None)
    if existing_player:
        emit("error", {"message": f"Le joueur {username} est déjà dans la room."}, to=request.sid)
        return

    # Ajouter le joueur à la liste des joueurs dans la room
    player = {
        "username": username,
        "user_id": user_id,  # Laisser sous forme de string
        "joined_at": time.time()  # Date et heure d'entrée
    }

    # Mettre à jour la collection 'rooms' pour ajouter ce joueur à la room
    rooms.update_one(
        {"room_code": room_code},
        {"$push": {"players": player}}
    )
    time.sleep(0.1)
    # Récupérer la room mise à jour
    updated_room = rooms.find_one({"room_code": room_code})
# Vérifier si les joueurs sont bien récupérés
    if "players" not in updated_room or not updated_room["players"]:
        print(f"⚠️ Aucun joueur récupéré après mise à jour de la room {room_code} !")
    # Le joueur rejoint la room
    join_room(room_code)

    # Envoyer un message au joueur qui rejoint la room
    emit("player_joined", {"username": username}, to=request.sid)

    # Diffuser à tous les joueurs dans la room la liste mise à jour des joueurs
    emit("player_list", {"players": updated_room["players"]}, room=room_code)

    print(f"📢 {username} a rejoint la room {room_code}.")


    # Émettre l'événement 'new_player' à tous les autres joueurs (dans la room)
    emit("new_player", {"username": username}, room=room_code, include_self=False)
    print("Événement 'new_player' envoyé à la room")

    # Émettre la liste des joueurs mise à jour
    emit("player_list", {"players": updated_room["players"]}, room=room_code)
    print("Événement 'player_list' envoyé")

    # Envoie le nombre de joueurs et la liste complète des joueurs
    emit(
        "broadcast_message",
        {
            "message": f"{username} a rejoint la room {room_code}",
            "players_count": len(updated_room["players"]),
            "players": updated_room["players"],  # Liste des joueurs
        },
        broadcast=True  # Émettre à tous les clients connectés
    )
    print("Événement 'broadcast_message' envoyé à tous les clients")

# 🔄 Envoyer une question à la room
@socketio.on("start_quiz")
def handle_start_quiz(data):
    room_code = data["room_code"]

    # Vérifier si la room existe
    room = rooms.find_one({"room_code": room_code})
    if not room:
        emit("error", {"message": "Room not found"})
        return

    rooms.update_one(
        {"room_code": room_code},
        {"$set": {"status": "In progress"}}  
    )

    emit("quiz_started", {"questions": room["questions"]}, room=room_code)

    emit("room_status", {"room_code": room_code, "status": "in progress"}, broadcast=True)

    print(f"Le quiz pour la room {room_code} a commencé. Statut mis à jour en 'in progress'.")
#IL reste à gérer la logique de récupération des réponses des participants, les traiter, et envoyer le résultat à la fin

if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=5000, debug=True)
