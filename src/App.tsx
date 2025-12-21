/**
 * Efficient Artian Optimizer
 * メインアプリケーション
 */

import { useState } from 'react';
import { Swords } from 'lucide-react';
import { TabNav } from './components/TabNav';
import { KyogekiSkillMode } from './components/KyogekiSkillMode';
import { RestoreMode } from './components/RestoreMode';
import { ToastProvider } from './components/Toast';
import type { TabMode } from './types';

function App() {
    const [activeTab, setActiveTab] = useState<TabMode>('kyogekiSkill');

    return (
        <ToastProvider>
            <div className="min-h-screen bg-zinc-950 text-zinc-100">
                {/* ヘッダー */}
                <header className="sticky top-0 z-50 bg-zinc-900/95 backdrop-blur border-b border-zinc-800">
                    <div className="max-w-2xl mx-auto px-4 py-4">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-orange-500/20 rounded-lg">
                                <Swords className="w-6 h-6 text-orange-500" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-zinc-100">
                                    Efficient Artian Optimizer
                                </h1>
                                <p className="text-xs text-zinc-500">
                                    MHWilds アーティア武器 厳選補助
                                </p>
                            </div>
                        </div>

                        {/* タブナビゲーション */}
                        <TabNav activeTab={activeTab} onTabChange={setActiveTab} />
                    </div>
                </header>

                {/* メインコンテンツ */}
                <main className="max-w-2xl mx-auto px-4 py-6">
                    {activeTab === 'normalRestore' && (
                        <RestoreMode store="normalRestore" title="通常アーティア 復元強化" />
                    )}
                    {activeTab === 'kyogekiSkill' && (
                        <KyogekiSkillMode />
                    )}
                    {activeTab === 'kyogekiRestore' && (
                        <RestoreMode store="kyogekiRestore" title="巨戟アーティア 復元強化" />
                    )}
                </main>

                {/* フッター */}
                <footer className="max-w-2xl mx-auto px-4 py-8 text-center text-xs text-zinc-600">
                    <p>Efficient Artian Optimizer - Monster Hunter Wilds</p>
                    <p className="mt-1">データはブラウザの IndexedDB に保存されます</p>
                </footer>
            </div>
        </ToastProvider>
    );
}

export default App;
