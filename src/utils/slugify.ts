
export function slugify(text: string): string {
    return text
      .normalize("NFD") // Sépare les accents des lettres de base
      .replace(/[\u0300-\u036f]/g, "") // Supprime les accents
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "_")      // espaces → underscore
      .replace(/[^\w_]/g, "");   // supprime les symboles restants non alphanumériques (sauf _)
  }
  