/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Calendar, 
  FileText, 
  Image as ImageIcon, 
  Share2, 
  Copy, 
  RefreshCcw, 
  Check, 
  ChevronRight,
  Plus,
  Rocket,
  Palette,
  Layout,
  MessageSquare,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { generateSocialContent, generateAssetImage } from './lib/gemini';

type AppTab = 'dashboard' | 'holiday' | 'worksheet' | 'moodboard';

interface GeneratedPost {
  copy: string;
  hashtags: string[];
  item_prompt: string;
  imageUrl?: string;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');
  const [input, setInput] = useState('');
  const [platform, setPlatform] = useState('Instagram');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GeneratedPost | null>(null);
  const [isCopying, setIsCopying] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  const handleGenerate = async () => {
    if (!input.trim()) return;
    setIsLoading(true);
    setResult(null);
    try {
      const content = await generateSocialContent(input, platform);
      setResult(content);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!result?.item_prompt) return;
    setIsGeneratingImage(true);
    try {
      const imageUrl = await generateAssetImage(result.item_prompt);
      if (imageUrl) {
        setResult(prev => prev ? { ...prev, imageUrl } : null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const copyAllForSpreadsheet = () => {
    if (!result) return;
    const hashtagsStr = result.hashtags.map(t => t.startsWith('#') ? t : `#${t}`).join(' ');
    // Format: "Post Text" [TAB] "Hashtags"
    const content = `${result.copy}\t${hashtagsStr}`;
    navigator.clipboard.writeText(content);
    setIsCopying(true);
    setTimeout(() => setIsCopying(false), 2000);
  };

  return (
    <div className="flex h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-[#EEEEEE] flex flex-col">
        <div className="p-6 border-b border-[#EEEEEE] flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-200">
            <Sparkles className="text-white w-5 h-5" />
          </div>
          <h1 className="font-bold text-lg tracking-tight text-blue-900">Social Studio</h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <NavButton 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')}
            icon={<Layout className="w-4 h-4" />}
            label="ワークスペース"
          />
          <NavButton 
            active={activeTab === 'holiday'} 
            onClick={() => setActiveTab('holiday')}
            icon={<Calendar className="w-4 h-4" />}
            label="休日投稿エンジン"
          />
          <NavButton 
            active={activeTab === 'worksheet'} 
            onClick={() => setActiveTab('worksheet')}
            icon={<FileText className="w-4 h-4" />}
            label="ワークシート改善"
          />
          <NavButton 
            active={activeTab === 'moodboard'} 
            onClick={() => setActiveTab('moodboard')}
            icon={<Palette className="w-4 h-4" />}
            label="ムードボード"
          />
        </nav>

        <div className="p-4 border-t border-[#EEEEEE]">
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
            <p className="text-xs font-medium text-blue-600/60 uppercase tracking-wider mb-2">My Ideas</p>
            <p className="text-xs text-blue-900/60 italic leading-relaxed">
              「私のアプリは、走り書きのメモをAIマジックで投稿コンテンツに変え、マネージャーの時間を節約します。」
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="h-16 bg-white border-b border-[#EEEEEE] flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex items-center gap-2 text-sm font-medium text-black/40 uppercase tracking-widest">
            {activeTab === 'dashboard' ? '一般ワークスペース' : activeTab === 'holiday' ? '休日投稿エンジン' : activeTab === 'worksheet' ? 'ワークシート改善' : 'ムードボード'}
          </div>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 text-sm font-semibold bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition-colors shadow-sm">
              <Plus className="w-4 h-4" />
              新規キャンペーン
            </button>
          </div>
        </header>

        <div className="p-8 max-w-5xl mx-auto">
          {activeTab === 'dashboard' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                {/* Input Card */}
                <div className="bg-white rounded-3xl p-8 border border-[#EEEEEE] shadow-sm space-y-6">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold">どんな計画ですか？</h2>
                    <p className="text-black/50 text-sm italic">
                      ワークシートからの下書きやアイデアをここに貼り付けてください。
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-widest text-black/40 mb-2 block">
                        プラットフォーム
                      </label>
                      <select 
                        value={platform}
                        onChange={(e) => setPlatform(e.target.value)}
                        className="w-full bg-blue-50/50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-600 outline-none appearance-none"
                      >
                        <option>Instagram</option>
                        <option>TikTok</option>
                        <option>LinkedIn</option>
                        <option>Twitter / X</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase tracking-widest text-black/40 mb-2 block">
                        キャンペーン概要 / 休日 / メモ
                      </label>
                      <textarea 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="例：母の日に向けた投稿。ギフトのアイデアと温かいメッセージを中心に。"
                        className="w-full bg-blue-50/50 border-none rounded-2xl px-4 py-4 text-sm focus:ring-2 focus:ring-blue-600 outline-none min-h-[160px] resize-none"
                      />
                    </div>
                  </div>

                  <button 
                    onClick={handleGenerate}
                    disabled={isLoading || !input.trim()}
                    className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-200"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Rocket className="w-5 h-5" />
                    )}
                    コンテンツを生成
                  </button>
                </div>

                {/* Result Area */}
                <div className="space-y-6 min-h-[400px]">
                  <AnimatePresence mode="wait">
                    {result ? (
                      <motion.div 
                        key="result"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                      >
                        {/* Copy Card */}
                        <div className="bg-white rounded-3xl p-8 border border-[#EEEEEE] shadow-sm space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="font-bold flex items-center gap-2">
                              <MessageSquare className="w-4 h-4 text-black/40" />
                              下書きコピー
                            </h3>
                            <div className="flex gap-2">
                              <button 
                                onClick={copyAllForSpreadsheet}
                                title="スプレッドシート用にすべてコピー"
                                className="flex items-center gap-1.5 text-[10px] font-bold bg-green-50 text-green-600 px-3 py-1 rounded-full hover:bg-green-100 transition-colors"
                              >
                                {isCopying ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                スプレッドシート用にコピー
                              </button>
                            </div>
                          </div>
                          <p className="text-sm leading-relaxed text-black/80 whitespace-pre-wrap">
                            {result.copy}
                          </p>
                          <div className="flex flex-wrap gap-2 pt-4">
                            {result.hashtags.map((tag, i) => (
                              <span key={i} className="text-[11px] font-mono text-black/40">
                                {tag.startsWith('#') ? tag : `#${tag}`}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Image Card */}
                        <div className="bg-white rounded-3xl p-8 border border-[#EEEEEE] shadow-sm space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="font-bold flex items-center gap-2">
                              <ImageIcon className="w-4 h-4 text-black/40" />
                              ビジュアル素材
                            </h3>
                            {!result.imageUrl && (
                              <button 
                                onClick={handleGenerateImage}
                                disabled={isGeneratingImage}
                                className="text-xs font-bold bg-blue-50 text-blue-600 px-3 py-1 rounded-full hover:bg-blue-100 transition-colors flex items-center gap-2"
                              >
                                {isGeneratingImage ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                                AI画像生成
                              </button>
                            )}
                          </div>
                          
                          {result.imageUrl ? (
                            <div className="relative group">
                              <img 
                                src={result.imageUrl} 
                                alt="Generated" 
                                className="w-full aspect-square object-cover rounded-2xl border border-[#EEEEEE]"
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
                                <button 
                                  onClick={handleGenerateImage}
                                  className="bg-white text-black text-xs font-bold px-4 py-2 rounded-full flex items-center gap-2"
                                >
                                  <RefreshCcw className="w-3 h-3" />
                                  再生成
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="bg-black/5 aspect-square rounded-2xl flex flex-col items-center justify-center p-8 text-center space-y-4">
                              <ImageIcon className="w-12 h-12 text-black/10" />
                              <div className="space-y-1">
                                <p className="text-xs font-bold uppercase tracking-widest text-black/40">推奨コンセプト</p>
                                <p className="text-xs text-black/60 italic leading-relaxed px-4">
                                  {result.item_prompt.length > 120 ? result.item_prompt.substring(0, 120) + '...' : result.item_prompt}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div 
                        key="placeholder"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="h-full flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-[#EEEEEE] rounded-[40px] space-y-6"
                      >
                        <div className="w-20 h-20 bg-black/5 rounded-full flex items-center justify-center">
                          <Share2 className="w-10 h-10 text-black/10" />
                        </div>
                        <div className="max-w-xs space-y-2">
                          <h3 className="font-bold text-lg">マジックを待機中...</h3>
                          <p className="text-sm text-black/40 leading-relaxed italic">
                            生成されたコピー、ハッシュタグ、ビジュアル素材がここに表示されます。
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'holiday' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="space-y-2 text-center mb-12">
                <h2 className="text-3xl font-bold">休日投稿エンジン</h2>
                <p className="text-black/40">もう休日のネタに困ることはありません。</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { name: '母の日', prompt: '母の日に感謝を伝える投稿。ギフトのアイデアと心温まるメッセージ。', color: 'bg-pink-50 text-pink-600' },
                  { name: '夏休み', prompt: '夏休みの旅行やアウトドアに最適なアイテムを紹介する投稿。', color: 'bg-orange-50 text-orange-600' },
                  { name: 'ハロウィン', prompt: 'ハロウィンパーティーの準備やコスチュームのアイデア。少しミステリアスな雰囲気。', color: 'bg-purple-50 text-purple-600' },
                  { name: 'クリスマス', prompt: 'クリスマスの装飾やギフトガイド。魔法のような冬の雰囲気。', color: 'bg-red-50 text-red-600' },
                  { name: '正月 / 新年', prompt: '新年の抱負や新しい始まりを祝う投稿。ポジティブなエネルギー。', color: 'bg-amber-50 text-amber-600' },
                  { name: 'バレンタイン', prompt: '大切な人への感謝や自分へのご褒美チョコの紹介。', color: 'bg-rose-50 text-rose-600' }
                ].map((holiday) => (
                  <button 
                    key={holiday.name}
                    onClick={() => {
                      setInput(holiday.prompt);
                      setActiveTab('dashboard');
                    }}
                    className={`p-6 rounded-3xl border border-transparent hover:border-black/5 transition-all text-left space-y-3 group ${holiday.color}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold">{holiday.name}</span>
                      <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-xs opacity-70 leading-relaxed line-clamp-2">
                      {holiday.prompt}
                    </p>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'worksheet' && (
            <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-6">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center">
                <FileText className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-blue-900">ワークシート改善は準備中です</h2>
                <p className="text-blue-900/40 max-w-md mx-auto italic">
                  スプレッドシートやドキュメントから大量のタスクを一括で読み込み、AIで一気に改善する機能を開発しています。
                </p>
              </div>
              <button 
                onClick={() => setActiveTab('dashboard')}
                className="flex items-center gap-2 text-sm font-bold border-b-2 border-blue-600 text-blue-600 pb-1 hover:pb-2 transition-all px-2"
              >
                ワークスペースに戻る
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {activeTab === 'moodboard' && (
            <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-6">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center">
                <Palette className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-blue-900">ムードボードは開発中です</h2>
                <p className="text-blue-900/40 max-w-md mx-auto italic">
                  ビジュアル素材を一箇所にまとめ、ブランドのトーン＆マナーを確認できるスペースを作成中です。
                </p>
              </div>
              <button 
                onClick={() => setActiveTab('dashboard')}
                className="flex items-center gap-2 text-sm font-bold border-b-2 border-blue-600 text-blue-600 pb-1 hover:pb-2 transition-all px-2"
              >
                ワークスペースに戻る
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
        active 
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 transform scale-[1.02]' 
        : 'text-blue-900/60 hover:bg-blue-50'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
