'use client';

import { AlertTriangle, X } from 'lucide-react';
import { useEffect, useRef } from 'react';

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
    confirmText = 'OK',
    cancelText = 'キャンセル',
    isDestructive = false,
    onConfirm,
    onCancel,
}: ConfirmModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);

    // ESCキーで閉じる
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (isOpen && e.key === 'Escape') {
                onCancel();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onCancel]);

    // フォーカストラップ（簡易版）
    useEffect(() => {
        if (isOpen && modalRef.current) {
            modalRef.current.focus();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* オーバーレイ */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
                onClick={onCancel}
                aria-hidden="true"
            />

            {/* モーダル本体 */}
            <div
                ref={modalRef}
                className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden animate-fade-in transform transition-all"
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
                tabIndex={-1}
            >
                <div className="flex items-start justify-between p-5 border-b border-zinc-800">
                    <h3
                        id="modal-title"
                        className="text-lg font-bold text-zinc-100 flex items-center gap-2"
                    >
                        {isDestructive && <AlertTriangle className="w-5 h-5 text-red-500" />}
                        {title}
                    </h3>
                    <button
                        onClick={onCancel}
                        className="text-zinc-500 hover:text-zinc-300 transition-colors"
                        aria-label="閉じる"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    <p className="text-zinc-300 leading-relaxed">
                        {message}
                    </p>
                </div>

                <div className="flex items-center justify-end gap-3 p-5 bg-zinc-800/50 border-t border-zinc-800">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`px-4 py-2 text-sm font-bold text-white rounded-lg transition-all shadow-lg ${isDestructive
                                ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20'
                                : 'bg-blue-500 hover:bg-blue-600 shadow-blue-500/20'
                            }`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
