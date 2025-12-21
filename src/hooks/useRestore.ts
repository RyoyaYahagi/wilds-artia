/**
 * 復元強化モード用フック（通常・巨戟共通）
 */

import { useState, useEffect, useCallback } from 'react';
import { getDB, generateId } from '../db';
import type { RestoreEntry } from '../types';

type RestoreStore = 'normalRestore' | 'kyogekiRestore';

export function useRestore(store: RestoreStore) {
    const [entries, setEntries] = useState<RestoreEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // 初期読み込み
    useEffect(() => {
        const loadData = async () => {
            try {
                const db = await getDB();
                const data = await db.getAllFromIndex(store, 'by-index');
                setEntries(data);
            } catch (e) {
                console.error('Failed to load data:', e);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [store]);

    // エントリ追加
    const addEntry = useCallback(async (bonusType: string, bonusValue: string, isTarget: boolean = false) => {
        const db = await getDB();
        const newEntry: RestoreEntry = {
            id: generateId(),
            index: entries.length + 1,
            bonusType,
            bonusValue,
            isTarget,
            createdAt: new Date().toISOString(),
        };
        await db.add(store, newEntry);
        setEntries(prev => [...prev, newEntry]);
        return newEntry.id;
    }, [entries.length, store]);

    // ハズレ追加
    const addMiss = useCallback(async () => {
        return addEntry('-', '-', false);
    }, [addEntry]);

    // Target切替
    const toggleTarget = useCallback(async (id: string) => {
        const db = await getDB();
        const entry = await db.get(store, id);
        if (!entry) return;

        const updated = { ...entry, isTarget: !entry.isTarget };
        await db.put(store, updated);
        setEntries(prev => prev.map(e => e.id === id ? updated : e));
    }, [store]);

    // エントリ削除
    const deleteEntry = useCallback(async (id: string) => {
        const db = await getDB();
        await db.delete(store, id);
        setEntries(prev => {
            const filtered = prev.filter(e => e.id !== id);
            return filtered.map((e, i) => ({ ...e, index: i + 1 }));
        });
        // DB側のインデックスも更新
        const db2 = await getDB();
        const remaining = await db2.getAll(store);
        for (let i = 0; i < remaining.length; i++) {
            const updated = { ...remaining[i], index: i + 1 };
            await db2.put(store, updated);
        }
    }, [store]);

    // 全削除
    const clearAll = useCallback(async () => {
        const db = await getDB();
        await db.clear(store);
        setEntries([]);
    }, [store]);

    return {
        entries,
        isLoading,
        addEntry,
        addMiss,
        toggleTarget,
        deleteEntry,
        clearAll,
    };
}
