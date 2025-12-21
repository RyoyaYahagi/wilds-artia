/**
 * 最適化チャートコンポーネント
 */

import { CheckCircle2, Target, AlertTriangle } from 'lucide-react';
import type { OptimizationResult } from '../types';

interface OptimizationChartProps {
    result: OptimizationResult | null;
}

export function OptimizationChart({ result }: OptimizationChartProps) {
    if (!result) return null;

    return (
        <section className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
            <div className="p-4 bg-zinc-800/50 border-b border-zinc-800">
                <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                    最適化チャート
                </h2>
            </div>

            {/* 競合エラー表示 */}
            {result.conflicts.length > 0 && (
                <div className="p-4 bg-red-500/10 border-b border-red-500/30">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-red-400 font-medium mb-2">
                                ⚠️ 同時取得不可能な競合があります
                            </p>
                            <ul className="space-y-1 text-sm text-red-300">
                                {result.conflicts.map((conflict) => (
                                    <li key={conflict.index}>
                                        <span className="font-mono">#{conflict.index}</span>:
                                        {conflict.entries.map((e, i) => (
                                            <span key={i}>
                                                {i > 0 && ' と '}
                                                <span className="text-red-200">{e.trackLabel}</span>
                                                <span className="text-red-400">({e.label})</span>
                                            </span>
                                        ))}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {/* ステップリスト */}
            {result.steps.length === 0 ? (
                <div className="p-8 text-center text-zinc-500">
                    <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm">
                        Targetが設定されていません。<br />
                        本命のスキルにTargetボタンを押してください。
                    </p>
                </div>
            ) : (
                <div className="divide-y divide-zinc-800">
                    {result.steps.map((step) => (
                        <div
                            key={step.index}
                            className={`flex items-center gap-3 p-3 ${step.type === 'target' ? 'bg-green-500/10' : 'bg-zinc-800/30'
                                }`}
                        >
                            <span className="w-10 text-center font-mono text-sm text-zinc-500">
                                #{step.index}
                            </span>
                            <span
                                className={`px-2 py-0.5 rounded-full text-xs font-medium ${step.type === 'target'
                                        ? 'bg-green-500/20 text-green-400'
                                        : 'bg-zinc-700 text-zinc-400'
                                    }`}
                            >
                                {step.type === 'target' ? '本命' : '捨て'}
                            </span>
                            <span
                                className={`flex-1 text-sm ${step.type === 'target'
                                        ? 'text-green-300 font-medium'
                                        : 'text-zinc-400'
                                    }`}
                            >
                                {step.trackLabel && (
                                    <span className="text-zinc-500 mr-1">[{step.trackLabel}]</span>
                                )}
                                {step.label}
                                {step.type === 'target' && (
                                    <span className="ml-2 text-green-400">→ Get!</span>
                                )}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {/* サマリー */}
            {result.steps.length > 0 && (
                <div className="p-4 bg-zinc-800/50 border-t border-zinc-800">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-zinc-400">
                            総強化回数: <span className="text-zinc-200 font-medium">{result.maxIndex}回</span>
                        </span>
                        <span className="text-zinc-400">
                            本命回収: <span className="text-green-400 font-medium">
                                {result.steps.filter((s) => s.type === 'target').length}個
                            </span>
                        </span>
                    </div>
                </div>
            )}
        </section>
    );
}
