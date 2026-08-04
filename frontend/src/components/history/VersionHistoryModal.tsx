import React, { useState, useEffect } from 'react';
import {
  X, History, Clock, RotateCcw, ArrowLeftRight, Check, Plus
} from 'lucide-react';

export interface ResumeVersion {
  id: string;
  label: string;
  timestamp: string;
  resumeData: any;
}

interface VersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentResumeData: any;
  onRestoreVersion: (versionData: any) => void;
}

export const VersionHistoryModal: React.FC<VersionHistoryModalProps> = ({
  isOpen,
  onClose,
  currentResumeData,
  onRestoreVersion
}) => {
  const [versions, setVersions] = useState<ResumeVersion[]>(() => {
    try {
      const saved = localStorage.getItem('nova_resume_versions');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    // Default initial version
    return [
      {
        id: 'v_init',
        label: 'Initial Version',
        timestamp: new Date().toLocaleString(),
        resumeData: currentResumeData
      }
    ];
  });

  const [selectedVersion, setSelectedVersion] = useState<ResumeVersion | null>(null);
  const [newVersionLabel, setNewVersionLabel] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'compare'>('list');

  useEffect(() => {
    if (versions.length > 0 && !selectedVersion) {
      setSelectedVersion(versions[0]);
    }
  }, [versions]);

  if (!isOpen) return null;

  const handleSaveSnapshot = () => {
    const newVersion: ResumeVersion = {
      id: `v_${Date.now()}`,
      label: newVersionLabel.trim() || `Version ${versions.length + 1}`,
      timestamp: new Date().toLocaleString(),
      resumeData: currentResumeData
    };

    const nextVersions = [newVersion, ...versions];
    setVersions(nextVersions);
    setSelectedVersion(newVersion);
    setNewVersionLabel('');

    try {
      localStorage.setItem('nova_resume_versions', JSON.stringify(nextVersions));
    } catch (e) {
      console.error(e);
    }
  };

  const handleRestore = (version: ResumeVersion) => {
    onRestoreVersion(version.resumeData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-5xl shadow-2xl p-4 sm:p-6 relative flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-100 text-emerald-700 shadow-xs">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                <span>Resume Version History</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase">
                  {versions.length} Versions Saved
                </span>
              </h2>
              <p className="text-xs text-slate-500">Track iterations, compare changes side-by-side, and restore previous versions</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode(viewMode === 'list' ? 'compare' : 'list')}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs flex items-center gap-1.5"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>{viewMode === 'list' ? 'Compare Versions' : 'Back to Version List'}</span>
            </button>
            <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-500">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Create Snapshot Bar */}
        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center gap-2 my-3 flex-shrink-0">
          <input
            type="text"
            value={newVersionLabel}
            onChange={(e) => setNewVersionLabel(e.target.value)}
            placeholder="Name this version snapshot (e.g. Software Engineer Tech Lead v2)..."
            className="w-full sm:flex-1 p-2 bg-white border border-slate-200 rounded-xl text-xs font-medium"
          />
          <button
            onClick={handleSaveSnapshot}
            className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Save Version Snapshot</span>
          </button>
        </div>

        {/* Main Content Body */}
        <div className="flex-1 overflow-hidden flex gap-4 min-h-0 text-xs">
          
          {/* Left Column: Version History Timeline */}
          <div className="w-full sm:w-1/3 overflow-y-auto space-y-2 pr-1 border-r border-slate-200">
            <span className="text-[10px] font-black uppercase text-slate-400 block px-1">Saved Versions Timeline</span>
            {versions.map((ver) => (
              <div
                key={ver.id}
                onClick={() => setSelectedVersion(ver)}
                className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                  selectedVersion?.id === ver.id
                    ? 'border-emerald-600 bg-emerald-50/60 shadow-xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-extrabold text-slate-900 text-xs">{ver.label}</span>
                  {selectedVersion?.id === ver.id && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>{ver.timestamp}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Right Column: Version Preview OR Compare View */}
          <div className="hidden sm:flex flex-1 flex-col overflow-y-auto space-y-3 pl-1">
            {viewMode === 'list' && selectedVersion ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <div>
                    <h3 className="font-extrabold text-slate-900">{selectedVersion.label}</h3>
                    <span className="text-[10px] text-slate-500 font-mono">{selectedVersion.timestamp}</span>
                  </div>
                  <button
                    onClick={() => handleRestore(selectedVersion)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-extrabold text-xs flex items-center gap-1.5 shadow-md transition-transform active:scale-95"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restore This Version</span>
                  </button>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 font-sans">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Candidate Name</span>
                    <h4 className="font-black text-sm text-slate-900">{selectedVersion.resumeData?.fullName}</h4>
                    <p className="text-xs font-bold text-emerald-700">{selectedVersion.resumeData?.title}</p>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Summary</span>
                    <p className="text-slate-600 leading-relaxed">{selectedVersion.resumeData?.summary}</p>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Skills</span>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {(selectedVersion.resumeData?.skills || '').split(',').map((s: string, idx: number) => (
                        <span key={idx} className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-semibold text-slate-700">
                          {s.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Compare Mode */
              <div className="space-y-3">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <h3 className="font-extrabold text-slate-900 text-xs">Side-by-Side Version Comparison</h3>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <span className="font-bold text-slate-700 block">Selected Version ({selectedVersion?.label})</span>
                    <p className="text-slate-600">{selectedVersion?.resumeData?.summary}</p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <span className="font-bold text-slate-700 block">Current Live Data</span>
                    <p className="text-slate-600">{currentResumeData?.summary}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-200 flex justify-end gap-2 flex-shrink-0">
          <button onClick={onClose} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
