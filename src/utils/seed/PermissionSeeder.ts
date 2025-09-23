import prismaClient from "../../utils/prismaClient.ts";
import { slugify } from "../slugify.ts";

const permissions = [
  { name: 'Créer utilisateur' },
  { name: 'Modifier utilisateur' },
  { name: 'Supprimer utilisateur' },
  { name: 'Voir les utilisateurs' },
  { name: 'Voir un utilisateur' },

  { name: 'Créer un rôle' },
  { name: 'Modifier un rôle' },
  { name: 'Supprimer un rôle' },
  { name: 'Voir les rôles' },
  { name: 'Voir un rôle' },
  { name: 'Voir les permissions d’un rôle' },


  { name: 'Attribuer un rôle à un utilisateur' },
  { name: "Retirer un rôle d'un utilisateur" },

  { name: 'Voir les permissions' },
  { name: 'Attribuer des permissions aux rôles' },
  { name: 'Retirer les permissions d’un rôle' },
  { name: 'Voir une permission' },

  { name: 'faire une demande' },
  { name: 'Modifier une demande' },
  { name: 'Supprimer une demande' },
  { name: 'Voir les demandes' },
  { name: 'Valider une demande' },
  { name: 'Refuser une demande' },
  { name: 'Voir une demande' },

  { name: 'Enregistrer un équipement' },
  { name: 'Modifier l\'état un équipement' },
  { name: 'Supprimer un équipement' },
  { name: 'Voir les équipements' },
  { name: 'Assigner un équipement à un utilisateur' },
  { name: 'Retirer un équipement à un utilisateur' },
  { name: 'Voir un équipement' },
  

  { name: 'enregistrer une action' },
  { name: 'Modifier une action' },
  { name: 'Supprimer une action' },
  { name: 'Voir les actions' },
  { name: 'Voir une action' }

];

async function main() {
  try {
    for (const permission of permissions) {
      const slug = slugify(permission.name);

      const exists = await prismaClient.permission.findUnique({ where: { slug } });
      if (!exists) {
        await prismaClient.permission.create({
          data: {
            nom: permission.name,
            slug,
          },
        });
        console.log(`Permission créée : ${permission.name}`);
      } else {
        console.log(`Permission déjà existante : ${permission.name}`);
      }
    }
  } catch (error) {
    console.error("Une erreur est survenue dans main():", error);
  }
}

main()
  .then(() => {
    console.log("Seed des permissions terminé.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Erreur lors du seed des permissions :", error);
    process.exit(1);
  });
  

export default permissions;
