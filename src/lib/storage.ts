'use client';

import { openDB, IDBPDatabase } from 'idb';
import { SessionLog, DailySummary } from '@/types';

const DB_NAME    = 'tashihikizan';
const DB_VERSION = 1;

type AppDB = {
  sessions: {
    key: string;
    value: SessionLog;
    indexes: { byDate: string };
  };
  dailySummary: {
    key: string;   // 'YYYY-MM-DD'
    value: DailySummary;
  };
};

let dbPromise: Promise<IDBPDatabase<AppDB>> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<AppDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('sessions')) {
          const store = db.createObjectStore('sessions', { keyPath: 'id' });
          store.createIndex('byDate', 'startedAt');
        }
        if (!db.objectStoreNames.contains('dailySummary')) {
          db.createObjectStore('dailySummary', { keyPath: 'date' });
        }
      },
    });
  }
  return dbPromise;
}

export async function saveSession(log: SessionLog): Promise<void> {
  const db = await getDB();
  await db.put('sessions', log);

  // dailySummary を更新
  const date = log.startedAt.slice(0, 10);
  const existing = await db.get('dailySummary', date);
  const summary: DailySummary = existing
    ? {
        ...existing,
        sessions: [
          ...existing.sessions.filter(s => s.id !== log.id),
          log,
        ],
        lastPlayedAt: log.endedAt,
      }
    : {
        date,
        sessions: [log],
        lastPlayedAt: log.endedAt,
      };
  await db.put('dailySummary', summary);
}

export async function getTodaySummary(): Promise<DailySummary | null> {
  const db = await getDB();
  const date = new Date().toISOString().slice(0, 10);
  return (await db.get('dailySummary', date)) ?? null;
}

export async function getRecentSessions(limit = 10): Promise<SessionLog[]> {
  const db   = await getDB();
  const all  = await db.getAll('sessions');
  return all
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt))
    .slice(0, limit);
}
