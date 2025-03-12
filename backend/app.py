from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit
from werkzeug.security import check_password_hash, generate_password_hash
from bd import db
from bson import ObjectId

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# Collection contenant les questions
questions = db["Questions"]
# Collection contenant les utilisateurs
users = db["Users"]  # Structure (nom, prenoms, pseudo, email, password, pays)
# Collection contenant le score des joueurs
user_scores = db["Score"]  # Structure (user_id, score)

#Route pour s'inscrire
@app.route('/register', methods = ['POST'])
def register():
    data = request.get_json()
    name = data.get("username")
    prenom = data.get("prenom")
    pseudo = data.get("pseudo")
    email = data.get('email')
    password = data.get('password')
    confirmPasswor = data.get('CPassword')
    hashed_password = generate_password_hash(password)
    country = data.get('country')
    if name and prenom and pseudo and email and password and country:
      users.insert_one({
          "nom":name,
          "prenoms": prenom,
          "pseudo": pseudo,
          "email": email,
          "password": hashed_password,
          "country": country
      })
      return jsonify({"message":"Nouvel utilisateur enregistré avec succes"}), 200
    else:
      return jsonify({"message":"Données manquantes ou mal renseignées"}), 400
  
#Route pour se connecter 
@app.route('/login', methods=["POST"])
def SignIN():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    exist_user = users.find_one({"email":email})
    if exist_user and check_password_hash(exist_user["password"],password):
        return jsonify({"message":"Bienvenue","user_id":exist_user["_id"]}), 200
    else:
      return jsonify({"message":"User not found"}), 400

#  Route pour récupérer les questions
@app.route('/send_questions', methods=["GET"])
def get_questions():
    question_list = []
    qcm = questions.find({"type": "multipleChoice"})
    for q in qcm:
        question_list.append({
            "_id": str(q["_id"]),
            "question": q["question"],
            "options": q["options"]
        })
    return jsonify(question_list)

# 🔹 Vérification des réponses avec WebSocket
@socketio.on('quiz_answer')
def handle_quiz_answer(data):
    id = data.get("user_id")  # ID unique de l'utilisateur
    user_id = users.find_one({"user_id": ObjectId(id)})
    question_id = data.get("question_id")  # ID de la question
    user_answer = data.get("answer")  # Réponse envoyée

    try:
        question = questions.find_one({"_id": ObjectId(question_id)})
    except:
        emit("quiz_feedback", {"user_id": user_id, "message": "ID de question invalide"}, broadcast=True)
        return

    if not question:
        emit("quiz_feedback", {"user_id": user_id, "message": "Question non trouvée"}, broadcast=True)
        return

    is_correct = (question["correctAnswer"] == user_answer)

    # 🔹 Mettre à jour le score de l'utilisateur
    score_record = user_scores.find_one({"user_id": ObjectId(id)})

    if score_record:
        # Si l'utilisateur a déjà un score, on le met à jour
        if is_correct:
            user_scores.update_one(
                {"user_id": ObjectId(id)},
                {"$inc": {"score": 1}}  # Incrémenter le score de 1
            )
    else:
        # Sinon, on crée une nouvelle entrée pour l'utilisateur avec un score initial
        if is_correct:
            user_scores.insert_one({
                "user_id": ObjectId(id),
                "score": 1  # Si la réponse est correcte, on initialise avec 1
            })
        else:
            user_scores.insert_one({
                "user_id": ObjectId(id),
                "score": 0  # Si la réponse est incorrecte, on initialise avec 0
            })

    # 🔹 Récupérer le score mis à jour
    updated_score = user_scores.find_one({"user_id": ObjectId(id)})["score"]

    # 🔹 Envoyer la réponse et le score à tous les joueurs
    emit("quiz_feedback", {
        "user_id": user_id,
        "is_correct": is_correct,
        "message": "Bonne réponse !" if is_correct else "Mauvaise réponse.",
        "score": updated_score
    }, broadcast=True)

if __name__ == "__main__":
    socketio.run(app, debug=True, host="0.0.0.0", port=5000)
