/**
 * 巨戟スキル再付与モード（複数トラック対応）
 */

import { useState, useCallback } from 'react';
import {
    Target, Trash2, Plus, Sparkles, RotateCcw, Zap,
    ChevronDown, ChevronUp, Flame, Download
} from 'lucide-react';
import { useKyogekiSkill } from '../hooks/useKyogekiSkill';
import {
    SERIES_SKILLS, WEAPON_TYPES, ELEMENT_TYPES
} from '../constants';
import { OptimizationChart } from './OptimizationChart';
import { SkillTable } from './SkillTable';
import { ConfirmModal } from './ConfirmModal';
import { useToast } from './Toast';
import type {
    OptimizationResult, KyogekiSkillResult, Track,
    WeaponType, ElementType
} from '../types';

/** 属性カラー */
function getElementColor(element: ElementType): string {
    const colors: Record<ElementType, string> = {
        '火': 'text-orange-500',
        '水': 'text-blue-400',
        '雷': 'text-yellow-400',
        '氷': 'text-cyan-400',
        '龍': 'text-purple-400',
        '麻痺': 'text-amber-300',
        '通常・貫通': 'text-zinc-300',
    };
    return colors[element] || 'text-zinc-400';
}

/** テストデータ生成 */
function generateTestData() {
    return [
        {
            weaponType: '双剣',
            element: '火',
            results: [
                { id: 1, series: '鎧竜の力', group: '-', isTarget: false },
                { id: 2, series: '雷顎竜の闘志', group: '-', isTarget: false },
                { id: 3, series: '海竜の渦雷', group: '-', isTarget: false },
                { id: 4, series: '千刃竜の闘志', group: 'ヌシの魂', isTarget: true }, // 当たり
                { id: 5, series: '護鎖刃竜の命脈', group: '-', isTarget: false },
                { id: 6, series: '煌雷竜の力', group: '-', isTarget: false },
                { id: 7, series: '火竜の力', group: 'ヌシの魂', isTarget: true }, // 当たり
                { id: 8, series: '鎖刃竜の飢餓', group: 'ヌシの魂', isTarget: true }, // 当たり
                { id: 9, series: '黒蝕竜の力', group: '-', isTarget: false },
                { id: 10, series: '護鎖刃竜の命脈', group: '-', isTarget: false },
                { id: 11, series: '雷顎竜の闘志', group: '-', isTarget: false },
                { id: 12, series: '雷顎竜の闘志', group: '-', isTarget: false },
                { id: 13, series: '火竜の力', group: '-', isTarget: false },
                { id: 14, series: '兇爪竜の力', group: '-', isTarget: false },
                { id: 15, series: '黒蝕竜の力', group: '-', isTarget: false },
                { id: 16, series: '暗黒騎士の証', group: '-', isTarget: false },
                { id: 17, series: '泡狐竜の力', group: '-', isTarget: false },
                { id: 18, series: '煌雷竜の力', group: '-', isTarget: false },
                { id: 19, series: '兇爪竜の力', group: '-', isTarget: false },
                { id: 20, series: '暗器蛸の力', group: 'ヌシの魂', isTarget: true }, // 当たり
            ]
        },
        {
            weaponType: '双剣',
            element: '龍',
            results: [
                { id: 1, series: '嵐竜の力', group: '-', isTarget: false },
                { id: 2, series: '鎧竜の守護', group: '-', isTarget: false },
                { id: 3, series: '雪獅子の闘志', group: '-', isTarget: false },
                { id: 4, series: '雷顎竜の闘志', group: '-', isTarget: false },
                { id: 5, series: '白織竜の脈動', group: '-', isTarget: false },
                { id: 6, series: '闘獣の力', group: '-', isTarget: false },
                { id: 7, series: '鎖刃竜の飢餓', group: '-', isTarget: false },
                { id: 8, series: '黒蝕竜の力', group: '-', isTarget: false },
                { id: 9, series: '煌雷竜の力', group: '-', isTarget: false },
                { id: 10, series: '護鎖刃竜の命脈', group: '-', isTarget: false },
                { id: 11, series: '千刃竜の闘志', group: '-', isTarget: false },
                { id: 12, series: '凍峰竜の反逆', group: '-', isTarget: false },
                { id: 13, series: '黒蝕竜の力', group: '-', isTarget: false },
                { id: 14, series: '暗器蛸の力', group: '-', isTarget: false },
                { id: 15, series: '白織竜の脈動', group: 'ヌシの魂', isTarget: true }, // 当たり
                { id: 16, series: '獄焔蛸の反逆', group: '-', isTarget: false },
                { id: 17, series: '海竜の渦雷', group: '-', isTarget: false },
                { id: 18, series: '鎧竜の守護', group: '-', isTarget: false },
                { id: 19, series: '兇爪竜の力', group: '-', isTarget: false },
                { id: 20, series: '煌雷竜の力', group: '-', isTarget: false },
            ]
        },
        {
            weaponType: 'ガンランス',
            element: '麻痺',
            results: [
                { id: 1, series: '暗器蛸の力', group: '-', isTarget: false },
                { id: 2, series: '暗器蛸の力', group: '-', isTarget: false },
                { id: 3, series: '凍峰竜の反逆', group: '-', isTarget: false },
                { id: 4, series: '黒蝕竜の力', group: '-', isTarget: false },
                { id: 5, series: '暗黒騎士の証', group: '-', isTarget: false },
                { id: 6, series: '凍峰竜の反逆', group: '-', isTarget: false },
                { id: 7, series: '雷顎竜の闘志', group: '-', isTarget: false },
                { id: 8, series: '獄焔蛸の反逆', group: '-', isTarget: false },
                { id: 9, series: '巨戟竜の黙示録', group: '-', isTarget: false },
                { id: 10, series: '鎖刃竜の飢餓', group: '-', isTarget: false },
                { id: 11, series: '波衣竜の守護', group: '-', isTarget: false },
                { id: 12, series: 'オメガレゾナンス', group: '-', isTarget: false },
                { id: 13, series: '火竜の力', group: '-', isTarget: false },
                { id: 14, series: '兇爪竜の力', group: '-', isTarget: false },
                { id: 15, series: '鎧竜の守護', group: '-', isTarget: false },
                { id: 16, series: '火竜の力', group: '-', isTarget: false },
                { id: 17, series: '闘獣の力', group: '-', isTarget: false },
                { id: 18, series: '暗黒騎士の証', group: '-', isTarget: false },
                { id: 19, series: '海竜の渦雷', group: '-', isTarget: false },
                { id: 20, series: '海竜の渦雷', group: '-', isTarget: false },
            ]
        },
        {
            weaponType: 'ライトボウガン',
            element: '通常・貫通', // 画像では通常と貫通が同じテーブル
            results: [
                { id: 1, series: '闘獣の力', group: 'ヌシの魂', isTarget: true }, // 当たり
                { id: 2, series: '暗器蛸の力', group: '-', isTarget: false },
                { id: 3, series: '護鎖刃竜の命脈', group: '-', isTarget: false },
                { id: 4, series: 'オメガレゾナンス', group: '-', isTarget: false },
                { id: 5, series: '鎧竜の守護', group: '-', isTarget: false },
                { id: 6, series: '煌雷竜の力', group: '-', isTarget: false },
                { id: 7, series: '護鎖刃竜の命脈', group: '-', isTarget: false },
                { id: 8, series: '獄焔蛸の反逆', group: '-', isTarget: false },
                { id: 9, series: '雷顎竜の闘志', group: '-', isTarget: false },
                { id: 10, series: '兇爪竜の力', group: '-', isTarget: false },
                { id: 11, series: '闘獣の力', group: '-', isTarget: false },
                { id: 12, series: 'オメガレゾナンス', group: '-', isTarget: false },
                { id: 13, series: '獄焔蛸の反逆', group: '-', isTarget: false },
                { id: 14, series: '凍峰竜の反逆', group: '-', isTarget: false },
                { id: 15, series: '鎧竜の守護', group: '-', isTarget: false },
                { id: 16, series: '雷顎竜の闘志', group: '-', isTarget: false },
                { id: 17, series: 'オメガレゾナンス', group: '-', isTarget: false },
                { id: 18, series: '暗黒騎士の証', group: '-', isTarget: false },
                { id: 19, series: 'オメガレゾナンス', group: '-', isTarget: false },
                { id: 20, series: '巨戟竜の黙示録', group: '-', isTarget: false },
            ]
        },
        {
            weaponType: 'ヘビィボウガン',
            element: '火',
            results: [
                { id: 1, series: '黒蝕竜の力', group: '-', isTarget: false },
                { id: 2, series: '黒蝕竜の力', group: '-', isTarget: false },
                { id: 3, series: '兇爪竜の力', group: '-', isTarget: false },
                { id: 4, series: '鎖刃竜の飢餓', group: '-', isTarget: false },
                { id: 5, series: '鎖刃竜の飢餓', group: '-', isTarget: false },
                { id: 6, series: '闘獣の力', group: '-', isTarget: false },
                { id: 7, series: 'オメガレゾナンス', group: '-', isTarget: false },
                { id: 8, series: '暗黒騎士の証', group: '-', isTarget: false },
                { id: 9, series: '鎖刃竜の飢餓', group: '-', isTarget: false },
                { id: 10, series: '凍峰竜の反逆', group: '-', isTarget: false },
                { id: 11, series: '巨戟竜の黙示録', group: '-', isTarget: false },
                { id: 12, series: '兇爪竜の力', group: '-', isTarget: false },
                { id: 13, series: '白織竜の脈動', group: '-', isTarget: false },
                { id: 14, series: '兇爪竜の力', group: '-', isTarget: false },
                { id: 15, series: '雪獅子の闘志', group: '-', isTarget: false },
                { id: 16, series: '暗器蛸の力', group: '-', isTarget: false },
                { id: 17, series: '護鎖刃竜の命脈', group: '-', isTarget: false },
                { id: 18, series: 'オメガレゾナンス', group: '-', isTarget: false },
                { id: 19, series: '暗器蛸の力', group: '-', isTarget: false },
                { id: 20, series: '火竜の力', group: '-', isTarget: false },
            ]
        },
        {
            weaponType: 'ヘビィボウガン',
            element: '水',
            results: [
                { id: 1, series: 'オメガレゾナンス', group: '-', isTarget: false },
                { id: 2, series: '兇爪竜の力', group: '-', isTarget: false },
                { id: 3, series: '凍峰竜の反逆', group: '-', isTarget: false },
                { id: 4, series: 'オメガレゾナンス', group: 'ヌシの魂', isTarget: true }, // 当たり
                { id: 5, series: '海竜の渦雷', group: '-', isTarget: false },
                { id: 6, series: '煌雷竜の力', group: '-', isTarget: false },
                { id: 7, series: '護鎖刃竜の命脈', group: '-', isTarget: false },
                { id: 8, series: '闘獣の力', group: '-', isTarget: false },
                { id: 9, series: '白織竜の脈動', group: '-', isTarget: false },
                { id: 10, series: '煌雷竜の力', group: '-', isTarget: false },
                { id: 11, series: '暗器蛸の力', group: '-', isTarget: false },
                { id: 12, series: '火竜の力', group: '-', isTarget: false },
                { id: 13, series: '雪獅子の闘志', group: '-', isTarget: false },
                { id: 14, series: '波衣竜の守護', group: '-', isTarget: false },
                { id: 15, series: '凍峰竜の反逆', group: '-', isTarget: false },
                { id: 16, series: '闘獣の力', group: '-', isTarget: false },
                { id: 17, series: '泡狐竜の力', group: 'ヌシの魂', isTarget: true }, // 当たり
                { id: 18, series: '雪獅子の闘志', group: '-', isTarget: false },
                { id: 19, series: '煌雷竜の力', group: 'ヌシの魂', isTarget: true }, // 当たり
                { id: 20, series: '海竜の渦雷', group: '-', isTarget: false },
            ]
        },
        {
            weaponType: 'ヘビィボウガン',
            element: '雷',
            results: [
                { id: 1, series: '暗黒騎士の証', group: 'ヌシの魂', isTarget: true }, // 当たり
                { id: 2, series: '鎖刃竜の飢餓', group: 'ヌシの魂', isTarget: true }, // 当たり
                { id: 3, series: '海竜の渦雷', group: '-', isTarget: false },
                { id: 4, series: '黒蝕竜の力', group: '-', isTarget: false },
                { id: 5, series: '煌雷竜の力', group: '-', isTarget: false },
                { id: 6, series: '煌雷竜の力', group: 'ヌシの魂', isTarget: true }, // 当たり
                { id: 7, series: '暗器蛸の力', group: '-', isTarget: false },
                { id: 8, series: '獄焔蛸の反逆', group: '-', isTarget: false },
                { id: 9, series: '雷顎竜の闘志', group: '-', isTarget: false },
                { id: 10, series: '波衣竜の守護', group: '-', isTarget: false },
                { id: 11, series: '火竜の力', group: '-', isTarget: false },
                { id: 12, series: '巨戟竜の黙示録', group: '-', isTarget: false },
                { id: 13, series: '雷顎竜の闘志', group: '-', isTarget: false },
                { id: 14, series: '鎧竜の守護', group: '-', isTarget: false },
                { id: 15, series: '暗黒騎士の証', group: '-', isTarget: false },
                { id: 16, series: '波衣竜の守護', group: '-', isTarget: false },
                { id: 17, series: '波衣竜の守護', group: 'ヌシの魂', isTarget: true }, // 当たり
                { id: 18, series: '闘獣の力', group: '-', isTarget: false },
                { id: 19, series: '波衣竜の守護', group: 'ヌシの魂', isTarget: true }, // 当たり
                { id: 20, series: '黒蝕竜の力', group: '-', isTarget: false },
            ]
        },
        {
            weaponType: 'ヘビィボウガン',
            element: '氷',
            results: [
                { id: 1, series: '巨戟竜の黙示録', group: '-', isTarget: false },
                { id: 2, series: '千刃竜の闘志', group: '-', isTarget: false },
                { id: 3, series: '護鎖刃竜の命脈', group: '-', isTarget: false },
                { id: 4, series: '闘獣の力', group: '-', isTarget: false },
                { id: 5, series: '闘獣の力', group: '-', isTarget: false },
                { id: 6, series: '闘獣の力', group: '-', isTarget: false },
                { id: 7, series: '黒蝕竜の力', group: '-', isTarget: false },
                { id: 8, series: '護鎖刃竜の命脈', group: '-', isTarget: false },
                { id: 9, series: '護鎖刃竜の命脈', group: '-', isTarget: false },
                { id: 10, series: '暗器蛸の力', group: '-', isTarget: false },
                { id: 11, series: '雷顎竜の闘志', group: '-', isTarget: false },
                { id: 12, series: '千刃竜の闘志', group: '-', isTarget: false },
                { id: 13, series: '波衣竜の守護', group: '-', isTarget: false },
                { id: 14, series: '暗器蛸の力', group: '-', isTarget: false },
                { id: 15, series: '巨戟竜の黙示録', group: '-', isTarget: false },
                { id: 16, series: '煌雷竜の力', group: '-', isTarget: false },
                { id: 17, series: '鎖刃竜の飢餓', group: '-', isTarget: false },
                { id: 18, series: '雪獅子の闘志', group: '-', isTarget: false },
                { id: 19, series: '暗黒騎士の証', group: '-', isTarget: false },
                { id: 20, series: '黒蝕竜の力', group: '-', isTarget: false },
            ]
        }
    ];
}

/** 最適化チャート生成（全トラック横断） */
function generateOptimization(
    tracks: Track[],
    results: KyogekiSkillResult[]
): OptimizationResult {
    const targets = results.filter(r => r.isTarget);
    if (targets.length === 0) {
        return { steps: [], maxIndex: 0, conflicts: [] };
    }

    const indexMap = new Map<number, KyogekiSkillResult[]>();
    for (const t of targets) {
        const existing = indexMap.get(t.index) || [];
        existing.push(t);
        indexMap.set(t.index, existing);
    }

    const conflicts: OptimizationResult['conflicts'] = [];
    for (const [index, items] of indexMap) {
        if (items.length > 1) {
            conflicts.push({
                index,
                entries: items.map(r => {
                    const track = tracks.find(t => t.id === r.trackId);
                    return {
                        label: `${r.seriesSkill}/${r.groupSkill}`,
                        trackLabel: track ? `${track.element}${track.weaponType}` : '不明',
                    };
                }),
            });
        }
    }

    const maxIndex = Math.max(...targets.map(t => t.index));
    const steps: OptimizationResult['steps'] = [];

    for (let i = 1; i <= maxIndex; i++) {
        const target = targets.find(t => t.index === i);
        if (target) {
            const track = tracks.find(t => t.id === target.trackId);
            steps.push({
                index: i,
                type: 'target',
                label: `${target.seriesSkill}${target.groupSkill !== '-' ? ` / ${target.groupSkill}` : ''}`,
                trackLabel: track ? `${track.element}${track.weaponType}` : undefined,
            });
        } else {
            steps.push({ index: i, type: 'skip', label: '任意の武器で強化' });
        }
    }

    return { steps, maxIndex, conflicts };
}

export function KyogekiSkillMode() {
    const {
        tracks, results, isLoading,
        addTrack, deleteTrack, addResult, addMiss,
        toggleTarget, deleteResult, clearAll, getResultsByTrack
    } = useKyogekiSkill();

    const { showToast } = useToast();

    // トラック追加用
    const [newWeapon, setNewWeapon] = useState<WeaponType>('双剣');
    const [newElement, setNewElement] = useState<ElementType>('火');

    // 結果入力用
    const [selectedSeries, setSelectedSeries] = useState<string>(SERIES_SKILLS[0]);

    // 展開中のトラック
    const [expandedTracks, setExpandedTracks] = useState<Set<string>>(new Set());

    // モーダル
    const [optimization, setOptimization] = useState<OptimizationResult | null>(null);
    const [showClearModal, setShowClearModal] = useState(false);
    const [showTestModal, setShowTestModal] = useState(false);

    const handleAddTrack = useCallback(async () => {
        const exists = tracks.some(t => t.weaponType === newWeapon && t.element === newElement);
        if (exists) {
            showToast(`${newElement}属性の${newWeapon}は既に追加されています`);
            return;
        }
        const id = await addTrack(newWeapon, newElement);
        setExpandedTracks(prev => new Set([...prev, id]));
    }, [addTrack, newWeapon, newElement, tracks, showToast]);

    const toggleExpand = useCallback((trackId: string) => {
        setExpandedTracks(prev => {
            const next = new Set(prev);
            if (next.has(trackId)) {
                next.delete(trackId);
            } else {
                next.add(trackId);
            }
            return next;
        });
    }, []);

    const handleAddResult = useCallback(async (trackId: string, groupSkill: string = '-') => {
        await addResult(trackId, selectedSeries, groupSkill, groupSkill === 'ヌシの魂');
    }, [addResult, selectedSeries]);

    const handleGenerate = useCallback(() => {
        const result = generateOptimization(tracks, results);
        setOptimization(result);
    }, [tracks, results]);

    // 全削除（バックアップ付き）
    const handleClear = useCallback(async () => {
        // 削除前にバックアップを保存
        const backup = {
            timestamp: new Date().toISOString(),
            tracks,
            results,
        };
        try {
            const existing = localStorage.getItem('kyogekiSkill_deleted');
            const deleted = existing ? JSON.parse(existing) : [];
            deleted.unshift(backup);
            // 最新5件のみ保持
            localStorage.setItem('kyogekiSkill_deleted', JSON.stringify(deleted.slice(0, 5)));
        } catch (e) {
            console.error('Backup failed:', e);
        }

        await clearAll();
        setOptimization(null);
        setShowClearModal(false);
        setExpandedTracks(new Set());
        showToast('データを削除しました（バックアップ保存済み）', 'success');
    }, [clearAll, tracks, results, showToast]);

    // テストデータ読込
    const handleLoadTestData = useCallback(async () => {
        const testData = generateTestData();
        for (const data of testData) {
            const exists = tracks.some(t => t.weaponType === data.weaponType && t.element === data.element);
            if (exists) continue;

            const trackId = await addTrack(data.weaponType as WeaponType, data.element as ElementType);
            setExpandedTracks(prev => new Set([...prev, trackId]));

            for (const r of data.results) {
                await addResult(trackId, r.series, r.group, r.isTarget);
            }
        }
        setShowTestModal(false);
        showToast('テストデータを読み込みました', 'success');
    }, [addTrack, addResult, tracks, showToast]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-zinc-400">読み込み中...</div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* ツールバー（右上） */}
            <div className="flex items-center justify-end gap-2">
                <button
                    onClick={() => setShowTestModal(true)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors"
                >
                    <Download className="w-3.5 h-3.5" />
                    テストデータ
                </button>
                <button
                    onClick={() => setShowClearModal(true)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                    <RotateCcw className="w-3.5 h-3.5" />
                    全削除
                </button>
            </div>

            {/* トラック追加エリア */}
            <section className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
                <h2 className="text-sm font-semibold text-zinc-400 mb-3 flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    偵察トラックを追加
                </h2>
                <div className="flex flex-wrap items-center gap-2">
                    <select
                        value={newWeapon}
                        onChange={(e) => setNewWeapon(e.target.value as WeaponType)}
                        className="flex-1 min-w-[120px] bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm"
                    >
                        {WEAPON_TYPES.map(w => (
                            <option key={w} value={w}>{w}</option>
                        ))}
                    </select>
                    <select
                        value={newElement}
                        onChange={(e) => setNewElement(e.target.value as ElementType)}
                        className="w-20 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm"
                    >
                        {ELEMENT_TYPES.map(e => (
                            <option key={e} value={e}>{e}</option>
                        ))}
                    </select>
                    <button
                        onClick={handleAddTrack}
                        className="flex items-center gap-1 bg-orange-500 hover:bg-orange-600 text-white font-medium px-4 py-2.5 rounded-lg transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        追加
                    </button>
                </div>
            </section>

            {/* トラック一覧 */}
            {tracks.length === 0 ? (
                <div className="text-center py-12 text-zinc-500">
                    <Flame className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm">
                        トラックがありません。<br />
                        上のフォームから偵察トラックを追加してください。
                    </p>
                </div>
            ) : (
                <section className="space-y-3">
                    {tracks.map(track => {
                        const trackResults = getResultsByTrack(track.id);
                        const isExpanded = expandedTracks.has(track.id);
                        const hasTarget = trackResults.some(r => r.isTarget);

                        return (
                            <div
                                key={track.id}
                                className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden"
                            >
                                {/* トラックヘッダー */}
                                <div
                                    className="flex items-center justify-between p-3 cursor-pointer hover:bg-zinc-800/50 transition-colors"
                                    onClick={() => toggleExpand(track.id)}
                                >
                                    <div className="flex items-center gap-2">
                                        <span className={`text-lg font-bold ${getElementColor(track.element)}`}>
                                            {track.element}
                                        </span>
                                        <span className="text-zinc-100 font-medium">{track.weaponType}</span>
                                        <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded">
                                            {trackResults.length}件
                                        </span>
                                        {hasTarget && (
                                            <span className="flex items-center gap-1 text-xs text-green-400 bg-green-500/20 px-2 py-0.5 rounded">
                                                <Target className="w-3 h-3" />
                                                Target
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); deleteTrack(track.id); }}
                                            className="p-1.5 text-zinc-500 hover:text-red-400 rounded-lg"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                        {isExpanded ? (
                                            <ChevronUp className="w-5 h-5 text-zinc-500" />
                                        ) : (
                                            <ChevronDown className="w-5 h-5 text-zinc-500" />
                                        )}
                                    </div>
                                </div>

                                {/* トラック詳細 */}
                                {isExpanded && (
                                    <div className="border-t border-zinc-800 p-3 space-y-3">
                                        {/* 結果リスト */}
                                        {trackResults.map(result => (
                                            <div
                                                key={result.id}
                                                className={`flex items-center gap-2 p-2 rounded-lg ${result.isTarget ? 'bg-green-500/10 border border-green-500/30' : 'bg-zinc-800/50'
                                                    }`}
                                            >
                                                <span className="w-8 text-center text-sm font-mono text-zinc-500">
                                                    #{result.index}
                                                </span>
                                                <span className={`flex-1 text-sm ${result.seriesSkill === 'ハズレ' ? 'text-zinc-500' : 'text-zinc-200'
                                                    }`}>
                                                    {result.seriesSkill === 'ハズレ' ? 'ハズレ' : (
                                                        <>
                                                            {result.seriesSkill}
                                                            {result.groupSkill !== '-' && (
                                                                <span className="text-zinc-400"> / {result.groupSkill}</span>
                                                            )}
                                                        </>
                                                    )}
                                                </span>
                                                <button
                                                    onClick={() => toggleTarget(result.id)}
                                                    className={`p-1.5 rounded-lg transition-colors ${result.isTarget
                                                        ? 'bg-green-500 text-white'
                                                        : 'bg-zinc-700 text-zinc-400 hover:bg-zinc-600'
                                                        }`}
                                                >
                                                    <Target className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => deleteResult(result.id)}
                                                    className="p-1.5 text-zinc-500 hover:text-red-400 rounded-lg"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}

                                        {/* 入力UI */}
                                        <div className="space-y-2 pt-2 border-t border-zinc-700">
                                            <select
                                                value={selectedSeries}
                                                onChange={(e) => setSelectedSeries(e.target.value)}
                                                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm"
                                            >
                                                {SERIES_SKILLS.map(s => (
                                                    <option key={s} value={s}>{s}</option>
                                                ))}
                                            </select>
                                            <div className="grid grid-cols-3 gap-2">
                                                <button
                                                    onClick={() => handleAddResult(track.id)}
                                                    className="flex items-center justify-center gap-1 px-2 py-2.5 bg-zinc-700 hover:bg-zinc-600 text-zinc-200 text-sm rounded-lg"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                    追加
                                                </button>
                                                <button
                                                    onClick={() => handleAddResult(track.id, 'ヌシの魂')}
                                                    className="flex items-center justify-center gap-1 px-2 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-sm rounded-lg"
                                                >
                                                    <Zap className="w-4 h-4" />
                                                    ヌシの魂
                                                </button>
                                                <button
                                                    onClick={() => addMiss(track.id)}
                                                    className="flex items-center justify-center gap-1 px-2 py-2.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 text-sm rounded-lg border border-red-600/30"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    ハズレ
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </section>
            )}

            {/* 最適化実行ボタン */}
            {tracks.length > 0 && (
                <div className="flex justify-center pt-4">
                    <button
                        onClick={handleGenerate}
                        className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold px-8 py-3 rounded-xl shadow-lg shadow-orange-500/25 transition-all hover:scale-105"
                    >
                        <Sparkles className="w-5 h-5" />
                        最適化実行
                    </button>
                </div>
            )}

            {/* 最適化結果 */}
            <OptimizationChart result={optimization} />

            {/* スキルテーブル */}
            {optimization && <SkillTable tracks={tracks} results={results} />}

            {/* 全削除確認モーダル */}
            <ConfirmModal
                isOpen={showClearModal}
                title="全データの削除"
                message="すべてのトラックと試行履歴を削除しますか？削除前のデータはバックアップとして保存されます。"
                confirmText="削除する"
                isDestructive
                onConfirm={handleClear}
                onCancel={() => setShowClearModal(false)}
            />

            {/* テストデータ確認モーダル */}
            <ConfirmModal
                isOpen={showTestModal}
                title="テストデータの読込"
                message="サンプルの武器トラックとスキルデータを読み込みます。既存のデータは維持されます。"
                confirmText="読み込む"
                onConfirm={handleLoadTestData}
                onCancel={() => setShowTestModal(false)}
            />
        </div>
    );
}
