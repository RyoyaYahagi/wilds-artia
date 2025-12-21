/**
 * 復元強化モード（複数トラック対応、通常・巨戟共通）
 */

import { useState, useCallback } from 'react';
import {
    Target, Trash2, Plus, Sparkles, RotateCcw,
    ChevronDown, ChevronUp, Flame
} from 'lucide-react';
import { useRestore } from '../hooks/useRestore';
import { BONUS_TYPES, BONUS_VALUES, WEAPON_TYPES, ELEMENT_TYPES } from '../constants';
import { OptimizationChart } from './OptimizationChart';
import { ConfirmModal } from './ConfirmModal';
import type {
    OptimizationResult, RestoreResult, Track,
    WeaponType, ElementType
} from '../types';

interface RestoreModeProps {
    store: 'normalRestore' | 'kyogekiRestore';
    title: string;
}

/** 属性カラー */
function getElementColor(element: ElementType): string {
    const colors: Record<ElementType, string> = {
        '火': 'text-orange-500',
        '水': 'text-blue-400',
        '雷': 'text-yellow-400',
        '氷': 'text-cyan-400',
        '龍': 'text-purple-400',
    };
    return colors[element] || 'text-zinc-400';
}

/** 最適化チャート生成（全トラック横断） */
function generateOptimization(
    tracks: Track[],
    results: RestoreResult[]
): OptimizationResult {
    const targets = results.filter(r => r.isTarget);
    if (targets.length === 0) {
        return { steps: [], maxIndex: 0, conflicts: [] };
    }

    const indexMap = new Map<number, RestoreResult[]>();
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
                        label: `${r.bonusType} ${r.bonusValue}`,
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
                label: `${target.bonusType} ${target.bonusValue}`,
                trackLabel: track ? `${track.element}${track.weaponType}` : undefined,
            });
        } else {
            steps.push({ index: i, type: 'skip', label: '任意の武器で強化' });
        }
    }

    return { steps, maxIndex, conflicts };
}

export function RestoreMode({ store, title }: RestoreModeProps) {
    const {
        tracks, results, isLoading,
        addTrack, deleteTrack, addResult, addMiss,
        toggleTarget, deleteResult, clearAll, getResultsByTrack
    } = useRestore(store);

    // トラック追加用
    const [newWeapon, setNewWeapon] = useState<WeaponType>('双剣');
    const [newElement, setNewElement] = useState<ElementType>('火');

    // 結果入力用
    const [selectedType, setSelectedType] = useState<string>(BONUS_TYPES[0]);
    const [selectedValue, setSelectedValue] = useState<string>(BONUS_VALUES[0]);

    // 展開中のトラック
    const [expandedTracks, setExpandedTracks] = useState<Set<string>>(new Set());

    // モーダル・最適化
    const [optimization, setOptimization] = useState<OptimizationResult | null>(null);
    const [showModal, setShowModal] = useState(false);

    const handleAddTrack = useCallback(async () => {
        const id = await addTrack(newWeapon, newElement);
        setExpandedTracks(prev => new Set([...prev, id]));
    }, [addTrack, newWeapon, newElement]);

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

    const handleAddResult = useCallback(async (trackId: string) => {
        await addResult(trackId, selectedType, selectedValue, false);
    }, [addResult, selectedType, selectedValue]);

    const handleGenerate = useCallback(() => {
        const result = generateOptimization(tracks, results);
        setOptimization(result);
    }, [tracks, results]);

    const handleClear = useCallback(async () => {
        await clearAll();
        setOptimization(null);
        setShowModal(false);
        setExpandedTracks(new Set());
    }, [clearAll]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-zinc-400">読み込み中...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* トラック追加エリア */}
            <section className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
                <h2 className="text-sm font-semibold text-zinc-400 mb-3 flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    {title} - トラック追加
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
                                                <span className={`flex-1 text-sm ${result.bonusType === 'ハズレ' ? 'text-zinc-500' : 'text-zinc-200'
                                                    }`}>
                                                    {result.bonusType === 'ハズレ' ? 'ハズレ' : `${result.bonusType} ${result.bonusValue}`}
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
                                            <div className="flex gap-2">
                                                <select
                                                    value={selectedType}
                                                    onChange={(e) => setSelectedType(e.target.value)}
                                                    className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm"
                                                >
                                                    {BONUS_TYPES.map(t => (
                                                        <option key={t} value={t}>{t}</option>
                                                    ))}
                                                </select>
                                                <div className="flex gap-1">
                                                    {BONUS_VALUES.map(v => (
                                                        <button
                                                            key={v}
                                                            onClick={() => setSelectedValue(v)}
                                                            className={`px-2 py-2 text-xs rounded-lg ${selectedValue === v
                                                                    ? 'bg-orange-500 text-white'
                                                                    : 'bg-zinc-800 text-zinc-400'
                                                                }`}
                                                        >
                                                            {v}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <button
                                                    onClick={() => handleAddResult(track.id)}
                                                    className="flex items-center justify-center gap-1 px-2 py-2.5 bg-zinc-700 hover:bg-zinc-600 text-zinc-200 text-sm rounded-lg"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                    追加
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

            {/* ツールバー */}
            {tracks.length > 0 && (
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-1 px-3 py-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg text-sm"
                    >
                        <RotateCcw className="w-4 h-4" />
                        全削除
                    </button>
                    <button
                        onClick={handleGenerate}
                        className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-orange-500/25 transition-all hover:scale-105"
                    >
                        <Sparkles className="w-5 h-5" />
                        最適化実行
                    </button>
                </div>
            )}

            {/* 最適化結果 */}
            <OptimizationChart result={optimization} />

            {/* 確認モーダル */}
            <ConfirmModal
                isOpen={showModal}
                title="全データの削除"
                message="すべてのトラックと試行履歴を削除しますか？この操作は取り消せません。"
                confirmText="削除する"
                isDestructive
                onConfirm={handleClear}
                onCancel={() => setShowModal(false)}
            />
        </div>
    );
}
