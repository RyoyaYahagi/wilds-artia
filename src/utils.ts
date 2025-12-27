/**
 * Efficient Artian Optimizer
 * 共通ユーティリティ関数
 */

import type {
    Track, KyogekiSkillResult, RestoreResult,
    OptimizationResult, ElementType
} from './types';

/**
 * 属性に対応するTailwind CSSカラークラスを返す
 * @param element - 属性タイプ
 * @returns Tailwind CSSのテキストカラークラス
 */
export function getElementColor(element: ElementType): string {
    const colors: Record<ElementType, string> = {
        '火': 'text-orange-500',
        '水': 'text-blue-400',
        '雷': 'text-yellow-400',
        '氷': 'text-cyan-400',
        '龍': 'text-purple-400',
        '麻痺': 'text-amber-300',
        '通常': 'text-zinc-300',
    };
    return colors[element] || 'text-zinc-400';
}

/**
 * 巨戟スキル結果から最適化チャートを生成
 * @param tracks - トラック一覧
 * @param results - 結果一覧
 * @returns 最適化結果
 */
export function generateSkillOptimization(
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

/**
 * 復元強化結果から最適化チャートを生成
 * @param tracks - トラック一覧
 * @param results - 結果一覧
 * @returns 最適化結果
 */
export function generateRestoreOptimization(
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
