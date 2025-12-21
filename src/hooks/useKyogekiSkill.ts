/**
 * 巨戟スキル再付与モード用フック
 */

import { useState, useEffect, useCallback } from 'react';
import { getDB, generateId } from '../db';
import type { KyogekiSkillEntry } from '../types';

export function useKyogekiSkill() {
    const [entries, setEntries] = useState<KyogekiSkillEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // 初期読み込み
    useEffect(() => {
        const loadData = async () => {
            try {
                const db = await getDB();
                const data = await db.getAllFromIndex('kyogekiSkill', 'by-index');
                setEntries(data);
            } catch (e) {
                console.error('Failed to load data:', e);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, []);

    // エントリ追加
    const addEntry = useCallback(async (seriesSkill: string, groupSkill: string, isTarget: boolean = false) => {
        const db = await getDB();
        const newEntry: KyogekiSkillEntry = {
            id: generateId(),
            index: entries.length + 1,
            seriesSkill,
            groupSkill,
            isTarget,
            createdAt: new Date().toISOString(),
        };
        await db.add('kyogekiSkill', newEntry);
        setEntries(prev => [...prev, newEntry]);
        return newEntry.id;
    }, [entries.length]);

    // ハズレ追加
    const addMiss = useCallback(async () => {
        return addEntry('-', '-', false);
    }, [addEntry]);

    // Target切替
    const toggleTarget = useCallback(async (id: string) => {
        const db = await getDB();
        const entry = await db.get('kyogekiSkill', id);
        if (!entry) return;

        const updated = { ...entry, isTarget: !entry.isTarget };
        await db.put('kyogekiSkill', updated);
        setEntries(prev => prev.map(e => e.id === id ? updated : e));
    }, []);

    // エントリ削除
    const deleteEntry = useCallback(async (id: string) => {
        const db = await getDB();
        await db.delete('kyogekiSkill', id);
        setEntries(prev => {
            const filtered = prev.filter(e => e.id !== id);
            // インデックス振り直し
            return filtered.map((e, i) => ({ ...e, index: i + 1 }));
        });
        // DB側のインデックスも更新
        const db2 = await getDB();
        const remaining = await db2.getAll('kyogekiSkill');
        for (let i = 0; i < remaining.length; i++) {
            const updated = { ...remaining[i], index: i + 1 };
            await db2.put('kyogekiSkill', updated);
        }
    }, []);

    // 全削除
    const clearAll = useCallback(async () => {
        const db = await getDB();
        await db.clear('kyogekiSkill');
        setEntries([]);
    }, []);

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
