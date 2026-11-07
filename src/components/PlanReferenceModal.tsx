import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Upload,
  AlertTriangle,
  Wind,
  ShieldCheck,
  Flame,
  CheckCircle,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { useTracker } from '../context/TrackerContext';

interface PlanReferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PlanReferenceModal: React.FC<PlanReferenceModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { program, replacePlanProgram } = useTracker();
  const [activeTab, setActiveTab] = useState<'rules' | 'image' | 'ai_scanner'>('rules');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scanMessage, setScanMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Handler to analyze new image with Gemini AI
  const handleScanImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    setScanMessage('Uploading and scanning routine with Gemini 3.8 Flash Vision...');

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64WithHeader = event.target?.result as string;
        const base64Data = base64WithHeader.split(',')[1];
        const mimeType = file.type || 'image/png';

        const res = await fetch('/api/gemini/parse-plan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: base64Data,
            imageMimeType: mimeType,
          }),
        });

        const data = await res.json();
        if (data.plan && data.plan.days) {
          // Format into PlanProgram structure
          const formattedDays = data.plan.days.map((d: any, idx: number) => ({
            id: `custom-day-${idx + 1}`,
            dayNumber: d.dayNumber || idx + 1,
            title: d.title || `Day ${idx + 1}`,
            type: d.type || 'easy',
            runningInstructions: d.runningInstructions || 'No instructions',
            gymFocus: d.gymFocus || d.title,
            hasWarmup: d.hasWarmup ?? true,
            progressionRule: d.progressionRule || '',
            estimatedBurn: d.estimatedBurn || 500,
            targetDurationMin: d.targetDurationMin || 60,
            customTasks: [
              { id: `t-${idx}-1`, title: 'Main Session Workout', category: 'workout' },
            ],
          }));

          replacePlanProgram({
            name: data.plan.name || 'Custom AI-Parsed Plan',
            subtitle: data.plan.subtitle || 'Generated from image upload',
            cycleLength: data.plan.cycleLength || formattedDays.length,
            days: formattedDays,
            rules: {
              warmupDrills: data.plan.warmupDrills || program.rules.warmupDrills,
              breathingRules: data.plan.breathingRules || program.rules.breathingRules,
              rules: data.plan.rules || program.rules.rules,
              medicalAlerts: data.plan.medicalAlerts || program.rules.medicalAlerts,
            },
          });

          setScanMessage('Plan successfully extracted and applied!');
          setTimeout(() => {
            setIsAnalyzing(false);
            setScanMessage(null);
            onClose();
          }, 1500);
        } else {
          setScanMessage(data.message || 'Plan processed.');
          setIsAnalyzing(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setScanMessage(`Failed to parse image: ${err.message}`);
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden relative">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <span>{program.name}</span>
            </h2>
            <p className="text-xs text-slate-400">{program.subtitle}</p>
          </div>

          <div className="flex items-center gap-2">
            {/* View tabs */}
            <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTab('rules')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  activeTab === 'rules' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Rules & Guidelines
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('image')}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${
                  activeTab === 'image' ? 'bg-slate-800 text-cyan-400' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Eye size={13} />
                <span>Reference Image</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('ai_scanner')}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${
                  activeTab === 'ai_scanner'
                    ? 'bg-purple-600 text-white'
                    : 'text-purple-400 hover:text-purple-300'
                }`}
              >
                <Sparkles size={13} />
                <span>AI Photo Scan</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: Rules & Guidelines */}
          {activeTab === 'rules' && (
            <div className="space-y-6">
              {/* Warm-Up & Drills */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
                    <Flame size={18} />
                  </div>
                  <h3 className="font-bold text-slate-100 text-sm uppercase tracking-wider font-mono">
                    Warm-up + Drills (Days 1, 4, 5, 6)
                  </h3>
                </div>
                <div className="space-y-2 text-sm text-slate-300">
                  {program.rules?.warmupDrills?.map((rule, idx) => (
                    <div key={idx} className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0" />
                      <span>{rule}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Breathing Rules */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                    <Wind size={18} />
                  </div>
                  <h3 className="font-bold text-slate-100 text-sm uppercase tracking-wider font-mono">
                    Breathing Guidelines
                  </h3>
                </div>
                <div className="space-y-2 text-sm text-slate-300">
                  {program.rules?.breathingRules?.map((rule, idx) => (
                    <div key={idx} className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
                      <span>{rule}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Core Execution Rules */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
                    <ShieldCheck size={18} />
                  </div>
                  <h3 className="font-bold text-slate-100 text-sm uppercase tracking-wider font-mono">
                    Program Rules & Syncing
                  </h3>
                </div>
                <div className="space-y-2 text-sm text-slate-300">
                  {program.rules?.rules?.map((rule, idx) => (
                    <div key={idx} className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 shrink-0" />
                      <span>{rule}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Medical Warnings */}
              <div className="bg-rose-950/30 border border-rose-500/30 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400">
                    <AlertTriangle size={18} />
                  </div>
                  <h3 className="font-bold text-rose-300 text-sm uppercase tracking-wider font-mono">
                    See a Doctor If
                  </h3>
                </div>
                <div className="space-y-2 text-sm text-rose-200">
                  {program.rules?.medicalAlerts?.map((rule, idx) => (
                    <div key={idx} className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-2 shrink-0" />
                      <span>{rule}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Original Reference Image */}
          {activeTab === 'image' && (
            <div className="flex flex-col items-center justify-center space-y-4">
              <p className="text-xs text-slate-400 text-center">
                Original program reference graphic provided by user:
              </p>
              <div className="max-w-md w-full rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-black">
                <img
                  src="/assets/aistudio/rei-9-day-plan_1600265b.png"
                  alt="9-Day Running + Gym Plan Original"
                  className="w-full h-auto object-contain"
                />
              </div>
            </div>
          )}

          {/* TAB 3: AI Scanner */}
          {activeTab === 'ai_scanner' && (
            <div className="space-y-4 max-w-xl mx-auto py-4">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center mx-auto border border-purple-500/20">
                  <Sparkles size={28} />
                </div>
                <h3 className="text-lg font-black text-white">AI Routine Vision Scanner</h3>
                <p className="text-xs text-slate-400">
                  Send any workout plan screenshot, whiteboard photo, or training cycle image. Gemini 3.8 Flash will parse days, instructions, and rules directly into your tracker.
                </p>
              </div>

              {scanMessage && (
                <div className="p-4 bg-purple-950/50 border border-purple-500/40 rounded-xl text-xs text-purple-300 text-center flex items-center justify-center gap-2 font-medium">
                  {isAnalyzing && <RefreshCw size={14} className="animate-spin" />}
                  <span>{scanMessage}</span>
                </div>
              )}

              <div className="p-8 border-2 border-dashed border-slate-700 hover:border-purple-500 rounded-2xl text-center bg-slate-950/60 transition-colors">
                <Upload size={32} className="mx-auto text-purple-400 mb-3" />
                <span className="text-sm font-bold text-slate-200 block mb-1">
                  Upload Plan Image
                </span>
                <span className="text-xs text-slate-500 block mb-4">
                  PNG, JPG, or WEBP up to 20MB
                </span>

                <label className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs cursor-pointer shadow-lg shadow-purple-600/30 transition-all inline-block active:scale-95">
                  Select Image File
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleScanImage}
                    disabled={isAnalyzing}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
