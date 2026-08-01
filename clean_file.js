const fs = require('fs');

try {
  const filePath = 'src/actions/auth.ts';
  const buffer = fs.readFileSync(filePath);
  
  // Find the index of "export async function verifyResetAction"
  // Since it might be corrupted, we can search for "export async function verifyReset" in ascii
  const searchString = "export async function verifyReset";
  let searchBuffer = Buffer.from(searchString, 'ascii');
  let index = buffer.indexOf(searchBuffer);
  
  if (index !== -1) {
    console.log("Found corrupted section at index " + index);
    // Truncate the buffer
    const cleanBuffer = buffer.slice(0, index);
    fs.writeFileSync(filePath, cleanBuffer);
    console.log("File truncated to remove corrupted section.");
  } else {
    console.log("String not found, attempting to decode to utf-8 loosely.");
    const text = buffer.toString('utf8'); // will replace invalid chars with replacement character
    fs.writeFileSync(filePath, text, 'utf8');
  }
} catch (e) {
  console.error("Error cleaning file:", e);
}
