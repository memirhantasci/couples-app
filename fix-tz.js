const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Replace import dayjs from 'dayjs' with import { dayjs } from '@/lib/date'
  if (content.includes('import dayjs from "dayjs"')) {
    content = content.replace(/import dayjs from ["']dayjs["'];?/g, 'import { dayjs } from "@/lib/date";');
    changed = true;
  }
  
  // Remove import 'dayjs/locale/tr'
  if (content.includes('import "dayjs/locale/tr"')) {
    content = content.replace(/import ["']dayjs\/locale\/tr["'];?\r?\n?/g, '');
    changed = true;
  }

  // Remove dayjs.locale('tr')
  if (content.includes('dayjs.locale("tr")')) {
    content = content.replace(/dayjs\.locale\(["']tr["']\);?\r?\n?/g, '');
    changed = true;
  }

  // Replace .format( with .tz("Europe/Istanbul").format(
  // but avoid double tz
  const formatRegex = /\.format\(/g;
  let newContent = content.replace(formatRegex, '.tz("Europe/Istanbul").format(');
  newContent = newContent.replace(/\.tz\("Europe\/Istanbul"\)\.tz\("Europe\/Istanbul"\)\.format\(/g, '.tz("Europe/Istanbul").format(');
  
  if (content !== newContent) {
    content = newContent;
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated ' + filePath);
  }
}

const filesToProcess = [
  'src/components/admin/LoginLogsTable.tsx',
  'src/components/admin/AdminLetterList.tsx',
  'src/app/(app)/admin/medicines/AdminMedicineList.tsx',
  'src/app/(app)/admin/page.tsx',
  'src/app/(app)/admin/moods/page.tsx',
  'src/app/(app)/calendar/page.tsx',
  'src/components/home/MeetingCountdown.tsx',
  'src/app/(app)/medicine/page.tsx',
  'src/components/letters/LetterList.tsx',
  'src/components/calendar/PeriodTrackerClient.tsx',
  'src/components/home/PendingLettersCard.tsx',
  'src/app/(app)/admin/calendar-events/page.tsx'
];

filesToProcess.forEach(f => {
  const fullPath = path.join(process.cwd(), f);
  if(fs.existsSync(fullPath)) processFile(fullPath);
});
