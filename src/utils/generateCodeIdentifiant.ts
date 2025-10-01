import { nanoid } from "nanoid";

export function generateCodeIdentifiant(): string {
    
  // Exemple : USR-20250926-ABC123
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const random = nanoid(6).toUpperCase();
  return `USR-${date}-${random}`;
}
