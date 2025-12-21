/**
 * Efficient Artian Optimizer
 * IndexedDB 設定（idb ライブラリ使用）
 */

import { openDB, DBSchema, IDBPDatabase } from 'idb';
import type { KyogekiSkillEntry, RestoreEntry } from './types';

interface ArtianDB extends DBSchema {
    normalRestore: {
        key: string;
        value: RestoreEntry;
        indexes: { 'by-index': number };
    };
    kyogekiSkill: {
        key: string;
        value: KyogekiSkillEntry;
        indexes: { 'by-index': number };
    };
    kyogekiRestore: {
        key: string;
        value: RestoreEntry;
        indexes: { 'by-index': number };
    };
}

const DB_NAME = 'ArtianOptimizerDB';
const DB_VERSION = 1;

let dbInstance: IDBPDatabase<ArtianDB> | null = null;

export async function getDB(): Promise<IDBPDatabase<ArtianDB>> {
    if (dbInstance) {
        return dbInstance;
    }

    dbInstance = await openDB<ArtianDB>(DB_NAME, DB_VERSION, {
        upgrade(db) {
            // 通常復元強化ストア
            if (!db.objectStoreNames.contains('normalRestore')) {
                const store = db.createObjectStore('normalRestore', { keyPath: 'id' });
                store.createIndex('by-index', 'index');
            }

            // 巨戟スキル再付与ストア
            if (!db.objectStoreNames.contains('kyogekiSkill')) {
                const store = db.createObjectStore('kyogekiSkill', { keyPath: 'id' });
                store.createIndex('by-index', 'index');
            }

            // 巨戟復元強化ストア
            if (!db.objectStoreNames.contains('kyogekiRestore')) {
                const store = db.createObjectStore('kyogekiRestore', { keyPath: 'id' });
                store.createIndex('by-index', 'index');
            }
        },
    });

    return dbInstance;
}

/** ユニークID生成 */
export function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
