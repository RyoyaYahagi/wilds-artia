/**
 * Efficient Artian Optimizer
 * 型定義ファイル
 */

/** 武器種 */
export type WeaponType =
    | '大剣' | '太刀' | '片手剣' | '双剣' | 'ハンマー' | '狩猟笛'
    | 'ランス' | 'ガンランス' | 'スラッシュアックス' | 'チャージアックス'
    | '操虫棍' | 'ライトボウガン' | 'ヘビィボウガン' | '弓';

/** 属性 */
export type ElementType = '火' | '水' | '雷' | '氷' | '龍' | '麻痺' | '通常';

/** タブモード */
export type TabMode = 'normalRestore' | 'kyogekiSkill' | 'kyogekiRestore';

/** 単一トラック（武器×属性） */
export interface Track {
    id: string;
    weaponType: WeaponType;
    element: ElementType;
    createdAt: string;
}

/** 結果エントリ基底 */
export interface BaseResult {
    id: string;
    trackId: string;
    index: number;
    isTarget: boolean;
    createdAt: string;
}

/** 巨戟スキル再付与の結果 */
export interface KyogekiSkillResult extends BaseResult {
    seriesSkill: string;
    groupSkill: string;
}

/** 復元強化の結果 */
export interface RestoreResult extends BaseResult {
    bonusType: string;
    bonusValue: string;
}

/** 最適化ステップ */
export interface OptimizationStep {
    index: number;
    type: 'target' | 'skip';
    label: string;
    trackLabel?: string;
}

/** 競合情報 */
export interface Conflict {
    index: number;
    entries: { label: string; trackLabel: string }[];
}

/** 最適化結果 */
export interface OptimizationResult {
    steps: OptimizationStep[];
    maxIndex: number;
    conflicts: Conflict[];
}
