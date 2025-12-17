import prismaClient from "../prismaClient";
import bcrypt from "bcryptjs";

export async function seedAdmin() {
  const emailAdmin = "admin@admin.com";
  const usernameAdmin = "admin";
  const passwordAdmin = "admin123";
  const codeIdentifiant = "ADMIN001";

  // Vérifie si l'admin existe déjà
  const existingAdmin = await prismaClient.user.findUnique({
    where: { email: emailAdmin },
  });

  if (existingAdmin) {
    console.log(" Admin existe déjà :", existingAdmin.email);
    return;
  }

  // Vérifie s'il existe au moins une agence
  let agence = await prismaClient.agence.findFirst();
  if (!agence) {
    agence = await prismaClient.agence.create({
      data: {
        nom_agence: "Agence par défaut",
        code_agence: "AG001",
        ville: "Ville par défaut",
      },
    });
    console.log(" Agence par défaut créée :", agence.nom_agence);
  }

  // Vérifie s'il existe au moins un poste "Administrateur"
  let poste = await prismaClient.poste.findUnique({
    where: { nom: "Administrateur" },
  });

  if (!poste) {
    poste = await prismaClient.poste.create({
      data: { nom: "Administrateur" },
    });
    console.log(" Poste 'Administrateur' créé");
  }

  // Hash du mot de passe
  const hashedPassword = await bcrypt.hash(passwordAdmin, 10);

  // Création de l'utilisateur admin
  const admin = await prismaClient.user.create({
    data: {
      nom: "Admin",
      prenom: "Super",
      username: usernameAdmin,
      email: emailAdmin,
      password: hashedPassword,
      code_identifiant: codeIdentifiant,
      agenceId: agence.id,
      posteId: poste.id, //  Relation vers Poste
    },
  });
  console.log(" Admin créé :", admin.email);

  // Crée le rôle ADMIN et l'associe à l'utilisateur
  const role = await prismaClient.role.upsert({
    where: { slug: "admin" },
    update: {},
    create: {
      nom: "Administrateur",
      slug: "admin",
    },
  });

  await prismaClient.userRole.create({
    data: {
      userId: admin.id,
      roleId: role.id,
    },
  });
  console.log(" Rôle ADMIN assigné à l'admin");
}
