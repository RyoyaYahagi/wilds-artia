/**
 * 確認モーダルコンポーネント
 */

import { useEffect, useRef } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDestructive?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export function ConfirmModal({
    isOpen,
    title,
    message,
    confirmText = '確認',
    cancelText = 'キャンセル',
    isDestructive = false,
    onConfirm,
    onCancel,
}: ConfirmModalProps) {
    const confirmButtonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (isOpen) {
            confirmButtonRef.current?.focus();
        }
    }, [isOpen]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onCancel();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onCancel]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={onCancel}
        >
            <div
                className="w-full max-w-md bg-zinc-900 rounded-2xl border border-zinc-700 shadow-2xl animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* ヘッダー */}
                <div className="flex items-center justify-between p-4 border-b border-zinc-800">
                    <div className="flex items-center gap-3">
                        {isDestructive && (
                            <div className="p-2 bg-red-500/20 rounded-lg">
                                <AlertTriangle className="w-5 h-5 text-red-400" />
                            </div>
                        )}
                        <h3 className="text-lg font-semibold text-zinc-100">{title}</h3>
                    </div>
                    <button
                        onClick={onCancel}
                        className="p-1 text-zinc-500 hover:text-zinc-300 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* 本文 */}
                <div className="p-4">
                    <p className="text-zinc-300">{message}</p>
                </div>

                {/* フッター */}
                <div className="flex gap-3 p-4 border-t border-zinc-800">
                    <button
                        onClick={onCancel}
                        className="flex-1 px-4 py-2 text-sm font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        ref={confirmButtonRef}
                        onClick={onConfirm}
                        className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${isDestructive
                                ? 'bg-red-600 hover:bg-red-700 text-white'
                                : 'bg-orange-500 hover:bg-orange-600 text-white'
                            }`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
