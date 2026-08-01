"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const MOOD_SCORES: Record<string, number> = {
  "😍": 6,
  "😊": 5,
  "😐": 4,
  "😔": 3,
  "😢": 2,
  "😴": 1,
};

const MOOD_LABELS: Record<string, string> = {
  "😍": "Çok mutlu",
  "😊": "İyi",
  "😐": "Normal",
  "😔": "Biraz kötü",
  "😢": "Moral bozuk",
  "😴": "Yorgun",
};

interface Mood {
  date: string;
  mood_type: string;
  user_id: number;
}

interface User {
  id: number;
  username: string;
  display_name?: string;
}

interface MoodChartProps {
  moods: Mood[];
  users: User[];
}

export function MoodChart({ moods, users }: MoodChartProps) {
  // Group moods by date and user
  const dateMap: Record<string, Record<number, string>> = {};
  moods.forEach((m) => {
    if (!dateMap[m.date]) dateMap[m.date] = {};
    dateMap[m.date][m.user_id] = m.mood_type;
  });

  const sortedDates = Object.keys(dateMap).sort();

  const chartData = sortedDates.map((date) => {
    const entry: Record<string, string | number> = {
      date: new Date(date + "T00:00:00").toLocaleDateString("tr-TR", {
        day: "numeric",
        month: "short",
      }),
    };
    users.forEach((u) => {
      const name = u.display_name || u.username;
      entry[name] = MOOD_SCORES[dateMap[date][u.id] ?? ""] ?? 0;
    });
    return entry;
  });

  const COLORS = ["#E8002D", "#FFD700"];

  return (
    <div className="card p-5">
      <h3 className="font-bold text-white mb-4 text-sm">
        Ruh Hali İstatistikleri (Son 30 Gün)
      </h3>

      {chartData.length === 0 ? (
        <div
          className="flex items-center justify-center py-12"
          style={{ color: "rgba(255,255,255,0.3)", fontSize: 13 }}
        >
          Henüz ruh hali verisi yok
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="date"
                tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                domain={[0, 6]}
                tickFormatter={(v) =>
                  Object.entries(MOOD_SCORES).find(([, score]) => score === v)?.[0] ?? ""
                }
                tick={{ fontSize: 14 }}
                tickLine={false}
                axisLine={false}
                width={28}
              />
              <Tooltip
                contentStyle={{
                  background: "rgba(19,19,39,0.95)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 12,
                  fontSize: 12,
                  color: "#fff",
                }}
                formatter={(value: number, name: string) => {
                  const emoji = Object.entries(MOOD_SCORES).find(
                    ([, score]) => score === value
                  )?.[0];
                  return [emoji ? `${emoji} ${MOOD_LABELS[emoji]}` : "-", name];
                }}
              />
              {users.map((u, i) => {
                const name = u.display_name || u.username;
                return (
                  <Line
                    key={u.id}
                    type="monotone"
                    dataKey={name}
                    stroke={COLORS[i % COLORS.length]}
                    strokeWidth={2.5}
                    dot={{ fill: COLORS[i % COLORS.length], r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>

          {/* Legend */}
          <div className="flex gap-4 mt-3">
            {users.map((u, i) => {
              const name = u.display_name || u.username;
              return (
                <div key={u.id} className="flex items-center gap-1.5">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ background: COLORS[i % COLORS.length] }}
                  />
                  <span
                    style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, textTransform: "capitalize" }}
                  >
                    {name}
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
