/**
 * タブナビゲーションコンポーネント
 */

import { TABS } from '../constants';
import type { TabMode } from '../types';

interface TabNavProps {
    activeTab: TabMode;
    onTabChange: (tab: TabMode) => void;
}

export function TabNav({ activeTab, onTabChange }: TabNavProps) {
    return (
        <nav className="flex gap-1 p-1 bg-zinc-800/50 rounded-xl">
            {TABS.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id as TabMode)}
                    className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === tab.id
                            ? 'bg-orange-500 text-white'
                            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/50'
                        }`}
                >
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.shortLabel}</span>
                </button>
            ))}
        </nav>
    );
}
