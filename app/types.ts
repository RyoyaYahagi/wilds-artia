/**
 * 巨戟アーティア厳選マネージャー 型定義
 * 
 * ゲーム仕様:
 * - 各「武器種 × 属性」ごとに固定順テーブルが存在
 * - どの武器で強化しても内部のグローバルカウントは+1進む
 */

/** 武器種の定義 */
export type WeaponType =
  | '大剣'
  | '太刀'
  | '片手剣'
  | '双剣'
  | 'ハンマー'
  | '狩猟笛'
  | 'ランス'
  | 'ガンランス'
  | 'スラッシュアックス'
  | 'チャージアックス'
  | '操虫棍'
  | 'ライトボウガン'
  | 'ヘビィボウガン'
  | '弓';

/** 属性の定義 */
export type ElementType =
  | '火'
  | '水'
  | '雷'
  | '氷'
  | '龍';

/**
 * トラック内の各結果行
 * 1回目、2回目...の強化結果を記録
 */
export interface TrackResult {
  /** ユニークID */
  id: string;
  /** 何回目の強化か（1-indexed） */
  index: number;
  /** 結果のスキル名（ユーザー入力） */
  skillName: string;
  /** 本命（Target）かどうか */
  isTarget: boolean;
}

/**
 * 武器トラック
 * 特定の「武器種 × 属性」の組み合わせを管理
 */
export interface WeaponTrack {
  /** ユニークID */
  id: string;
  /** 武器種 */
  weaponType: WeaponType;
  /** 属性 */
  element: ElementType;
  /** 結果リスト */
  results: TrackResult[];
  /** 作成日時 */
  createdAt: string;
}

/**
 * 最適化チャートの1ステップ
 */
export interface OptimizationStep {
  /** グローバルインデックス（1-indexed） */
  index: number;
  /** 本命か捨てか */
  type: 'target' | 'discard';
  /** 武器トラックID（本命の場合） */
  trackId?: string;
  /** 表示用ラベル（例: "火属性双剣"） */
  label: string;
}

/**
 * 競合エラー情報
 * 同一インデックスに複数のTargetがある場合
 */
export interface ConflictError {
  /** 競合しているインデックス */
  index: number;
  /** 競合しているトラック情報 */
  tracks: Array<{
    trackId: string;
    label: string;
  }>;
}

/**
 * 最適化結果
 */
export interface OptimizationResult {
  /** 成功した場合のステップリスト */
  steps: OptimizationStep[];
  /** 競合エラーがある場合 */
  conflicts: ConflictError[];
  /** 最大インデックス（チャートの最後） */
  maxIndex: number;
}

/** 武器種リスト（UI用） */
export const WEAPON_TYPES: WeaponType[] = [
  '大剣',
  '太刀',
  '片手剣',
  '双剣',
  'ハンマー',
  '狩猟笛',
  'ランス',
  'ガンランス',
  'スラッシュアックス',
  'チャージアックス',
  '操虫棍',
  'ライトボウガン',
  'ヘビィボウガン',
  '弓',
];

/** 属性リスト（UI用） */
export const ELEMENT_TYPES: ElementType[] = [
  '火',
  '水',
  '雷',
  '氷',
  '龍',
];

/**
 * ローカルストレージのキー
 */
export const STORAGE_KEY = 'kyogeki-artia-tracks';
