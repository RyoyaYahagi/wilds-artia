'use client';

/**
 * 巨戟アーティア厳選マネージャー
 * メインページ
 * 
 * モンスターハンターワイルズのエンドコンテンツ
 * 「巨戟アーティア武器」厳選作業を補助するアプリケーション
 */

import { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Trash2,
  Target,
  Sparkles,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle2,
  Swords,
  Flame,
} from 'lucide-react';
import type {
  WeaponTrack,
  TrackResult,
  WeaponType,
  ElementType,
  OptimizationResult,
} from './types';
import {
  WEAPON_TYPES,
  ELEMENT_TYPES,
  STORAGE_KEY,
} from './types';
import { generateOptimizationChart } from './optimizer';
import { ConfirmModal } from './components/ConfirmModal';

/**
 * ユニークIDを生成
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 属性に対応する色クラスを取得
 */
function getElementColorClass(element: ElementType): string {
  switch (element) {
    case '火':
      return 'text-orange-500';
    case '水':
      return 'text-blue-500';
    case '雷':
      return 'text-yellow-400';
    case '氷':
      return 'text-cyan-400';
    case '龍':
      return 'text-purple-500';
    default:
      return 'text-gray-400';
  }
}

/**
 * 属性に対応する背景色クラスを取得
 */
function getElementBgClass(element: ElementType): string {
  switch (element) {
    case '火':
      return 'bg-orange-500/20 border-orange-500/50';
    case '水':
      return 'bg-blue-500/20 border-blue-500/50';
    case '雷':
      return 'bg-yellow-400/20 border-yellow-400/50';
    case '氷':
      return 'bg-cyan-400/20 border-cyan-400/50';
    case '龍':
      return 'bg-purple-500/20 border-purple-500/50';
    default:
      return 'bg-gray-500/20 border-gray-500/50';
  }
}

export default function Home() {
  // SSR対策：クライアントサイドかどうか
  const [isClient, setIsClient] = useState(false);

  // トラック一覧（初期値はlocalStorageから読み込み）
  const [tracks, setTracks] = useState<WeaponTrack[]>([]);
  // 新規トラック追加用の選択状態
  const [newWeapon, setNewWeapon] = useState<WeaponType>('双剣');
  const [newElement, setNewElement] = useState<ElementType>('火');
  // 展開しているトラックのID
  const [expandedTracks, setExpandedTracks] = useState<Set<string>>(new Set());
  // 最適化結果
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
  // 初期化完了フラグ
  const [isInitialized, setIsInitialized] = useState(false);

  // 確認モーダルの状態
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    type: 'RESET' | 'IMPORT' | null;
    title: string;
    message: string;
    confirmText: string;
    isDestructive: boolean;
  }>({
    isOpen: false,
    type: null,
    title: '',
    message: '',
    confirmText: '',
    isDestructive: false,
  });

  /**
   * クライアントサイドでのみlocalStorageからデータを読み込み
   * NOTE: useEffect内でのsetStateはSSR hydration対策として必要
   */
  useEffect(() => {
    setIsClient(true);

    // localStorageからの復元はマウント後に一度だけ実行
    const loadData = () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved) as WeaponTrack[];
          return parsed;
        }
      } catch (e) {
        console.error('データの読み込みに失敗しました:', e);
      }
      return [];
    };

    const savedTracks = loadData();
    if (savedTracks.length > 0) {
      setTracks(savedTracks);
      setExpandedTracks(new Set(savedTracks.map((t: WeaponTrack) => t.id)));
    }
    setIsInitialized(true);
  }, []);

  /**
   * localStorageにデータを保存
   */
  useEffect(() => {
    if (isInitialized && isClient) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tracks));
      } catch (e) {
        console.error('データの保存に失敗しました:', e);
      }
    }
  }, [tracks, isInitialized, isClient]);

  /**
   * 新規トラックを追加
   */
  const addTrack = useCallback(() => {
    const newTrack: WeaponTrack = {
      id: generateId(),
      weaponType: newWeapon,
      element: newElement,
      results: [],
      createdAt: new Date().toISOString(),
    };
    setTracks((prev) => [...prev, newTrack]);
    setExpandedTracks((prev) => new Set([...prev, newTrack.id]));
  }, [newWeapon, newElement]);

  /**
   * トラックを削除
   */
  const deleteTrack = useCallback((trackId: string) => {
    setTracks((prev) => prev.filter((t) => t.id !== trackId));
    setExpandedTracks((prev) => {
      const next = new Set(prev);
      next.delete(trackId);
      return next;
    });
  }, []);

  /**
   * 結果行を追加
   */
  const addResult = useCallback((trackId: string, initialSkillName: string = '') => {
    setTracks((prev) =>
      prev.map((track) => {
        if (track.id !== trackId) return track;
        const nextIndex = track.results.length + 1;
        const newResult: TrackResult = {
          id: generateId(),
          index: nextIndex,
          skillName: initialSkillName,
          isTarget: false,
        };
        return {
          ...track,
          results: [...track.results, newResult],
        };
      })
    );
  }, []);

  /**
   * 結果行を削除
   */
  const deleteResult = useCallback((trackId: string, resultId: string) => {
    setTracks((prev) =>
      prev.map((track) => {
        if (track.id !== trackId) return track;
        const filteredResults = track.results.filter((r) => r.id !== resultId);
        // インデックスを振り直し
        const reindexed = filteredResults.map((r, i) => ({
          ...r,
          index: i + 1,
        }));
        return {
          ...track,
          results: reindexed,
        };
      })
    );
  }, []);

  /**
   * 結果のスキル名を更新
   */
  const updateResultSkill = useCallback((
    trackId: string,
    resultId: string,
    skillName: string
  ) => {
    setTracks((prev) =>
      prev.map((track) => {
        if (track.id !== trackId) return track;
        return {
          ...track,
          results: track.results.map((r) =>
            r.id === resultId ? { ...r, skillName } : r
          ),
        };
      })
    );
  }, []);

  /**
   * Target（本命）を切り替え
   */
  const toggleTarget = useCallback((trackId: string, resultId: string) => {
    setTracks((prev) =>
      prev.map((track) => {
        if (track.id !== trackId) return track;
        return {
          ...track,
          results: track.results.map((r) =>
            r.id === resultId ? { ...r, isTarget: !r.isTarget } : r
          ),
        };
      })
    );
  }, []);

  /**
   * トラックの展開/折りたたみを切り替え
   */
  const toggleExpand = useCallback((trackId: string) => {
    setExpandedTracks((prev) => {
      const next = new Set(prev);
      if (next.has(trackId)) {
        next.delete(trackId);
      } else {
        next.add(trackId);
      }
      return next;
    });
  }, []);

  /**
   * 最適化チャートを生成
   */
  const generateChart = useCallback(() => {
    const result = generateOptimizationChart(tracks);
    setOptimizationResult(result);
  }, [tracks]);

  /**
   * モーダルの確認ボタンが押されたときの処理
   */
  const handleConfirm = useCallback(() => {
    if (modalConfig.type === 'IMPORT') {
      const track1Id = generateId();
      const track2Id = generateId();

      const testTracks: WeaponTrack[] = [
        {
          id: track1Id,
          weaponType: '双剣',
          element: '火',
          createdAt: new Date().toISOString(),
          results: [
            { id: generateId(), index: 1, skillName: '防御+10', isTarget: false },
            { id: generateId(), index: 2, skillName: '体力+20', isTarget: false },
            { id: generateId(), index: 3, skillName: 'スタミナ消費軽減', isTarget: false },
            { id: generateId(), index: 4, skillName: '攻撃+25 (理想)', isTarget: true },
            { id: generateId(), index: 5, skillName: '防御+5', isTarget: false },
          ]
        },
        {
          id: track2Id,
          weaponType: 'ヘビィボウガン',
          element: '雷',
          createdAt: new Date().toISOString(),
          results: [
            { id: generateId(), index: 1, skillName: 'リロード速度+1', isTarget: false },
            { id: generateId(), index: 2, skillName: '反動軽減+1', isTarget: false },
            { id: generateId(), index: 3, skillName: '防御+15', isTarget: false },
            { id: generateId(), index: 4, skillName: 'ブレ抑制+1', isTarget: false },
            { id: generateId(), index: 5, skillName: '体力+10', isTarget: false },
            { id: generateId(), index: 6, skillName: '装填数UP (理想)', isTarget: true },
          ]
        }
      ];

      setTracks(testTracks);
      setExpandedTracks(new Set([track1Id, track2Id]));

      // 自動的にチャート生成
      const result = generateOptimizationChart(testTracks);
      setOptimizationResult(result);
    } else if (modalConfig.type === 'RESET') {
      setTracks([]);
      setExpandedTracks(new Set());
      setOptimizationResult(null);
      localStorage.removeItem(STORAGE_KEY);
    }

    // モーダルを閉じる
    setModalConfig((prev) => ({ ...prev, isOpen: false }));
  }, [modalConfig.type]);

  /**
   * 全データをリセット（確認モーダル表示）
   */
  const resetAllData = useCallback(() => {
    setModalConfig({
      isOpen: true,
      type: 'RESET',
      title: '全データの削除',
      message: 'すべてのデータを削除しますか？この操作は取り消せません。',
      confirmText: '削除する',
      isDestructive: true,
    });
  }, []);

  /**
   * テストデータをインポート（確認モーダル表示）
   */
  const importTestData = useCallback(() => {
    setModalConfig({
      isOpen: true,
      type: 'IMPORT',
      title: 'テストデータのインポート',
      message: '現在のデータをすべて消去し、テストデータを読み込みますか？この操作は取り消せません。',
      confirmText: 'インポート',
      isDestructive: false,
    });
  }, []);

  // 初期化前は何も表示しない（SSR対策）
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-zinc-400">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* ヘッダー */}
      <header className="sticky top-0 z-50 bg-zinc-900/95 backdrop-blur border-b border-zinc-800">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <Swords className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-zinc-100">
                  巨戟アーティア厳選マネージャー
                </h1>
                <p className="text-xs text-zinc-500">
                  Kyogeki Artian Optimizer
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={importTestData}
                className="p-2 text-zinc-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                title="テストデータインポート"
              >
                <Swords className="w-5 h-5" />
              </button>
              <button
                onClick={resetAllData}
                className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                title="全データリセット"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* トラック追加エリア */}
        <section className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
          <h2 className="text-sm font-semibold text-zinc-400 mb-3 flex items-center gap-2">
            <Plus className="w-4 h-4" />
            偵察トラックを追加
          </h2>
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={newWeapon}
              onChange={(e) => setNewWeapon(e.target.value as WeaponType)}
              className="flex-1 min-w-[140px] bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            >
              {WEAPON_TYPES.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
            <select
              value={newElement}
              onChange={(e) => setNewElement(e.target.value as ElementType)}
              className="w-24 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            >
              {ELEMENT_TYPES.map((e) => (
                <option key={e} value={e}>
                  {e}属性
                </option>
              ))}
            </select>
            <button
              onClick={addTrack}
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-medium px-4 py-2 rounded-lg transition-colors"
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
              トラックがありません。
              <br />
              上のフォームから偵察トラックを追加してください。
            </p>
          </div>
        ) : (
          <section className="space-y-4">
            {tracks.map((track) => (
              <div
                key={track.id}
                className={`bg-zinc-900 rounded-xl border ${getElementBgClass(track.element)} overflow-hidden`}
              >
                {/* トラックヘッダー */}
                <div
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-zinc-800/50 transition-colors"
                  onClick={() => toggleExpand(track.id)}
                >
                  <div className="flex items-center gap-3">
                    <span className={`text-lg font-bold ${getElementColorClass(track.element)}`}>
                      {track.element}
                    </span>
                    <span className="text-zinc-100 font-medium">
                      {track.weaponType}
                    </span>
                    <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded">
                      {track.results.length}件
                    </span>
                    {track.results.some((r) => r.isTarget) && (
                      <span className="flex items-center gap-1 text-xs text-green-400 bg-green-500/20 px-2 py-0.5 rounded">
                        <Target className="w-3 h-3" />
                        Target設定済
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteTrack(track.id);
                      }}
                      className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    {expandedTracks.has(track.id) ? (
                      <ChevronUp className="w-5 h-5 text-zinc-500" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-zinc-500" />
                    )}
                  </div>
                </div>

                {/* 結果入力エリア */}
                {expandedTracks.has(track.id) && (
                  <div className="border-t border-zinc-800 p-4 space-y-3">
                    {track.results.map((result) => (
                      <div
                        key={result.id}
                        className={`flex items-center gap-3 p-3 rounded-lg ${result.isTarget
                          ? 'bg-green-500/10 border border-green-500/30'
                          : 'bg-zinc-800/50'
                          }`}
                      >
                        <span className="w-8 text-center text-sm font-mono text-zinc-500">
                          #{result.index}
                        </span>
                        <input
                          type="text"
                          value={result.skillName}
                          onChange={(e) =>
                            updateResultSkill(track.id, result.id, e.target.value)
                          }
                          placeholder="スキル名を入力..."
                          className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                        />
                        <button
                          onClick={() => toggleTarget(track.id, result.id)}
                          className={`p-2 rounded-lg transition-colors ${result.isTarget
                            ? 'bg-green-500 text-white'
                            : 'bg-zinc-700 text-zinc-400 hover:bg-zinc-600'
                            }`}
                          title={result.isTarget ? 'Target解除' : 'Target設定'}
                        >
                          <Target className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteResult(track.id, result.id)}
                          className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => addResult(track.id, 'ハズレ')}
                        className="flex items-center justify-center gap-2 p-3 border border-dashed border-zinc-700 rounded-lg text-zinc-500 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/5 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        ハズレを追加
                      </button>
                      <button
                        onClick={() => addResult(track.id)}
                        className="flex items-center justify-center gap-2 p-3 border border-dashed border-zinc-700 rounded-lg text-zinc-500 hover:text-zinc-300 hover:border-zinc-600 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        結果を追加
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </section>
        )}

        {/* チャート生成ボタン */}
        {tracks.length > 0 && (
          <div className="flex justify-center">
            <button
              onClick={generateChart}
              className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold px-8 py-3 rounded-xl shadow-lg shadow-orange-500/25 transition-all hover:scale-105"
            >
              <Sparkles className="w-5 h-5" />
              最適化チャートを生成
            </button>
          </div>
        )}

        {/* 最適化結果 */}
        {optimizationResult && (
          <section className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
            <div className="p-4 bg-zinc-800/50 border-b border-zinc-800">
              <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                最適化チャート
              </h2>
            </div>

            {/* 競合エラー表示 */}
            {optimizationResult.conflicts.length > 0 && (
              <div className="p-4 bg-red-500/10 border-b border-red-500/30">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-400 font-medium mb-2">
                      同時取得不可能な競合があります
                    </p>
                    <ul className="space-y-1 text-sm text-red-300">
                      {optimizationResult.conflicts.map((conflict) => (
                        <li key={conflict.index}>
                          Index {conflict.index}:{' '}
                          {conflict.tracks.map((t) => t.label).join(' と ')}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* ステップリスト */}
            {optimizationResult.steps.length === 0 ? (
              <div className="p-8 text-center text-zinc-500">
                <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">
                  Targetが設定されていません。
                  <br />
                  本命のスキルにTargetボタンを押してください。
                </p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-800">
                {optimizationResult.steps.map((step) => (
                  <div
                    key={step.index}
                    className={`flex items-center gap-4 p-4 ${step.type === 'target'
                      ? 'bg-green-500/10'
                      : 'bg-zinc-800/30'
                      }`}
                  >
                    <span className="w-12 text-center font-mono text-sm text-zinc-500">
                      #{step.index}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${step.type === 'target'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-zinc-700 text-zinc-400'
                        }`}
                    >
                      {step.type === 'target' ? '本命' : '捨て'}
                    </span>
                    <span
                      className={`flex-1 ${step.type === 'target'
                        ? 'text-green-300 font-medium'
                        : 'text-zinc-400'
                        }`}
                    >
                      {step.label}で強化
                      {step.type === 'target' && (
                        <span className="ml-2 text-green-400">→ Get!</span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* サマリー */}
            {optimizationResult.steps.length > 0 && (
              <div className="p-4 bg-zinc-800/50 border-t border-zinc-800">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-400">
                    総強化回数: {optimizationResult.maxIndex}回
                  </span>
                  <span className="text-zinc-400">
                    本命回収:{' '}
                    {optimizationResult.steps.filter((s) => s.type === 'target').length}個
                  </span>
                </div>
              </div>
            )}
          </section>
        )}
      </main>

      {/* フッター */}
      <footer className="max-w-4xl mx-auto px-4 py-8 text-center text-xs text-zinc-600">
        <p>
          巨戟アーティア厳選マネージャー - Monster Hunter Wilds
        </p>
        <p className="mt-1">
          データはブラウザのローカルストレージに保存されます
        </p>
      </footer>

      <ConfirmModal
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmText={modalConfig.confirmText}
        isDestructive={modalConfig.isDestructive}
        onConfirm={handleConfirm}
        onCancel={() => setModalConfig((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
