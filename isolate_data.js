const fs = require("fs");
const path = require("path");

const tables = ["medicines", "medicine_logs", "memories", "daily_notes", "moods", "meetings", "calendar_notes", "photo_archive", "letters", "period_logs"];
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
  let modified = false;

  for (const table of tables) {
    // Regex to find supabase.from("table") or supabase.from( 'table' )
    // that is NOT already followed by .eq("couple_id"
    const regex = new RegExp(`(supabase\\s*\\n?\\s*\\.from\\([\\'\\"]${table}[\\'\\"]\\))(?!\\s*\\n?\\s*\\.eq\\([\\'\\"]couple_id[\\'\\"])`, "g");
    
    if (regex.test(content)) {
      content = content.replace(regex, `$1.eq("couple_id", session.coupleId)`);
      modified = true;
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content, "utf-8");
    console.log("Modified:", filePath);
  }
}

processDirectory(directory);
