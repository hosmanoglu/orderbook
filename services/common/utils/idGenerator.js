import crypto from "crypto";

function generateUniqueId() {
  return crypto.randomBytes(8).toString("hex");
}

export { generateUniqueId };
