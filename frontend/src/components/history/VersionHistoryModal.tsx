import React, { useState, useEffect } from 'react';
import {
  X, History, Clock, RotateCcw, ArrowLeftRight, Check, Plus, Copy, Edit2, Trash2
} from 'lucide-react';

export interface ResumeVersion {
  id: string;
  label: string;
  timestamp: string;
  resumeData: any;
  versionNumber?: number;
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
    return [
      {
        id: 'v_init',
        label: 'Initial Version',
        versionNumber: 1,
        timestamp: new Date().toLocaleString(),
        resumeData: currentResumeData
      }
    ];
  });

  const [selectedVersion, setSelectedVersion] = useState<ResumeVersion | null>(null);
  const [newVersionLabel, setNewVersionLabel] = useState('');
  const [editingVersionId, setEditingVersionId] = useState<string | null>(null);
  const [editLabelText, setEditLabelText] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'compare'>('list');

  useEffect(() => {
    if (versions.length > 0 && !selectedVersion) {
      setSelectedVersion(versions[0]);
    }
  }, [versions]);

  if (!isOpen) return null;

  const saveVersionsToStorage = (updated: ResumeVersion[]) => {
    setVersions(updated);
    try {
      localStorage.setItem('nova_resume_versions', JSON.stringify(updated));
    } catch (e) {}
  };

  const handleSaveSnapshot = () => {
    const newVersion: ResumeVersion = {
      id: `v_${Date.now()}`,
      label: newVersionLabel.trim() || `Version ${versions.length + 1}`,
      versionNumber: versions.length + 1,
      timestamp: new Date().toLocaleString(),
      resumeData: currentResumeData
    };

    const nextVersions = [newVersion, ...versions];
    saveVersionsToStorage(nextVersions);
    setSelectedVersion(newVersion);
    setNewVersionLabel('');
  };

  const handleRestore = (version: ResumeVersion) => {
    onRestoreVersion(version.resumeData);
    onClose();
  };

  const handleDuplicateVersion = (version: ResumeVersion) => {
    const dup: ResumeVersion = {
      id: `v_${Date.now()}`,
      label: `${version.label} (Copy)`,
      versionNumber: versions.length + 1,
      timestamp: new Date().toLocaleString(),
      resumeData: { ...version.resumeData }
    };
    saveVersionsToStorage([dup, ...versions]);
  };

  const handleRenameVersion = (id: string) => {
    if (!editLabelText.trim()) return;
    const updated = versions.map(v => v.id === id ? { ...v, label: editLabelText.trim() } : v);
    saveVersionsToStorage(updated);
    setEditingVersionId(null);
  };

  const handleDeleteVersion = (id: string) => {
    const updated = versions.filter(v => v.id !== id);
    saveVersionsToStorage(updated);
    if (selectedVersion?.id === id) {
      setSelectedVersion(updated[0] || null);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-0 sm:p-5">
      <div className="bg-white border-0 sm:border border-slate-200 rounded-none sm:rounded-3xl w-full max-w-5xl shadow-2xl p-3 sm:p-6 relative flex flex-col h-full sm:h-[92vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 flex-shrink-0 gap-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-emerald-100 text-emerald-700 shadow-xs flex-shrink-0">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-lg font-black text-slate-900 flex items-center gap-1.5 flex-wrap">
                <span>Resume Version History</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-extrabold uppercase">
                  {versions.length} Saved
                </span>
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500 line-clamp-1">Track iterations, compare changes side-by-side & restore</p>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
            <button
              onClick={() => setViewMode(viewMode === 'list' ? 'compare' : 'list')}
              className="flex-1 sm:flex-none px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer min-h-[38px]"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>{viewMode === 'list' ? 'Compare' : 'List View'}</span>
            </button>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Create Snapshot Bar */}
        <div className="p-2.5 sm:p-3 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center gap-2 my-2.5 flex-shrink-0">
          <input
            type="text"
            value={newVersionLabel}
            onChange={(e) => setNewVersionLabel(e.target.value)}
            placeholder="Snapshot name (e.g. Tech Lead v2)..."
            className="w-full sm:flex-1 p-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-emerald-500 min-h-[38px]"
          />
          <button
            onClick={handleSaveSnapshot}
            className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer min-h-[38px]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Save Snapshot</span>
          </button>
        </div>

        {/* Main Content Body */}
        <div className="flex-1 overflow-y-auto sm:overflow-hidden flex flex-col sm:flex-row gap-3 min-h-0 text-xs">
          
          {/* Left Column: Version History Timeline */}
          <div className="w-full sm:w-1/3 overflow-y-auto space-y-2 pr-1 border-b sm:border-b-0 sm:border-r border-slate-200 pb-3 sm:pb-0">
            <span className="text-[10px] font-black uppercase text-slate-400 block px-1">Saved Versions Timeline</span>
            {versions.map((ver, idx) => (
              <div
                key={ver.id}
                onClick={() => setSelectedVersion(ver)}
                className={`p-3 rounded-2xl border cursor-pointer transition-all space-y-2 ${
                  selectedVersion?.id === ver.id
                    ? 'border-emerald-600 bg-emerald-50/60 shadow-xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex justify-between items-center">
                  {editingVersionId === ver.id ? (
                    <div className="flex items-center gap-1 w-full">
                      <input
                        type="text"
                        value={editLabelText}
                        onChange={(e) => setEditLabelText(e.target.value)}
                        className="p-1 text-xs border rounded bg-white font-bold w-full"
                      />
                      <button onClick={() => handleRenameVersion(ver.id)} className="p-1 bg-emerald-600 text-white rounded">
                        <Check className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <span className="font-extrabold text-slate-900 text-xs flex items-center gap-1">
                      <span className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 text-[9px]">v{ver.versionNumber || versions.length - idx}</span>
                      <span>{ver.label}</span>
                    </span>
                  )}
                  {selectedVersion?.id === ver.id && <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />}
                </div>

                <div className="flex justify-between items-center text-[10px] text-slate-500">
                  <div className="flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{ver.timestamp}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingVersionId(ver.id);
                        setEditLabelText(ver.label);
                      }}
                      className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                      title="Rename"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDuplicateVersion(ver);
                      }}
                      className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                      title="Duplicate"
                    >
                      <Copy className="w-3 h-3" />
                    </button>

                    {versions.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteVersion(ver.id);
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
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
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-extrabold text-xs flex items-center gap-1.5 shadow-md transition-transform active:scale-95 cursor-pointer min-h-[40px]"
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
          <button onClick={onClose} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
