/**
 * Genera el hash bcrypt de una contraseña para pegar en ADMIN_PASSWORD_HASH
 * en back/.env. Corré desde back/ con:
 *   npx tsx scripts/hash-password.ts "tu-contraseña"
 */
import bcrypt from "bcryptjs";

const password = process.argv[2];

if (!password) {
  console.error('Uso: npx tsx scripts/hash-password.ts "tu-contraseña"');
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 12);

console.log("\nPegá esta línea en back/.env:\n");
console.log(`ADMIN_PASSWORD_HASH="${hash}"`);
