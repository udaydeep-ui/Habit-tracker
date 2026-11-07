import React, { useState } from 'react';
import {
  FileText,
  Download,
  Copy,
  Printer,
  Upload,
  Check,
  FileSpreadsheet,
  AlertCircle,
  Share2,
} from 'lucide-react';
import { useTracker } from '../context/TrackerContext';

export const ExportReports: React.FC = () => {
  const {
    program,
    habits,
    logs,
    exportCSV,
    exportDataJSON,
    importDataJSON,
    currentLoop,
  } = useTracker();

  const [copied, setCopied] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Generate downloadable CSV
  const handleDownloadCSV = () => {
    const csvContent = exportCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `cyclesync_progress_report_loop${currentLoop}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Generate downloadable JSON backup
  const handleDownloadJSON = () => {
    const jsonContent = exportDataJSON();
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `cyclesync_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Trigger browser print for PDF export
  const handlePrint = () => {
    window.print();
  };

  // Copy Markdown summary report
  const handleCopyMarkdown = () => {
    const sortedDates = Object.keys(logs).sort();
    let completedCount = 0;
    let failedCount = 0;
    let postponedCount = 0;
    let totalBurn = 0;
    let totalRun = 0;

    sortedDates.forEach((d) => {
      const l = logs[d];
      if (l.status === 'completed') completedCount++;
      if (l.status === 'failed') failedCount++;
      if (l.status === 'postponed_cancelled') postponedCount++;
      totalBurn += l.calories?.burned || 0;
      totalRun += l.progressions?.runningDistanceKm || 0;
    });

    const report = `# CycleSync Progress Report (${program.name})
- Generated: ${new Date().toLocaleDateString()}
- Current Loop: #${currentLoop}
- Total Logged Sessions: ${sortedDates.length}
- Completed (✓): ${completedCount}
- Failed (✗): ${failedCount}
- Postponed / Cancelled (−): ${postponedCount}
- Total Calories Burned: ${totalBurn.toLocaleString()} kcal
- Total Running Volume: ${totalRun.toFixed(1)} km

## Program Days:
${program.days.map((d) => `### Day ${d.dayNumber}: ${d.title} [${d.type.toUpperCase()}]\n${d.runningInstructions}`).join('\n\n')}

## Recent Activity:
${sortedDates
  .slice(-7)
  .map((d) => {
    const l = logs[d];
    return `- ${d}: Day ${l.cycleDayNumber} [${l.status.toUpperCase()}] | Burned: ${l.calories?.burned} kcal | Notes: ${l.dayWorks?.workoutNotes || 'None'}`;
  })
  .join('\n')}
`;

    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Import JSON file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const ok = importDataJSON(content);
        if (ok) {
          setImportStatus('Backup restored successfully!');
        } else {
          setImportStatus('Invalid JSON backup file format.');
        }
        setTimeout(() => setImportStatus(null), 3500);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Printable Report Section Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
              <FileText size={18} />
            </span>
            <h2 className="text-xl font-black text-white">Progress Reports & Data Export</h2>
          </div>
          <p className="text-xs text-slate-400">
            Export comprehensive printable progress reports, CSV data tables, and JSON backups
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-2 border border-slate-700 transition-all active:scale-95"
          >
            <Printer size={15} />
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </div>

      {/* Export Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* CSV Spreadsheet Export */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 w-fit mb-3 border border-emerald-500/20">
              <FileSpreadsheet size={24} />
            </div>
            <h3 className="font-bold text-slate-100 text-base mb-1">Spreadsheet Data (CSV)</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Export every logged entry with dates, statuses (tick, cross, minus), calorie burns/intakes, and running metrics into Excel or Google Sheets.
            </p>
          </div>

          <button
            type="button"
            onClick={handleDownloadCSV}
            className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
          >
            <Download size={15} />
            <span>Download CSV File</span>
          </button>
        </div>

        {/* Markdown & Share Summary */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 w-fit mb-3 border border-cyan-500/20">
              <Share2 size={24} />
            </div>
            <h3 className="font-bold text-slate-100 text-base mb-1">Shareable Text Summary</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Copy a structured Markdown summary of your 9-day cycle completion rates, calories, and PRs to share with training partners.
            </p>
          </div>

          <button
            type="button"
            onClick={handleCopyMarkdown}
            className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
          >
            {copied ? (
              <>
                <Check size={15} />
                <span>Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy size={15} />
                <span>Copy Summary Report</span>
              </>
            )}
          </button>
        </div>

        {/* Full JSON Backup & Restore */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 w-fit mb-3 border border-purple-500/20">
              <Download size={24} />
            </div>
            <h3 className="font-bold text-slate-100 text-base mb-1">Full Backup & Restore</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Download your complete plan program, habits, reminders, and historical logs in JSON format or restore from an existing file.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadJSON}
              className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition-all"
            >
              <Download size={14} />
              <span>Export JSON</span>
            </button>

            <label className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-purple-600/20 active:scale-95 transition-all text-center">
              <Upload size={14} />
              <span>Restore</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {importStatus && (
        <div className="p-3 bg-purple-950/40 border border-purple-500/40 rounded-xl text-purple-300 text-xs font-medium flex items-center gap-2">
          <AlertCircle size={15} />
          <span>{importStatus}</span>
        </div>
      )}

      {/* Printable Preview Sheet (Visual on screen, prints cleanly on paper) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl print:bg-white print:text-black print:border-none print:shadow-none">
        <div className="border-b border-slate-800 print:border-gray-300 pb-4 mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black text-white print:text-black">{program.name}</h3>
            <p className="text-xs text-slate-400 print:text-gray-600">{program.subtitle}</p>
          </div>
          <div className="text-right">
            <span className="text-xs font-mono text-emerald-400 print:text-emerald-700 font-bold block">
              LOOP #{currentLoop} REPORT
            </span>
            <span className="text-[10px] font-mono text-slate-500 print:text-gray-500">
              {new Date().toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* 9-Day Program Schedule Table */}
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 print:border-gray-300 text-slate-400 print:text-gray-700 uppercase font-mono text-[10px]">
                <th className="py-2 px-2">Day</th>
                <th className="py-2 px-3">Title & Focus</th>
                <th className="py-2 px-2">Type</th>
                <th className="py-2 px-4">Instructions</th>
                <th className="py-2 px-2 text-right">Est. Burn</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 print:divide-gray-200">
              {program.days.map((day) => (
                <tr key={day.id} className="text-slate-200 print:text-black">
                  <td className="py-2.5 px-2 font-mono font-bold">{day.dayNumber}</td>
                  <td className="py-2.5 px-3 font-semibold">{day.title}</td>
                  <td className="py-2.5 px-2 uppercase font-mono text-[10px]">
                    <span
                      className={`px-1.5 py-0.5 rounded font-black ${
                        day.type === 'easy'
                          ? 'bg-emerald-500/20 text-emerald-400 print:bg-green-100 print:text-green-800'
                          : day.type === 'hard'
                          ? 'bg-orange-500/20 text-orange-400 print:bg-orange-100 print:text-orange-800'
                          : day.type === 'long_run'
                          ? 'bg-cyan-500/20 text-cyan-400 print:bg-cyan-100 print:text-cyan-800'
                          : 'bg-slate-800 text-slate-300 print:bg-gray-100 print:text-gray-800'
                      }`}
                    >
                      {day.type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-slate-300 print:text-gray-700">{day.runningInstructions}</td>
                  <td className="py-2.5 px-2 text-right font-mono">{day.estimatedBurn} kcal</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Warm-Up & Breathing Guidelines Reference */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-4 border-t border-slate-800 print:border-gray-300">
          <div className="bg-slate-950/60 print:bg-gray-50 p-3 rounded-xl border border-slate-800 print:border-gray-200">
            <span className="font-bold text-amber-400 print:text-amber-700 block mb-1 uppercase tracking-wider text-[10px]">
              Warm-up + Drills (Days 1, 4, 5, 6)
            </span>
            <ul className="list-disc list-inside space-y-1 text-slate-300 print:text-gray-700">
              {program.rules?.warmupDrills?.map((w, idx) => (
                <li key={idx}>{w}</li>
              ))}
            </ul>
          </div>

          <div className="bg-slate-950/60 print:bg-gray-50 p-3 rounded-xl border border-slate-800 print:border-gray-200">
            <span className="font-bold text-emerald-400 print:text-emerald-700 block mb-1 uppercase tracking-wider text-[10px]">
              Breathing Guidelines
            </span>
            <ul className="list-disc list-inside space-y-1 text-slate-300 print:text-gray-700">
              {program.rules?.breathingRules?.map((b, idx) => (
                <li key={idx}>{b}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
