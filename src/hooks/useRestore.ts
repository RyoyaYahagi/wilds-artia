/**
 * 復元強化モード用フック（複数トラック対応、通常・巨戟共通）
 */

import { useState, useEffect, useCallback } from 'react';
import { getDB, generateId } from '../db';
import type { Track, RestoreResult, WeaponType, ElementType } from '../types';

type RestoreMode = 'normalRestore' | 'kyogekiRestore';
type ResultStore = 'normalRestoreResults' | 'kyogekiRestoreResults';

const getResultStore = (mode: RestoreMode): ResultStore => {
    return mode === 'normalRestore' ? 'normalRestoreResults' : 'kyogekiRestoreResults';
};

export function useRestore(mode: RestoreMode) {
    const [tracks, setTracks] = useState<Track[]>([]);
    const [results, setResults] = useState<RestoreResult[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const resultStore = getResultStore(mode);

    // 初期読み込み
    useEffect(() => {
        const loadData = async () => {
            try {
                const db = await getDB();
                const allTracks = await db.getAllFromIndex('tracks', 'by-mode', mode);
                const allResults = await db.getAll(resultStore);
                setTracks(allTracks);
                setResults(allResults);
            } catch (e) {
                console.error('Failed to load data:', e);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [mode, resultStore]);

    // トラック追加
    const addTrack = useCallback(async (weaponType: WeaponType, element: ElementType) => {
        const db = await getDB();
        const newTrack: Track & { mode: string } = {
            id: generateId(),
            weaponType,
            element,
            mode,
            createdAt: new Date().toISOString(),
        };
        await db.add('tracks', newTrack);
        setTracks(prev => [...prev, newTrack]);
        return newTrack.id;
    }, [mode]);

    // トラック削除（関連結果も削除）
    const deleteTrack = useCallback(async (trackId: string) => {
        const db = await getDB();
        await db.delete('tracks', trackId);
        // 関連結果を削除
        const relatedResults = results.filter(r => r.trackId === trackId);
        for (const r of relatedResults) {
            await db.delete(resultStore, r.id);
        }
        setTracks(prev => prev.filter(t => t.id !== trackId));
        setResults(prev => prev.filter(r => r.trackId !== trackId));
    }, [results, resultStore]);

    // 指定トラックに結果追加
    const addResult = useCallback(async (
        trackId: string,
        bonusType: string,
        bonusValue: string,
        isTarget: boolean = false
    ) => {
        const db = await getDB();
        const trackResults = results.filter(r => r.trackId === trackId);
        const maxIndex = trackResults.length > 0
            ? Math.max(...trackResults.map(r => r.index))
            : 0;

        const newResult: RestoreResult = {
            id: generateId(),
            trackId,
            index: maxIndex + 1,
            bonusType,
            bonusValue,
            isTarget,
            createdAt: new Date().toISOString(),
        };
        await db.add(resultStore, newResult);
        setResults(prev => [...prev, newResult]);
        return newResult.id;
    }, [results, resultStore]);

    // ハズレ追加
    const addMiss = useCallback(async (trackId: string) => {
        return addResult(trackId, 'ハズレ', '-', false);
    }, [addResult]);

    // Target切替
    const toggleTarget = useCallback(async (resultId: string) => {
        const db = await getDB();
        const result = await db.get(resultStore, resultId);
        if (!result) return;

        const updated = { ...result, isTarget: !result.isTarget };
        await db.put(resultStore, updated);
        setResults(prev => prev.map(r => r.id === resultId ? updated : r));
    }, [resultStore]);

    // 結果削除
    const deleteResult = useCallback(async (resultId: string) => {
        const db = await getDB();
        const result = await db.get(resultStore, resultId);
        if (!result) return;

        await db.delete(resultStore, resultId);

        const trackId = result.trackId;
        const remaining = results
            .filter(r => r.trackId === trackId && r.id !== resultId)
            .sort((a, b) => a.index - b.index);

        for (let i = 0; i < remaining.length; i++) {
            const updated = { ...remaining[i], index: i + 1 };
            await db.put(resultStore, updated);
        }

        setResults(prev => {
            const filtered = prev.filter(r => r.id !== resultId);
            return filtered.map(r => {
                if (r.trackId !== trackId) return r;
                const sameTrack = filtered
                    .filter(x => x.trackId === trackId)
                    .sort((a, b) => a.index - b.index);
                const idx = sameTrack.findIndex(x => x.id === r.id);
                return { ...r, index: idx + 1 };
            });
        });
    }, [results, resultStore]);

    // 全削除
    const clearAll = useCallback(async () => {
        const db = await getDB();
        for (const t of tracks) {
            await db.delete('tracks', t.id);
        }
        await db.clear(resultStore);
        setTracks([]);
        setResults([]);
    }, [tracks, resultStore]);

    // トラックごとの結果を取得
    const getResultsByTrack = useCallback((trackId: string) => {
        return results
            .filter(r => r.trackId === trackId)
            .sort((a, b) => a.index - b.index);
    }, [results]);

    return {
        tracks,
        results,
        isLoading,
        addTrack,
        deleteTrack,
        addResult,
        addMiss,
        toggleTarget,
        deleteResult,
        clearAll,
        getResultsByTrack,
    };
}
