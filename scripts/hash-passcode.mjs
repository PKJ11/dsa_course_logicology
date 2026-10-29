// Prints the value for NEXT_PUBLIC_DSA_INSTRUCTOR_HASH. The passcode itself never leaves your machine.
import { createHash } from "node:crypto";

const passcode = process.argv[2];
if (!passcode) {
  console.error('Usage: node scripts/hash-passcode.mjs "your long passcode"');
  process.exit(1);
}
console.log(createHash("sha256").update(`dsa-instructor:${passcode}`).digest("hex"));
