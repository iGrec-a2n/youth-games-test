from pymongo import MongoClient
import requests

# server = "34.251.25.31" # or localhost
# username = "ortecusdb"
# password = "passdb*2019#"
# port = 27017

# if server == 'localhost':
# else:
#     client = MongoClient(server, username=username,password=password, port=port)

client = MongoClient("mongodb://localhost:27017")
# creation DB
db = client["HACKATON"]

# creation collection
# db.Questions.insert_many([
#   {
#     "type": "oddOneOut",
#     "question": "Quel est l'intrus parmi ces océans ?",
#     "options": ["Océan Atlantique", "Océan Pacifique", "Océan Indien", "Mer Méditerranée"],
#     "correctAnswer": "Mer Méditerranée"
#   },
#   {
#     "type": "textInput",
#     "question": "Quel est le premier pays à avoir lancé un homme dans l'espace ?",
#     "correctAnswer": "Union Soviétique"
#   },
#   {
#     "type": "multipleChoice",
#     "question": "Quel est le pays avec la plus grande population ?",
#     "options": ["Inde", "Chine", "États-Unis", "Indonésie"],
#     "correctAnswer": "Chine"
#   },
#   {
#     "type": "trueFalse",
#     "question": "Les tortues sont des reptiles.",
#     "options": ["Vrai", "Faux"],
#     "correctAnswer": "Vrai"
#   },
#   {
#     "type": "oddOneOut",
#     "question": "Quel est l'intrus parmi ces animaux ?",
#     "options": ["Aigle", "Vautour", "Hirondelle", "Condor"],
#     "correctAnswer": "Hirondelle"
#   },
#   {
#     "type": "textInput",
#     "question": "Quel est le nom de la plus grande planète de notre système solaire ?",
#     "correctAnswer": "Jupiter"
#   },
#   {
#     "type": "multipleChoice",
#     "question": "Quel est l'élément chimique dont le symbole est 'H' ?",
#     "options": ["Hydrogène", "Hélium", "Hafnium", "Holmium"],
#     "correctAnswer": "Hydrogène"
#   },
#   {
#     "type": "trueFalse",
#     "question": "Le Panama est situé en Asie.",
#     "options": ["Vrai", "Faux"],
#     "correctAnswer": "Faux"
#   },
#   {
#     "type": "oddOneOut",
#     "question": "Quel est l'intrus parmi ces instruments de musique ?",
#     "options": ["Guitare", "Piano", "Batterie", "Flûte", "Cymbale"],
#     "correctAnswer": "Cymbale"
#   },
#   {
#     "type": "textInput",
#     "question": "Quel est le premier film à avoir remporté l'Oscar du meilleur film ?",
#     "correctAnswer": "Wings"
#   },
#   {
#     "type": "multipleChoice",
#     "question": "Dans quelle ville se trouve la Statue de la Liberté ?",
#     "options": ["Chicago", "Los Angeles", "New York", "Washington D.C."],
#     "correctAnswer": "New York"
#   },
#   {
#     "type": "trueFalse",
#     "question": "Les kangourous sont originaires d'Afrique.",
#     "options": ["Vrai", "Faux"],
#     "correctAnswer": "Faux"
#   },
#   {
#     "type": "oddOneOut",
#     "question": "Quel est l'intrus parmi ces grandes découvertes scientifiques ?",
#     "options": ["Relativité restreinte", "Théorie de la gravitation universelle", "Théorie de l'évolution", "Électricité"],
#     "correctAnswer": "Électricité"
#   },
#   {
#     "type": "textInput",
#     "question": "Quel est le nom du célèbre scientifique qui a découvert la radioactivité ?",
#     "correctAnswer": "Marie Curie"
#   }
# ]
# )
# print("C'est fait")
qcm = db.Questions.find({"type":"multipleChoice"})
for i in qcm:
  print(i)
