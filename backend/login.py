from app import *
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
