'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { fetchSheetPrompts } from '@/lib/api';
import type { SheetPrompt } from '@/lib/types';

interface SheetInputProps {
  onPromptsLoaded: (prompts: SheetPrompt[], total: number) => void;
  onError: (error: string) => void;
}

export function SheetInput({ onPromptsLoaded, onError }: SheetInputProps) {
  const [sheetUrl, setSheetUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sheetInfo, setSheetInfo] = useState<{
    title: string;
    totalCount: number;
    columns: string[];
    columnsDetected: { question: string | null; category: string | null };
  } | null>(null);
  const [prompts, setPrompts] = useState<SheetPrompt[]>([]);
  const [selectedCount, setSelectedCount] = useState<'all' | number>('all');
  const [previewExpanded, setPreviewExpanded] = useState(false);

  const handleFetchSheet = async () => {
    if (!sheetUrl.trim()) return;

    setIsLoading(true);
    setSheetInfo(null);
    setPrompts([]);

    try {
      const data = await fetchSheetPrompts(sheetUrl);
      setSheetInfo({
        title: data.sheetTitle,
        totalCount: data.totalCount,
        columns: data.allColumns,
        columnsDetected: data.columnsDetected,
      });
      setPrompts(data.prompts);
      setSelectedCount('all');
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Failed to fetch sheet');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = () => {
    const count = selectedCount === 'all' ? prompts.length : selectedCount;
    const selectedPrompts = prompts.slice(0, count);
    onPromptsLoaded(selectedPrompts, prompts.length);
  };

  const countOptions = [
    { value: 5, label: 'First 5' },
    { value: 10, label: 'First 10' },
    { value: 25, label: 'First 25' },
    { value: 50, label: 'First 50' },
    { value: 'all' as const, label: 'All' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span className="font-medium">Import from Google Sheets</span>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={sheetUrl}
          onChange={(e) => setSheetUrl(e.target.value)}
          placeholder="Paste Google Sheet URL or ID..."
          className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-500"
        />
        <button
          onClick={handleFetchSheet}
          disabled={isLoading || !sheetUrl.trim()}
          className={cn(
            'px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2',
            isLoading || !sheetUrl.trim()
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          )}
        >
          {isLoading ? (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          )}
          Fetch
        </button>
      </div>

      <p className="text-xs text-gray-500">
        Share your sheet with the service account email, then paste the URL above.
        The sheet should have a column for questions/prompts.
      </p>

      {sheetInfo && (
        <div className="bg-gray-800/50 rounded-lg p-4 space-y-3 border border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="font-medium text-white">{sheetInfo.title}</span>
            </div>
            <span className="text-sm text-gray-400">{sheetInfo.totalCount} prompts found</span>
          </div>

          <div className="text-xs text-gray-400">
            Detected columns: Question = &quot;{sheetInfo.columnsDetected.question || 'auto'}&quot;
            {sheetInfo.columnsDetected.category && `, Category = "${sheetInfo.columnsDetected.category}"`}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">How many prompts to use?</label>
            <div className="flex flex-wrap gap-2">
              {countOptions.map((opt) => (
                <button
                  key={String(opt.value)}
                  onClick={() => setSelectedCount(opt.value)}
                  disabled={typeof opt.value === 'number' && opt.value > sheetInfo.totalCount}
                  className={cn(
                    'px-3 py-1.5 rounded-md text-sm transition-colors',
                    selectedCount === opt.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600',
                    typeof opt.value === 'number' && opt.value > sheetInfo.totalCount &&
                      'opacity-50 cursor-not-allowed'
                  )}
                >
                  {opt.label} {opt.value === 'all' && `(${sheetInfo.totalCount})`}
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="border-t border-gray-700 pt-3">
            <button
              onClick={() => setPreviewExpanded(!previewExpanded)}
              className="text-sm text-blue-400 hover:text-blue-300"
            >
              {previewExpanded ? 'Hide Preview' : 'Show Preview'}
            </button>
            {previewExpanded && (
              <div className="mt-2 max-h-48 overflow-y-auto space-y-1">
                {prompts.slice(0, typeof selectedCount === 'number' ? selectedCount : undefined).map((p, i) => (
                  <div key={p.promptId} className="text-xs p-2 bg-gray-900 rounded text-gray-300">
                    <span className="text-gray-600">{i + 1}.</span> {p.question}
                    {p.category && <span className="text-gray-500 ml-2">[{p.category}]</span>}
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleConfirm}
            className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-medium text-white transition-colors"
          >
            Use {selectedCount === 'all' ? sheetInfo.totalCount : selectedCount} Prompts
          </button>
        </div>
      )}
    </div>
  );
}
