import db

from app import *

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
