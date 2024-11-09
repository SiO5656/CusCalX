"use client";

import React from "react";
import { X, Trash2 } from "lucide-react";
import type { HistoryItem } from "@/lib/types";

interface HistoryProps {
  history: HistoryItem[];
  setInput: (value: string) => void;
  setResult: (value: string) => void;
  setShowHistory: (value: boolean) => void;
  setHistory: (history: HistoryItem[]) => void;
}

export default function History({
  history,
  setInput,
  setResult,
  setShowHistory,
  setHistory
}: HistoryProps) {
  const handleClick = (item: HistoryItem) => {
    setInput(item.expression);
    setResult(item.result);
    setShowHistory(false);
  };

  const handleDeleteItem = (timestamp: Date, e: React.MouseEvent) => {
    e.stopPropagation();
    setHistory(history.filter(item => item.timestamp !== timestamp));
  };

  const handleClearAll = () => {
    setHistory([]);
  };

  if (history.length === 0) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
        履歴がありません
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-white">履歴</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handleClearAll}
            className="px-2 py-1 text-sm rounded-md text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 flex items-center gap-1"
          >
            <Trash2 className="w-4 h-4" />
            すべて削除
          </button>
          <button
            onClick={() => setShowHistory(false)}
            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700"
          >
            <X className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          </button>
        </div>
      </div>
      <div className="space-y-2 overflow-y-auto max-h-[400px] pr-2">
        {history.slice().reverse().map((item) => (
          <div
            key={item.timestamp.toString()}
            onClick={() => handleClick(item)}
            className="p-3 rounded-lg bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 cursor-pointer group relative"
          >
            <div className="text-sm text-gray-600 dark:text-gray-300">
              {item.expression}
            </div>
            <div className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2">
              {item.result}
              {item.unit && (
                <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                  {item.unit}
                </span>
              )}
            </div>
            <div className="flex justify-between items-center">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {new Date(item.timestamp).toLocaleString()}
              </div>
              <button
                onClick={(e) => handleDeleteItem(item.timestamp, e)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}