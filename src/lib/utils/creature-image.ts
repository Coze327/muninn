/**
 * Get the image path for a creature based on its name
 * Converts name to lowercase and replaces spaces with hyphens
 * @param name - Creature name (e.g., "Ancient Red Dragon")
 * @returns Image path (e.g., "/uploads/creatures/ancient-red-dragon.webp")
 */
export function getCreatureImagePath(name: string): string {
  const filename = name.toLowerCase().replace(/\s+/g, '-');
  return `/uploads/creatures/${filename}.webp`;
}
