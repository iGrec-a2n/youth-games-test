from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.security import check_password_hash, generate_password_hash
from bd import db
from bson import ObjectId

app = Flask(__name__)
CORS(app, origins=['http://localhost:5173'])
rooms = {}
# Collection for questions
questions = db["questions"]
# Collection for users
users = db["Users"]  # Structure (first_name, last_name, username, email, password, country)
# Collection for player scores
user_scores = db["Score"]  # Structure (user_id, score)

# Route to register
@app.route('/api/register', methods = ['POST'])
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
  
# Route to login
@app.route('/api/login', methods=["POST"])
def signIN():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    existing_user = users.find_one({"email": email})

    if existing_user and check_password_hash(existing_user["password"], password):
        user_id = str(existing_user["_id"])
        print(f"✅ User ID sent: {user_id}")  # Verification
        return jsonify({"message": "Welcome", "user_id": user_id}), 200
    else:
        print("❌ User not found or incorrect password")
        return jsonify({"message": "User not found"}), 400


# Route to get the questions
@app.route('/api/send_questions', methods=["GET"])
def get_questions():
    question_list = []
    qcm = questions.find({"type": "multipleChoice"})
    for q in qcm:
        question_list.append({
            "_id": str(q["_id"]),
            "question": q["question"],
            "options": q["options"],
            "points": q["points"]
        })
    return jsonify(question_list)


@app.route('/quiz_answer', methods=['POST'])
def quiz_answer():
    data = request.get_json()
    user_id = data.get('user_id')
    question_id = data.get('question_id')
    user_answer = data.get('answer')
    print(user_id)
    print(question_id)
    # Retrieve the question from the database
    question = questions.find_one({"_id": ObjectId(question_id)})
    
    if not question:
        return jsonify({"message": "Question not found"}), 404

    # Check the answer
    is_correct = question['correctAnswer'] == user_answer

    # Retrieve or create a score for the user
    score_record = user_scores.find_one({"user_id": ObjectId(user_id)})

    if score_record:
        if is_correct:
            # Add points for the question if the answer is correct
            user_scores.update_one({"user_id": ObjectId(user_id)}, {"$inc": {"score": question['points']}})
    else:
        user_scores.insert_one({
            "user_id": ObjectId(user_id),
            "score": question['points'] if is_correct else 0,
            "nb_battle" : 1
        })

    current_score = user_scores.find_one({"user_id": ObjectId(user_id)})["score"]
    return jsonify({"isCorrect": is_correct, "score": current_score}), 200

@app.route('/nb_battle', methods=['POST'])
def nb_battle():
    data = request.get_json()
    user_id = data.get('user_id')
    
    # Find the user's score record
    score_record = user_scores.find_one({"user_id": ObjectId(user_id)})
    
    if not score_record:
        return jsonify({"message": "User not found"}), 404
    
    # Check if 'nb_battle' exists in the user's score record
    if 'nb_battle' not in score_record:
        # If not, initialize it to 1 (first battle)
        user_scores.update_one(
            {"user_id": ObjectId(user_id)},
            {"$set": {"nb_battle": 1}}
        )
    else:
        # If it exists, increment it by 1
        user_scores.update_one(
            {"user_id": ObjectId(user_id)},
            {"$inc": {"nb_battle": 1}}
        )

    return jsonify({"message": "nb_battle updated successfully"}), 200

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
