/**
 * Efficient Artian Optimizer
 * IndexedDB 設定（idb ライブラリ使用）
 */

import { openDB, DBSchema, IDBPDatabase } from 'idb';
import type { Track, KyogekiSkillResult, RestoreResult } from './types';

interface ArtianDB extends DBSchema {
    // トラック管理
    tracks: {
        key: string;
        value: Track & { mode: string };
        indexes: { 'by-mode': string };
    };
    // 巨戟スキル再付与結果
    kyogekiSkillResults: {
        key: string;
        value: KyogekiSkillResult;
        indexes: { 'by-track': string; 'by-index': number };
    };
    // 通常復元強化結果
    normalRestoreResults: {
        key: string;
        value: RestoreResult;
        indexes: { 'by-track': string; 'by-index': number };
    };
    // 巨戟復元強化結果
    kyogekiRestoreResults: {
        key: string;
        value: RestoreResult;
        indexes: { 'by-track': string; 'by-index': number };
    };
}

const DB_NAME = 'ArtianOptimizerDB_v2';
const DB_VERSION = 1;

let dbInstance: IDBPDatabase<ArtianDB> | null = null;

export async function getDB(): Promise<IDBPDatabase<ArtianDB>> {
    if (dbInstance) {
        return dbInstance;
    }

    dbInstance = await openDB<ArtianDB>(DB_NAME, DB_VERSION, {
        upgrade(db) {
            // トラックストア
            if (!db.objectStoreNames.contains('tracks')) {
                const store = db.createObjectStore('tracks', { keyPath: 'id' });
                store.createIndex('by-mode', 'mode');
            }

            // 巨戟スキル結果ストア
            if (!db.objectStoreNames.contains('kyogekiSkillResults')) {
                const store = db.createObjectStore('kyogekiSkillResults', { keyPath: 'id' });
                store.createIndex('by-track', 'trackId');
                store.createIndex('by-index', 'index');
            }

            // 通常復元結果ストア
            if (!db.objectStoreNames.contains('normalRestoreResults')) {
                const store = db.createObjectStore('normalRestoreResults', { keyPath: 'id' });
                store.createIndex('by-track', 'trackId');
                store.createIndex('by-index', 'index');
            }

            // 巨戟復元結果ストア
            if (!db.objectStoreNames.contains('kyogekiRestoreResults')) {
                const store = db.createObjectStore('kyogekiRestoreResults', { keyPath: 'id' });
                store.createIndex('by-track', 'trackId');
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
