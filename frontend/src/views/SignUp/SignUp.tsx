import React from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Définition du schéma de validation avec Zod
const loginSchema = z.object({
  lastName: z.string().min(1, "Le nom est requis"),
  firstName: z.string().min(1, "Le prénom est requis"),
  username: z.string().min(3, "Le pseudo doit avoir au moins 3 caractères"),
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Le mot de passe doit avoir au moins 6 caractères"),
  country: z.string().min(1, "Le pays est requis"),
  birthDate: z.string().min(1, "La date de naissance est requise"),
});

// Définition du type des données du formulaire
type LoginFormInputs = z.infer<typeof loginSchema>;

const LoginPage: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  });

  // const onSubmit = (data: LoginFormInputs) => {
  //   console.log("Données du formulaire :", data);
  // };


const onSubmit = async (data: LoginFormInputs) => {
  try {
    const response = await axios.post("http://127.0.0.1:5000/api/login", data, {
      headers: { "Content-Type": "application/json" },
    });

    console.log("Réponse du backend :", response.data);
    alert(response.data.message); // Affichage d'un message
  } catch (error) {
    console.error("Erreur lors de la connexion :", error);
    alert("Erreur de connexion !");
  }
};

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-semibold text-center mb-4">Connexion</h2>
        
        <label className="block">Nom :</label>
        <input {...register("lastName")} className="w-full p-2 border rounded mb-2" />
        {errors.lastName && <p className="text-red-500 text-sm">{errors.lastName.message}</p>}

        <label className="block">Prénoms :</label>
        <input {...register("firstName")} className="w-full p-2 border rounded mb-2" />
        {errors.firstName && <p className="text-red-500 text-sm">{errors.firstName.message}</p>}

        <label className="block">Pseudo :</label>
        <input {...register("username")} className="w-full p-2 border rounded mb-2" />
        {errors.username && <p className="text-red-500 text-sm">{errors.username.message}</p>}

        <label className="block">Email :</label>
        <input type="email" {...register("email")} className="w-full p-2 border rounded mb-2" />
        {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}

        <label className="block">Mot de passe :</label>
        <input type="password" {...register("password")} className="w-full p-2 border rounded mb-2" />
        {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}

        <label className="block">Pays :</label>
        <input {...register("country")} className="w-full p-2 border rounded mb-2" />
        {errors.country && <p className="text-red-500 text-sm">{errors.country.message}</p>}

        <label className="block">Date de naissance :</label>
        <input type="date" {...register("birthDate")} className="w-full p-2 border rounded mb-2" />
        {errors.birthDate && <p className="text-red-500 text-sm">{errors.birthDate.message}</p>}

        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded mt-2 hover:bg-blue-600">
          S'inscrire
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
