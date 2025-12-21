/**
 * Efficient Artian Optimizer
 * 型定義ファイル
 */

/** 共通エントリ */
export interface BaseEntry {
    id: string;
    index: number;
    isTarget: boolean;
    createdAt: string;
}

/** 巨戟スキル再付与エントリ */
export interface KyogekiSkillEntry extends BaseEntry {
    seriesSkill: string;
    groupSkill: string;
}

/** 復元強化エントリ（通常・巨戟共通） */
export interface RestoreEntry extends BaseEntry {
    bonusType: string;
    bonusValue: string;
}

/** タブモード */
export type TabMode = 'normalRestore' | 'kyogekiSkill' | 'kyogekiRestore';

/** 最適化ステップ */
export interface OptimizationStep {
    index: number;
    type: 'target' | 'skip';
    label: string;
}

/** 最適化結果 */
export interface OptimizationResult {
    steps: OptimizationStep[];
    maxIndex: number;
    conflicts: {
        index: number;
        entries: { label: string }[];
    }[];
}
