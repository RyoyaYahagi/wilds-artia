/**
 * 最適化アルゴリズム
 * 
 * Target（本命）が付いた結果のインデックスを元に、
 * 最短手順で全ての理想個体を入手するためのチャートを生成する。
 * 
 * ゲーム仕様:
 * - どの武器で強化してもグローバルカウントは+1進む
 * - 同一インデックスに複数Targetがある場合は同時取得不可能
 */

import type {
    WeaponTrack,
    OptimizationStep,
    OptimizationResult,
    ConflictError,
} from './types';

/**
 * Targetが設定されている結果を抽出し、インデックス順にソート
 */
interface TargetInfo {
    trackId: string;
    label: string;
    index: number;
}

/**
 * 武器トラックから表示用ラベルを生成
 */
function getTrackLabel(track: WeaponTrack): string {
    return `${track.element}属性${track.weaponType}`;
}

/**
 * 全トラックからTarget情報を抽出
 */
function extractTargets(tracks: WeaponTrack[]): TargetInfo[] {
    const targets: TargetInfo[] = [];

    for (const track of tracks) {
        for (const result of track.results) {
            if (result.isTarget) {
                targets.push({
                    trackId: track.id,
                    label: getTrackLabel(track),
                    index: result.index,
                });
            }
        }
    }

    return targets;
}

/**
 * 同一インデックスに複数Targetがあるかチェック
 */
function detectConflicts(targets: TargetInfo[]): ConflictError[] {
    // インデックスごとにグループ化
    const indexMap = new Map<number, TargetInfo[]>();

    for (const target of targets) {
        const existing = indexMap.get(target.index) || [];
        existing.push(target);
        indexMap.set(target.index, existing);
    }

    // 2つ以上あるインデックスを競合として抽出
    const conflicts: ConflictError[] = [];
    for (const [index, targetsAtIndex] of indexMap) {
        if (targetsAtIndex.length > 1) {
            conflicts.push({
                index,
                tracks: targetsAtIndex.map((t) => ({
                    trackId: t.trackId,
                    label: t.label,
                })),
            });
        }
    }

    return conflicts.sort((a, b) => a.index - b.index);
}

/**
 * 最適化チャートを生成
 * 
 * @param tracks - 全ての武器トラック
 * @returns 最適化結果（ステップリストと競合エラー）
 */
export function generateOptimizationChart(
    tracks: WeaponTrack[]
): OptimizationResult {
    // Target情報を抽出
    const targets = extractTargets(tracks);

    // Targetがない場合は空のチャートを返す
    if (targets.length === 0) {
        return {
            steps: [],
            conflicts: [],
            maxIndex: 0,
        };
    }

    // 競合チェック
    const conflicts = detectConflicts(targets);

    // インデックス順にソート
    const sortedTargets = [...targets].sort((a, b) => a.index - b.index);

    // 最大インデックスを取得
    const maxIndex = Math.max(...targets.map((t) => t.index));

    // ステップリストを生成
    const steps: OptimizationStep[] = [];

    for (let i = 1; i <= maxIndex; i++) {
        // このインデックスにTargetがあるかチェック
        const targetAtIndex = sortedTargets.find((t) => t.index === i);

        if (targetAtIndex) {
            steps.push({
                index: i,
                type: 'target',
                trackId: targetAtIndex.trackId,
                label: targetAtIndex.label,
            });
        } else {
            // 捨て強化
            steps.push({
                index: i,
                type: 'discard',
                label: '任意の武器',
            });
        }
    }

    return {
        steps,
        conflicts,
        maxIndex,
    };
}
