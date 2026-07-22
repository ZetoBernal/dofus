/**
 * Genera el hash bcrypt de una contraseña para pegar en ADMIN_PASSWORD_HASH
 * en .env. Corré con: npx tsx scripts/hash-password.ts "tu-contraseña"
 *
 * Imprime el valor ya escapado para .env: Next.js expande "$" como
 * referencia a otra variable, así que un hash bcrypt sin escapar
 * (empieza con $2b$12$...) se corrompe en silencio — bcrypt.compare
 * devuelve false sin ningún error.
 */
import bcrypt from "bcryptjs";

const password = process.argv[2];

if (!password) {
  console.error('Uso: npx tsx scripts/hash-password.ts "tu-contraseña"');
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 12);
const escaped = hash.replaceAll("$", "\\$");

console.log("\nPegá esta línea en .env:\n");
console.log(`ADMIN_PASSWORD_HASH="${escaped}"`);
