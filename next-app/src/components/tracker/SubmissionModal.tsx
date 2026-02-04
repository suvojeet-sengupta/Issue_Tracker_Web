"use client";

import React, { useEffect, useState } from 'react';
import { PenTool, Check, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SubmissionModalProps {
    isOpen: boolean;
    onClose: () => void;
    url: string;
    onSuccess: () => void;
}

export default function SubmissionModal({ isOpen, onClose, url, onSuccess }: SubmissionModalProps) {
    const [stage, setStage] = useState<'loading' | 'interaction' | 'submitted'>('loading');

    useEffect(() => {
        if (isOpen) {
            setStage('loading');
        } else {
            // Reset after closing
            setTimeout(() => setStage('loading'), 300);
        }
    }, [isOpen]);

    const handleIframeLoad = () => {
        if (stage === 'loading') {
            setStage('interaction');
        } else if (stage === 'interaction') {
            setStage('submitted');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden relative z-10 animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-4">
                        <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300",
                            stage === 'submitted' ? "bg-green-100" : "bg-indigo-50"
                        )}>
                            {stage === 'submitted' ? (
                                <Check className="w-5 h-5 text-green-600" />
                            ) : (
                                <PenTool className="w-5 h-5 text-indigo-600" />
                            )}
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800">
                                {stage === 'submitted' ? "Submission Successful!" : "Complete Submission"}
                            </h3>
                            <p className="text-xs text-slate-500 font-medium">
                                {stage === 'submitted' ? "Response recorded." : "Please review the Google Form & Click submit."}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Iframe Area */}
                <div className="relative h-[400px] w-full bg-slate-100">
                    {stage === 'loading' && (
                        <div className="absolute inset-0 flex items-center justify-center z-10 bg-white">
                            <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
                        </div>
                    )}

                    <iframe
                        src={isOpen ? url : 'about:blank'}
                        className={cn(
                            "w-full h-full transition-opacity duration-300",
                            stage === 'loading' ? 'opacity-0' : 'opacity-100',
                            // Google forms are usually white, so white background matches better
                            "bg-white"
                        )}
                        onLoad={handleIframeLoad}
                        title="Google Form Submission"
                    />

                    {/* Overlay for success state to prevent further interaction */}
                    {stage === 'submitted' && (
                        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-300">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 animate-bounce">
                                <Check className="w-8 h-8 text-green-600" />
                            </div>
                            <h4 className="text-xl font-bold text-slate-800">All Done!</h4>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-100 flex justify-end bg-white">
                    {stage === 'submitted' ? (
                        <button
                            onClick={onSuccess}
                            className="px-6 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition shadow-lg shadow-green-600/20"
                        >
                            Continue
                        </button>
                    ) : (
                        <button
                            onClick={onClose}
                            className="text-xs font-bold text-red-400 hover:text-red-600 transition uppercase tracking-wide px-4 py-2"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
