from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, join_room, leave_room, emit
from werkzeug.security import check_password_hash, generate_password_hash
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from bd import db
from bson import ObjectId
import random
import string
import eventlet
import time
from datetime import timedelta

# For WebSocket connections to work well in local mode
eventlet.monkey_patch()

app = Flask(__name__)
CORS(app, origins=['http://localhost:5173'])
socketio = SocketIO(app, cors_allowed_origins="*", engineio_logger=True, async_mode='eventlet')
app.config['JWT_SECRET_KEY'] = 'data'
app.config["JWT_TOKEN_LOCATION"] = ["cookies"] 
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(seconds=3600)
# Collection pour les rooms
rooms = db["rooms"]

# Collection pour les utilisateurs
users = db["Users"]

# Collection pour les scores des joueurs
user_scores = db["Score"]

#Collection pour les question
questions = db["questions"]
# Nb de participants à une room
room_players = {}

# 📌 Générer un code aléatoire pour une room
def generate_room_code():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    last_name = data.get("lastName")
    first_name = data.get("firstName")
    username = data.get("username")
    email = data.get('email')
    password = data.get('password')
    country = data.get('country')

    if not (last_name and first_name and username and email and password and country):
        return jsonify({"message": "Missing or incorrect data"}), 400

    # Hacher le mot de passe
    hashed_password = generate_password_hash(password).decode('utf-8')

    # Vérifier si l'utilisateur existe déjà
    if users.find_one({"email": email}):
        return jsonify({"message": "User already exists"}), 400

    # Insérer l'utilisateur
    users.insert_one({
        "lastName": last_name,
        "firstName": first_name,
        "username": username,
        "email": email,
        "password": hashed_password,
        "country": country
    })

    return jsonify({"message": "New user registered successfully"}), 201

# Route pour se connecter et obtenir un JWT
@app.route('/api/login', methods=["POST"])
def signIN():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    existing_user = users.find_one({"email": email})

    if existing_user and check_password_hash(existing_user["password"], password):
        user_id = str(existing_user["_id"])

        # Générer un token JWT
        access_token = create_access_token(identity=user_id, expires_delta=timedelta(seconds=3600))
        response.set_cookie('access_token_cookie',access_token,max_age=3600)
        return jsonify({"message": "Welcome", "access_token": res}), 200
    else:
        return jsonify({"message": "Invalid credentials"}), 401
    
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


# 🔄 Lancer le quiz lorsque le nombre de joueurs atteint 2
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

    # Ajouter le joueur à la liste des joueurs dans la room
    player = {
        "username": username,
        "user_id": user_id, 
        "joined_at": time.time(),  # Date et heure d'entrée 'pas encore convertie'
        "score": 0
    }

    rooms.update_one(
        {"room_code": room_code},
        {"$push": {"players": player}}
    )

    # Récupérer la room mise à jour
    updated_room = rooms.find_one({"room_code": room_code})

    # Le joueur rejoint la room
    join_room(room_code)

    # Envoyer un message au joueur qui rejoint la room
    emit("player_joined", {"username": username}, to=request.sid)

    # Diffuser à tous les joueurs dans la room la liste mise à jour des joueurs
    emit("player_list", {"players": updated_room["players"]}, room=room_code)

    # Envoie le nombre de joueurs et la liste complète des joueurs
    emit(
        "broadcast_message",
        {
            "message": f"{username} a rejoint la room {room_code}",
            "players_count": len(updated_room["players"]),
            "players": updated_room["players"],
        },
        broadcast=True  # Diffusion à tous les clients connectés
    )

    # Vérifier si le nombre de joueurs atteint 2, et démarrer le quiz
    if len(updated_room["players"]) == 2:
        # Mettre la room à "in progress"
        rooms.update_one(
            {"room_code": room_code},
            {"$set": {"status": "In progress"}}
        )

        # Récupérer les questions de type multipleChoice
        question_list = []
        qcm = questions.find({"type": "multipleChoice"})
        for q in qcm:
            question_list.append({
                "_id": str(q["_id"]),
                "question": q["question"],
                "options": q["options"],
                "points": q["points"]
            })

        # Envoyer les questions aux joueurs dans la room
        emit("quiz_started", {"questions": question_list}, room=room_code)

        # Diffuser à tous les clients que le quiz a commencé
        emit("room_status", {"room_code": room_code, "status": "in progress"}, broadcast=True)
        print(f"Le quiz pour la room {room_code} a commencé avec les questions : {question_list}")

# 🔄 Envoyer une question à la room
@socketio.on("start_quiz")
def handle_start_quiz(data):
    room_code = data["room_code"]

    # Vérifier si la room existe
    room = rooms.find_one({"room_code": room_code})
    if not room:
        emit("error", {"message": "Room not found"})
        return

    question_list = []
    qcm = questions.find({"type": "multipleChoice"})
    for q in qcm:
        question_list.append({
            "_id": str(q["_id"]),
            "question": q["question"],
            "options": q["options"],
            "points": q["points"]
        })

    emit("quiz_started", {"questions": question_list}, room=room_code)
    print(question_list)

    emit("room_status", {"room_code": room_code, "status": "in progress"}, broadcast=True)

    print(f"Le quiz pour la room {room_code} a commencé. Statut mis à jour en 'in progress'.")

#IL reste à gérer la logique de récupération des réponses des participants, les traiter, et envoyer le résultat à la fin

@socketio.on('receive_answer')
def receive_answer(data):
    # Identifier la room
    room_code = data['room_code']

    # Vérifier si la room existe
    room = rooms.find_one({"room_code": room_code})
    if not room:
        emit("error", {"message": "Room not found"}, to=request.sid)
        return

    # Identifier le joueur
    player_id = data["user_id"]

    # Vérifier si le joueur existe dans la room (dans le tableau players)
    player = next((p for p in room["players"] if str(p["user_id"]) == player_id), None)
    if not player:
        emit("error", {"message": "Player not found in room"}, to=request.sid)
        return

    # Récupérer la réponse de l'utilisateur
    question_id = data["question"]
    user_answer = data["answer"]

    print(f"{player_id} a répondu {user_answer}")

    # Trouver la question dans la collection 'questions' par ID
    question = questions.find_one({"_id": ObjectId(question_id)})
    
    if not question:
        emit("error", {"message": "Question not found"}, to=request.sid)
        print("Question non trouvée ❌")
        return

    # Vérifier si la réponse est correcte
    is_correct = question['correctAnswer'] == user_answer
    if is_correct:
        print("Bonne réponse ✅")

        # Mettre à jour le score du joueur dans la collection 'rooms'
        result = rooms.update_one(
            {"room_code": room_code, "players.user_id": player_id},
            {"$inc": {"players.$.score": question['points']}}  # Ajouter les points de la question
        )
        score_record = user_scores.find_one({"user_id": ObjectId(player_id)})

        if score_record:
            if is_correct:
                # Add points for the question if the answer is correct
                user_scores.update_one({"user_id": ObjectId(player_id)}, {"$inc": {"score": question['points']}})
        else:
            user_scores.insert_one({
                "user_id": ObjectId(player_id),
                "score": question['points'] if is_correct else 0,
            })
          # Récupérer le score mis à jour du joueur
        updated_room = rooms.find_one(
            {"room_code": room_code, "players.user_id": player_id},
            {"players.$": 1}
        )

        if updated_room and "players" in updated_room:
            score = updated_room["players"][0]["score"]
            print(f"Score mis à jour : {score} ✅")

            # Envoyer le score uniquement au joueur qui a répondu
            emit("score_updated", {"user_id": player_id, "new_score": score}, to=request.sid)
        else:
            print("Erreur lors de la récupération du score ❌")
            emit("error", {"message": "Score not found"}, to=request.sid)

    else:
        print("Mauvaise réponse ❌")
        emit("error", {"message": "Incorrect answer"}, to=request.sid)

@socketio.on('end_room')
def end_room(data):
    room_code = data["room_code"]

    # Vérifier si la room existe
    room = rooms.find_one({"room_code": room_code})
    if not room:
        emit("error", {"message": "Room not found"})
        return

    # Récupérer les scores des joueurs
    players = room["players"]  # Liste des joueurs dans la room
    if not players:
        emit("error", {"message": "No players found in this room"})
        return

    # Construire une liste avec les scores des joueurs
    player_scores = [{"username": player["username"], "score": player["score"]} for player in players]

    # Émettre l'événement 'end_room' avec les scores des joueurs
    emit("end_room", {"player_scores": player_scores}, room=room_code)
    rooms.update_one(
    {"room_code": room_code},
    {"$set": {"status": "End"}}  
    )
    

if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=5000, debug=True)
