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

function getClosingParenthesisIndex(str, startIndex) {
  let depth = 1;
  let inString = false;
  let stringChar = "";
  for (let i = startIndex + 1; i < str.length; i++) {
    const char = str[i];
    
    // Ignore escaped quotes
    if ((char === '"' || char === "'" || char === "`") && str[i - 1] !== '\\') {
      if (!inString) {
        inString = true;
        stringChar = char;
      } else if (char === stringChar) {
        inString = false;
      }
    }
    
    if (!inString) {
      if (char === "(") depth++;
      else if (char === ")") depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, "utf-8");
  if (!content.includes('.eq("couple_id", session.coupleId)')) {
    if (!content.includes('.eq("couple_id", session?.coupleId)')) {
      return;
    }
  }

  // Remove the old injected string (both session and session?)
  let cleanContent = content.replace(/\s*\n?\s*\.eq\("couple_id",\s*session(\?)?\.coupleId\)/g, "");
  let modified = false;
  
  const tables = ["medicines", "medicine_logs", "memories", "daily_notes", "moods", "meetings", "calendar_notes", "photo_archive", "letters", "period_logs"];
  
  for (const table of tables) {
    // Regex for matching `.from("table")` or `.from('table')`
    const regex = new RegExp(`\\.from\\([\\'\\"\`]${table}[\\'\\"\`]\\)`, "g");
    let match;
    
    // Since we mutate cleanContent, we have to collect all indices first, or just start over since we only insert fixed length strings
    // Actually, simple string search is easier
    let searchStr = `.from("${table}")`;
    let tableIndex = 0;
    while ((tableIndex = cleanContent.indexOf(searchStr, tableIndex)) !== -1) {
      let selectIndex = cleanContent.indexOf(".select(", tableIndex);
      if (selectIndex !== -1 && selectIndex - tableIndex < 50) {
        let closingIndex = getClosingParenthesisIndex(cleanContent, selectIndex + 7);
        if (closingIndex !== -1) {
           const insertStr = `\n      .eq("couple_id", session.coupleId)`;
           cleanContent = cleanContent.slice(0, closingIndex + 1) + insertStr + cleanContent.slice(closingIndex + 1);
           modified = true;
           tableIndex = closingIndex + 1 + insertStr.length; // move past inserted string
           continue;
        }
      }
      tableIndex += searchStr.length;
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, cleanContent, "utf-8");
    console.log("Fixed:", filePath);
  }
}

processDirectory(directory);
