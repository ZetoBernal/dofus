/** minusculas y sin acentos, para que buscar "emeraude" encuentre "Emeraude" */
export function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}
