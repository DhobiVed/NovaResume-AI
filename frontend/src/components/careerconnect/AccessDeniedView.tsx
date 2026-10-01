import React from 'react';
import { ShieldAlert, ArrowLeft, RefreshCw, ExternalLink } from 'lucide-react';
import type { UserRoleType } from '../../types/careerConnect';

interface Props {
  currentRole: UserRoleType;
  requiredRole: string;
  onReturnToDashboard: () => void;
  onSwitchRole: () => void;
  onNavigateToNova: () => void;
}

export const AccessDeniedView: React.FC<Props> = ({
  currentRole,
  requiredRole,
  onReturnToDashboard,
  onSwitchRole,
  onNavigateToNova
}) => {
  return (
    <div className="min-h-screen bg-white text-slate-900 flex items-center justify-center p-4 font-sans">
      <div className="max-w-lg w-full bg-white border border-rose-200 rounded-3xl p-8 text-center shadow-xl space-y-6 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute -top-20 -left-20 w-48 h-48 bg-rose-50 rounded-full blur-3xl pointer-events-none -z-10" />
        
        {/* Icon */}
        <div className="w-16 h-16 mx-auto rounded-3xl bg-rose-50 border border-rose-200 flex items-center justify-center shadow-2xs">
          <ShieldAlert className="w-8 h-8 text-rose-600" />
        </div>

        {/* Title */}
        <div>
          <div className="inline-block px-3 py-1 rounded-full bg-rose-50 text-rose-700 font-mono text-xs font-bold border border-rose-200 mb-2">
            HTTP 403 • FORBIDDEN
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Role Permission Denied
          </h1>
          <p className="text-sm text-slate-600 font-medium leading-relaxed mt-2">
            You do not have permission to view the <strong className="text-rose-700 capitalize">{requiredRole}</strong> console.
          </p>
        </div>

        {/* RBAC Diagnostic Box */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/90 text-left text-xs space-y-2">
          <div className="flex justify-between items-center text-slate-600">
            <span>Your Authenticated Role:</span>
            <span className="font-mono font-bold text-emerald-800 uppercase">{currentRole}</span>
          </div>
          <div className="flex justify-between items-center text-slate-600">
            <span>Required Module Role:</span>
            <span className="font-mono font-bold text-rose-700 uppercase">{requiredRole}</span>
          </div>
          <div className="flex justify-between items-center text-slate-600">
            <span>Server RBAC Policy:</span>
            <span className="font-mono text-slate-800 font-semibold">Strict Multi-Tenant Isolation</span>
          </div>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed">
          Nova CareerConnect enforces server-side authorization. To access administrative or institutional portals, you must sign in with an account having those credentials.
        </p>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-2">
          <button
            onClick={onReturnToDashboard}
            className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to My Authorized Dashboard</span>
          </button>

          <button
            onClick={onSwitchRole}
            className="w-full py-2.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs transition-colors flex items-center justify-center gap-2 border border-slate-200/90 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-700" />
            <span>Switch Account / Portal Doorway</span>
          </button>

          <button
            onClick={onNavigateToNova}
            className="w-full py-2 text-slate-500 hover:text-slate-800 text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer"
          >
            <span>Back to Nova Resume AI</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
