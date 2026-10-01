import React, { useState, useEffect, useRef } from 'react';
import {
  Award, ShieldCheck, Download, Search, CheckCircle2,
  Sparkles, X
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { careerConnectService } from '../../services/careerConnectService';
import type { CertificateRecord, BadgeItem, AuthUserSession } from '../../types/careerConnect';

interface CertificatesViewProps {
  session: AuthUserSession | null;
  onNavigateToAssessment?: () => void;
}

export const CertificatesView: React.FC<CertificatesViewProps> = ({
  session,
  onNavigateToAssessment
}) => {
  const [certificates, setCertificates] = useState<CertificateRecord[]>([]);
  const [badges, setBadges] = useState<BadgeItem[]>([]);
  const [selectedCert, setSelectedCert] = useState<CertificateRecord | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Verification tool state
  const [verifyInput, setVerifyInput] = useState('');
  const [verifyResult, setVerifyResult] = useState<CertificateRecord | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifySearched, setVerifySearched] = useState(false);

  const certPrintRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const studentId = session?.id || 'demo-student-1';
    let isMounted = true;

    async function loadData() {
      const [cList, bList] = await Promise.all([
        careerConnectService.getStudentCertificates(studentId),
        careerConnectService.getStudentBadges(studentId)
      ]);
      if (isMounted) {
        setCertificates(cList);
        setBadges(bList);
      }
    }
    loadData();

    return () => {
      isMounted = false;
    };
  }, [session?.id]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyInput.trim()) return;

    setIsVerifying(true);
    setVerifySearched(true);
    try {
      const res = await careerConnectService.verifyCertificate(verifyInput.trim());
      setVerifyResult(res);
    } catch {
      setVerifyResult(null);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDownloadPdf = async (cert: CertificateRecord) => {
    if (!certPrintRef.current) return;
    setIsExporting(true);
    try {
      const element = certPrintRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#FFFDF9'
      });
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });
      pdf.addImage(imgData, 'JPEG', 0, 0, 297, 210);
      pdf.save(`NovaCareerConnect_${cert.skillOrLanguage}_${cert.id}.pdf`);
    } catch (err) {
      console.error('Failed to export certificate PDF:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* ── HEADER BANNER ── */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-slate-50 text-amber-900 text-[10px] font-mono font-black border border-slate-200/90">
                CREDENTIALS & BADGES
              </span>
              <span className="text-[11px] font-bold text-slate-500">
                Official Nova CareerConnect Skill Accreditations
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 mt-1">
              Verified Technical Certificates & Badges
            </h1>
            <p className="text-xs text-slate-600 font-medium max-w-2xl mt-0.5">
              Certificates are automatically awarded upon scoring 70%+ on official proctored 50-question examinations. Each certificate features an immutable hash verifiable by recruiters.
            </p>
          </div>

          {onNavigateToAssessment && (
            <button
              onClick={onNavigateToAssessment}
              className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs transition shadow-xs flex items-center gap-2 cursor-pointer flex-shrink-0"
            >
              <Award className="w-4 h-4" />
              <span>Take Qualifying Exam (70%+)</span>
            </button>
          )}
        </div>
      </div>

      {/* ── PUBLIC CERTIFICATE VERIFIER TOOL ── */}
      <div className="bg-slate-50 border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-xs font-black text-slate-900">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          <span>Public Certificate Verification System</span>
        </div>
        <p className="text-[11px] text-slate-600">
          Enter an authentic Nova CareerConnect certificate ID (e.g. <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200/90">NC-JAVA-XXXXXXXX</code>) to verify authenticity and score validity.
        </p>

        <form onSubmit={handleVerify} className="flex flex-col sm:flex-row gap-2 max-w-xl">
          <input
            type="text"
            value={verifyInput}
            onChange={e => setVerifyInput(e.target.value)}
            placeholder="Enter Certificate ID..."
            className="flex-1 px-4 py-2.5 text-xs bg-white rounded-xl border border-slate-200/90 text-slate-900 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <button
            type="submit"
            disabled={isVerifying || !verifyInput.trim()}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <Search className="w-3.5 h-3.5" />
            <span>{isVerifying ? 'Verifying...' : 'Verify Certificate'}</span>
          </button>
        </form>

        {/* Verification Result */}
        {verifySearched && (
          <div className="pt-2 animate-fadeIn">
            {verifyResult ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-xs space-y-2">
                <div className="flex items-center gap-2 font-black text-emerald-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Verified Authentic Certificate — Status: {verifyResult.status}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-700 pt-1">
                  <div>
                    <span className="text-slate-500">Candidate:</span>
                    <div className="font-bold">{verifyResult.studentName}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Skill / Exam:</span>
                    <div className="font-bold">{verifyResult.skillOrLanguage}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Verified Score:</span>
                    <div className="font-bold text-emerald-800 font-mono">{verifyResult.percentage}%</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Issue Date:</span>
                    <div className="font-bold">{new Date(verifyResult.issuedAt).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-bold">
                No authentic certificate found matching ID "{verifyInput}". Please verify the certificate ID.
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── EARNED CERTIFICATES GALLERY ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black text-slate-900">
            Your Official Certificates ({certificates.length})
          </h2>
        </div>

        {certificates.length === 0 ? (
          <div className="bg-white border border-slate-200/90 rounded-3xl p-10 text-center shadow-xs space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-center justify-center text-amber-800 mx-auto">
              <Award className="w-7 h-7" />
            </div>
            <h3 className="text-sm font-black text-slate-900">No Certificates Earned Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Complete any 50-question skill examination with a verified score of 70% or higher to receive your official accreditation certificate.
            </p>
            {onNavigateToAssessment && (
              <button
                onClick={onNavigateToAssessment}
                className="mt-2 px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs transition cursor-pointer"
              >
                Launch Skill Assessment
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {certificates.map(cert => (
              <div
                key={cert.id}
                className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs hover:border-amber-400 transition-all flex flex-col justify-between gap-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-center justify-center text-amber-800">
                        <Award className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono font-bold text-amber-900 bg-slate-50 px-2 py-0.5 rounded border border-slate-200/90">
                          {cert.id}
                        </span>
                        <h3 className="text-sm font-black text-slate-900 mt-1">
                          {cert.skillOrLanguage} Skill Credential
                        </h3>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 font-mono font-black text-xs border border-emerald-200">
                      {cert.percentage}% Score
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 line-clamp-2">
                    {cert.achievementStatement}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium pt-2 border-t border-slate-100">
                    <span>Issued: {new Date(cert.issuedAt).toLocaleDateString()}</span>
                    <span>Trust Score: {cert.proctorTrustScore}%</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => setSelectedCert(cert)}
                    className="flex-1 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer text-center"
                  >
                    View Official Certificate
                  </button>
                  <button
                    onClick={() => {
                      setSelectedCert(cert);
                      setTimeout(() => handleDownloadPdf(cert), 300);
                    }}
                    className="px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-amber-900 border border-slate-200/90 text-xs font-bold transition cursor-pointer"
                    title="Download PDF"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── RULE-BASED BADGES GALLERY ── */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-700" />
          <span>Rule-Based Achievement Badges ({badges.length})</span>
        </h2>

        {badges.length === 0 ? (
          <p className="text-xs text-slate-400">Complete verified assessments to unlock technical achievement badges.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {badges.map(b => (
              <div
                key={b.id}
                className="p-4 rounded-xl bg-white border border-slate-200 flex items-center gap-3 shadow-xs"
              >
                <div className="w-10 h-10 rounded-lg bg-slate-900 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 truncate">{b.title}</div>
                  <div className="text-[10px] text-slate-500 line-clamp-1">{b.description}</div>
                  <div className="text-[9px] font-mono text-emerald-700 font-bold mt-0.5">{b.criteria}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* ── CERTIFICATE PREVIEW MODAL & PDF TEMPLATE ── */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {selectedCert && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-xl max-w-4xl w-full p-6 space-y-4 border border-slate-200 shadow-2xl relative my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-slate-900" />
                <span className="text-sm font-bold text-slate-900">Certificate of Achievement</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownloadPdf(selectedCert)}
                  disabled={isExporting}
                  className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isExporting ? 'Exporting PDF...' : 'Download PDF Certificate'}</span>
                </button>
                <button
                  onClick={() => setSelectedCert(null)}
                  className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* PRINTABLE A4 CERTIFICATE CANVAS */}
            <div
              ref={certPrintRef}
              className="w-full bg-[#FFFDF9] border-8 border-double border-amber-800/80 rounded-2xl p-8 sm:p-12 text-center relative overflow-hidden shadow-inner"
              style={{ minHeight: '440px' }}
            >
              {/* Corner Ornaments */}
              <div className="absolute top-4 left-4 text-amber-800 text-2xl font-serif">✦</div>
              <div className="absolute top-4 right-4 text-amber-800 text-2xl font-serif">✦</div>
              <div className="absolute bottom-4 left-4 text-amber-800 text-2xl font-serif">✦</div>
              <div className="absolute bottom-4 right-4 text-amber-800 text-2xl font-serif">✦</div>

              {/* Watermark */}
              <div className="absolute inset-0 flex items-center justify-center opacity-3 pointer-events-none text-9xl font-black text-slate-900 tracking-widest select-none">
                NOVA
              </div>

              {/* Organization Header */}
              <div className="space-y-1">
                <div className="text-xs font-mono font-black tracking-widest text-amber-800 uppercase">
                  NOVA CAREERCONNECT ACADEMIA-INDUSTRY NETWORK
                </div>
                <div className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase">
                  Verified Skill Assessment & Competency Accreditation
                </div>
              </div>

              <div className="my-6">
                <h1 className="text-2xl sm:text-3xl font-serif font-black text-slate-900 uppercase tracking-wide">
                  Certificate of Achievement
                </h1>
                <p className="text-xs text-slate-500 font-serif italic mt-1">
                  This technical credential is awarded to
                </p>
              </div>

              {/* Student Name */}
              <div className="my-4">
                <div className="text-2xl sm:text-3xl font-black text-amber-900 border-b-2 border-amber-700/60 pb-1.5 inline-block min-w-[280px]">
                  {selectedCert.studentName}
                </div>
                <div className="text-xs text-slate-600 mt-1 font-medium">
                  {selectedCert.studentInstitution || 'Government Engineering College, Modasa (GEC Modasa)'}
                </div>
              </div>

              {/* Statement */}
              <p className="max-w-xl mx-auto text-xs text-slate-700 leading-relaxed font-serif my-6">
                for demonstrating verified technical competency in the <strong>{selectedCert.skillOrLanguage}</strong> examination
                with a passing score of <strong>{selectedCert.percentage}%</strong> on {new Date(selectedCert.issuedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}.
              </p>

              {/* Signature & Verification Hash Footer */}
              <div className="grid grid-cols-3 items-end pt-6 border-t border-amber-800/30 max-w-2xl mx-auto text-xs">
                <div className="text-left space-y-0.5">
                  <div className="font-mono text-[10px] text-slate-400">CERTIFICATE ID</div>
                  <div className="font-mono font-black text-slate-900 text-xs">{selectedCert.id}</div>
                  <div className="text-[9px] text-emerald-700 font-bold">Verified Authentic ✓</div>
                </div>

                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-full border-2 border-amber-800 flex items-center justify-center p-1 text-center">
                    <div className="w-full h-full rounded-full border border-dashed border-amber-800 flex items-center justify-center text-[8px] font-black text-amber-900 uppercase tracking-tighter">
                      VERIFIED<br />CREDENTIAL
                    </div>
                  </div>
                </div>

                <div className="text-right space-y-0.5">
                  <div className="font-serif italic text-sm text-slate-800">Nova CareerConnect</div>
                  <div className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">Academic Advisory Board</div>
                </div>
              </div>

              {/* Legal Disclaimer */}
              <div className="text-[8px] text-slate-400 mt-6 max-w-lg mx-auto">
                Internal platform technical achievement certificate awarded by Nova CareerConnect. This credential represents competency in automated skill assessments and does not claim government accreditation or statutory degrees.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
