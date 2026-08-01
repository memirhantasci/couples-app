
const fs = require("fs");
const path = require("path");

const directory = "src/app/(app)";

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith(".tsx")) {
      processFile(fullPath);
    }
  }
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, "utf-8");
  
  const eqStr = `.eq("couple_id", session.coupleId)`;
  // Some files might have `session?.coupleId`
  const eqRegex = /\.eq\("couple_id",\s*session(\?)?\.coupleId\)\s*\n?\s*/g;
  
  // Find all .from("table").eq("couple_id", session.coupleId)
  // We want to remove it from there and inject it after .select(...)
  let modified = false;

  let newContent = content.replace(/(supabase\s*\n?\s*\.from\([^)]+\))\s*\n?\s*\.eq\("couple_id",\s*session(\?)?\.coupleId\)/g, "$1");

  if (newContent !== content) {
    // Now we need to append .eq("couple_id", session.coupleId) after .select(...) for those specific supabase calls
    // Actually, to make it simple, let us just replace `.select(` with a marker, match parenthesis, then add .eq
    
    // Instead of parsing perfectly, let us just find `.select(` that follows a `.from(`
    // A much safer way: We know exactly the 17 files. 
  }
}

// Just output the files that need manual fixing:
console.log("Files to fix:");
function listFiles(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      listFiles(fullPath);
    } else if (fullPath.endsWith(".tsx")) {
      let c = fs.readFileSync(fullPath, "utf-8");
      if (c.includes(`.eq("couple_id", session`)) {
        console.log(fullPath);
      }
    }
  }
}
listFiles(directory);

