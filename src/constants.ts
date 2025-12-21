/**
 * Efficient Artian Optimizer
 * 定数定義ファイル
 */

/** 武器種リスト */
export const WEAPON_TYPES = [
    '大剣', '太刀', '片手剣', '双剣', 'ハンマー', '狩猟笛',
    'ランス', 'ガンランス', 'スラッシュアックス', 'チャージアックス',
    '操虫棍', 'ライトボウガン', 'ヘビィボウガン', '弓'
] as const;

/** 属性リスト */
export const ELEMENT_TYPES = ['火', '水', '雷', '氷', '龍'] as const;

/** シリーズスキル */
export const SERIES_SKILLS = [
    '闘獣の力', '火竜の力', '暗器蛸の力', '鎧竜の守護', '雪獅子の闘志',
    '兇爪竜の力', '雷顎竜の闘志', '波衣竜の守護', '煌雷竜の力', '獄焔蛸の反逆',
    '凍峰竜の反逆', '黒蝕竜の力', '鎖刃竜の飢餓', '護鎖刃竜の命脈', '泡狐竜の力',
    '白熾竜の脈動', '海竜の渦雷', '千刃竜の闘志', 'オメガレゾナンス', '暗黒騎士の証',
    '巨戟龍の黙示録'
] as const;

/** グループスキル */
export const GROUP_SKILLS = [
    'ヌシの魂', // ※最重要（当たり）
    '甲虫の知らせ', '甲虫の擬態', '鱗張りの技法', '鱗重ねの工夫',
    '革細工の柔性', '革細工の滑性', '毛皮の昂揚', '毛皮の誘惑',
    'ヌシの誇り', 'ヌシの憤激', '護竜の脈動', '護竜の守り',
    '先達の導き', '栄光の誉れ', '祝福の巡り'
] as const;

/** ボーナス種別 */
export const BONUS_TYPES = [
    '攻撃', '会心率', '属性値', '斬れ味', '装填'
] as const;

/** ボーナス値 */
export const BONUS_VALUES = ['Lv1', 'Lv2', 'Lv3', 'EX'] as const;

/** タブ定義 */
export const TABS = [
    { id: 'normalRestore', label: '通常復元', shortLabel: '通常' },
    { id: 'kyogekiSkill', label: '巨戟スキル', shortLabel: 'スキル' },
    { id: 'kyogekiRestore', label: '巨戟復元', shortLabel: '復元' },
] as const;
