/**
 * スキルテーブルコンポーネント
 * 全トラック横断のExcel風テーブル表示
 */

import { Target } from 'lucide-react';
import type { Track, KyogekiSkillResult, ElementType } from '../types';

interface SkillTableProps {
    tracks: Track[];
    results: KyogekiSkillResult[];
}

/** 属性カラー（背景色） */
function getElementBgColor(element: ElementType): string {
    const colors: Record<ElementType, string> = {
        '火': 'bg-orange-500/20',
        '水': 'bg-blue-500/20',
        '雷': 'bg-yellow-500/20',
        '氷': 'bg-cyan-500/20',
        '龍': 'bg-purple-500/20',
        '麻痺': 'bg-amber-500/20',
        '通常': 'bg-zinc-500/20',
    };
    return colors[element] || 'bg-zinc-800';
}

export function SkillTable({ tracks, results }: SkillTableProps) {
    if (tracks.length === 0) return null;

    // 最大インデックスを算出
    const maxIndex = results.length > 0
        ? Math.max(...results.map(r => r.index))
        : 0;

    if (maxIndex === 0) return null;

    // トラックごとの結果マップを作成
    const trackResultsMap = new Map<string, Map<number, KyogekiSkillResult>>();
    for (const track of tracks) {
        const indexMap = new Map<number, KyogekiSkillResult>();
        const trackResults = results.filter(r => r.trackId === track.id);
        for (const r of trackResults) {
            indexMap.set(r.index, r);
        }
        trackResultsMap.set(track.id, indexMap);
    }

    return (
        <section className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
            <div className="p-4 bg-zinc-800/50 border-b border-zinc-800">
                <h2 className="text-lg font-bold text-zinc-100">スキルテーブル（全トラック横断）</h2>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-xs">
                    <thead>
                        <tr className="bg-zinc-800">
                            <th className="sticky left-0 bg-zinc-800 px-2 py-2 text-center text-zinc-400 font-medium border-r border-zinc-700 min-w-[50px]">
                                #
                            </th>
                            {tracks.map(track => (
                                <th
                                    key={track.id}
                                    className={`px-2 py-2 text-center font-medium border-r border-zinc-700 min-w-[100px] ${getElementBgColor(track.element)}`}
                                >
                                    <div className="text-zinc-200">{track.element}</div>
                                    <div className="text-zinc-400 text-[10px]">{track.weaponType}</div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {Array.from({ length: maxIndex }, (_, i) => i + 1).map(index => (
                            <tr key={index} className="border-t border-zinc-800 hover:bg-zinc-800/30">
                                <td className="sticky left-0 bg-zinc-900 px-2 py-1.5 text-center text-zinc-500 font-mono border-r border-zinc-700">
                                    {index}
                                </td>
                                {tracks.map(track => {
                                    const indexMap = trackResultsMap.get(track.id);
                                    const result = indexMap?.get(index);

                                    if (!result) {
                                        return (
                                            <td key={track.id} className="px-2 py-1.5 text-center text-zinc-600 border-r border-zinc-800">
                                                -
                                            </td>
                                        );
                                    }

                                    const isTarget = result.isTarget;
                                    const isHazure = result.seriesSkill === 'ハズレ';
                                    const hasNushi = result.groupSkill === 'ヌシの魂';

                                    return (
                                        <td
                                            key={track.id}
                                            className={`px-1 py-1 border-r border-zinc-800 ${isTarget ? 'bg-red-500/30' : ''
                                                }`}
                                        >
                                            <div className={`flex items-center justify-center gap-0.5 ${isHazure ? 'text-zinc-500' : isTarget ? 'text-red-300 font-bold' : 'text-zinc-300'
                                                }`}>
                                                {isTarget && <Target className="w-3 h-3 text-red-400 flex-shrink-0" />}
                                                <span className="truncate text-[10px]">
                                                    {isHazure ? '×' : (
                                                        <>
                                                            {result.seriesSkill.replace(/の(力|闘志|守護|脈動|渦雷|反逆|飢餓|命脈|黙示録|証)$/, '')}
                                                            {hasNushi && <span className="text-amber-400">★</span>}
                                                        </>
                                                    )}
                                                </span>
                                            </div>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="p-3 bg-zinc-800/50 border-t border-zinc-800 text-xs text-zinc-500">
                <span className="inline-flex items-center gap-1 mr-4">
                    <span className="w-3 h-3 bg-red-500/30 rounded"></span> Target（本命）
                </span>
                <span className="inline-flex items-center gap-1 mr-4">
                    <span className="text-amber-400">★</span> ヌシの魂
                </span>
                <span className="inline-flex items-center gap-1">
                    <span className="text-zinc-500">×</span> ハズレ
                </span>
            </div>
        </section>
    );
}
