/**
 * 巨戟スキル再付与モード
 */

import { useState, useCallback } from 'react';
import { Target, Trash2, Plus, Sparkles, RotateCcw, Zap } from 'lucide-react';
import { useKyogekiSkill } from '../hooks/useKyogekiSkill';
import { SERIES_SKILLS, GROUP_SKILLS } from '../constants';
import { OptimizationChart } from './OptimizationChart';
import { ConfirmModal } from './ConfirmModal';
import type { OptimizationResult, KyogekiSkillEntry } from '../types';

/** 最適化チャート生成 */
function generateOptimization(entries: KyogekiSkillEntry[]): OptimizationResult {
    const targets = entries.filter(e => e.isTarget);
    if (targets.length === 0) {
        return { steps: [], maxIndex: 0, conflicts: [] };
    }

    // インデックスでグループ化して競合を検出
    const indexMap = new Map<number, KyogekiSkillEntry[]>();
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
                entries: items.map(e => ({ label: `${e.seriesSkill}/${e.groupSkill}` })),
            });
        }
    }

    // 最大インデックスを取得
    const maxIndex = Math.max(...targets.map(t => t.index));

    // ステップを生成
    const steps: OptimizationResult['steps'] = [];
    for (let i = 1; i <= maxIndex; i++) {
        const target = targets.find(t => t.index === i);
        if (target) {
            steps.push({
                index: i,
                type: 'target',
                label: `${target.seriesSkill} / ${target.groupSkill}`,
            });
        } else {
            steps.push({ index: i, type: 'skip', label: '任意の強化' });
        }
    }

    return { steps, maxIndex, conflicts };
}

export function KyogekiSkillMode() {
    const { entries, isLoading, addEntry, addMiss, toggleTarget, deleteEntry, clearAll } = useKyogekiSkill();

    const [selectedSeries, setSelectedSeries] = useState<string>(SERIES_SKILLS[0]);
    const [selectedGroup, setSelectedGroup] = useState<string>('');
    const [optimization, setOptimization] = useState<OptimizationResult | null>(null);
    const [showModal, setShowModal] = useState(false);

    const handleAdd = useCallback(async () => {
        await addEntry(selectedSeries, selectedGroup || '-', false);
    }, [addEntry, selectedSeries, selectedGroup]);

    const handleAddNushi = useCallback(async () => {
        await addEntry(selectedSeries, 'ヌシの魂', true);
    }, [addEntry, selectedSeries]);

    const handleGenerate = useCallback(() => {
        const result = generateOptimization(entries);
        setOptimization(result);
    }, [entries]);

    const handleClear = useCallback(async () => {
        await clearAll();
        setOptimization(null);
        setShowModal(false);
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
            {/* 入力エリア */}
            <section className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
                <h2 className="text-sm font-semibold text-zinc-400 mb-4 flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    スキル登録
                </h2>

                <div className="space-y-3">
                    {/* シリーズスキル選択 */}
                    <div>
                        <label className="block text-xs text-zinc-500 mb-1">シリーズスキル</label>
                        <select
                            value={selectedSeries}
                            onChange={(e) => setSelectedSeries(e.target.value)}
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                        >
                            {SERIES_SKILLS.map((skill) => (
                                <option key={skill} value={skill}>
                                    {skill}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* グループスキル選択 */}
                    <div>
                        <label className="block text-xs text-zinc-500 mb-1">グループスキル</label>
                        <select
                            value={selectedGroup}
                            onChange={(e) => setSelectedGroup(e.target.value)}
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                        >
                            <option value="">選択なし</option>
                            {GROUP_SKILLS.map((skill) => (
                                <option key={skill} value={skill}>
                                    {skill}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* ボタン群 */}
                    <div className="grid grid-cols-3 gap-2 pt-2">
                        <button
                            onClick={handleAdd}
                            className="flex items-center justify-center gap-1 px-3 py-2 bg-zinc-700 hover:bg-zinc-600 text-zinc-200 text-sm font-medium rounded-lg transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            追加
                        </button>
                        <button
                            onClick={handleAddNushi}
                            className="flex items-center justify-center gap-1 px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                            <Zap className="w-4 h-4" />
                            ヌシの魂
                        </button>
                        <button
                            onClick={addMiss}
                            className="flex items-center justify-center gap-1 px-3 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 text-sm font-medium rounded-lg border border-red-600/30 transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                            ハズレ
                        </button>
                    </div>
                </div>
            </section>

            {/* 結果リスト */}
            {entries.length > 0 && (
                <section className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
                    <div className="p-4 bg-zinc-800/50 border-b border-zinc-800 flex items-center justify-between">
                        <h2 className="text-sm font-semibold text-zinc-300">
                            試行履歴 ({entries.length}件)
                        </h2>
                        <button
                            onClick={() => setShowModal(true)}
                            className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="全削除"
                        >
                            <RotateCcw className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="divide-y divide-zinc-800 max-h-80 overflow-y-auto">
                        {entries.map((entry) => (
                            <div
                                key={entry.id}
                                className={`flex items-center gap-3 p-3 ${entry.isTarget ? 'bg-green-500/10' : ''
                                    }`}
                            >
                                <span className="w-8 text-center text-sm font-mono text-zinc-500">
                                    #{entry.index}
                                </span>
                                <span className={`flex-1 text-sm ${entry.seriesSkill === '-' ? 'text-zinc-500' : 'text-zinc-200'
                                    }`}>
                                    {entry.seriesSkill === '-' ? 'ハズレ' : (
                                        <>
                                            {entry.seriesSkill}
                                            {entry.groupSkill !== '-' && (
                                                <span className="text-zinc-400"> / {entry.groupSkill}</span>
                                            )}
                                        </>
                                    )}
                                </span>
                                <button
                                    onClick={() => toggleTarget(entry.id)}
                                    className={`p-1.5 rounded-lg transition-colors ${entry.isTarget
                                            ? 'bg-green-500 text-white'
                                            : 'bg-zinc-700 text-zinc-400 hover:bg-zinc-600'
                                        }`}
                                    title={entry.isTarget ? 'Target解除' : 'Target設定'}
                                >
                                    <Target className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => deleteEntry(entry.id)}
                                    className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* 最適化生成ボタン */}
            {entries.length > 0 && (
                <div className="flex justify-center">
                    <button
                        onClick={handleGenerate}
                        className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold px-8 py-3 rounded-xl shadow-lg shadow-orange-500/25 transition-all hover:scale-105"
                    >
                        <Sparkles className="w-5 h-5" />
                        最適化チャートを生成
                    </button>
                </div>
            )}

            {/* 最適化結果 */}
            <OptimizationChart result={optimization} />

            {/* 確認モーダル */}
            <ConfirmModal
                isOpen={showModal}
                title="全データの削除"
                message="すべての試行履歴を削除しますか？この操作は取り消せません。"
                confirmText="削除する"
                isDestructive
                onConfirm={handleClear}
                onCancel={() => setShowModal(false)}
            />
        </div>
    );
}
