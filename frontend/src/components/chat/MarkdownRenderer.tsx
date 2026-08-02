import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/atom-one-dark.css';
import { Copy, Check } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
}

const extractText = (node: any): string => {
  if (!node) return '';
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(extractText).join('');
  if (typeof node === 'object' && node.props && node.props.children) {
    return extractText(node.props.children);
  }
  return '';
};

const CodeBlock = ({ language, rawCode, children }: { language: string; rawCode: string; children: React.ReactNode }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(rawCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-3 rounded-xl overflow-hidden border border-slate-700/70 bg-slate-950/90 shadow-xl">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900/90 text-xs text-slate-400 border-b border-slate-800">
        <span className="font-mono text-slate-300 font-semibold tracking-wider uppercase">{language || 'code'}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 hover:text-white transition-colors py-1 px-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 font-medium text-xs"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied!' : 'Copy Code'}</span>
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-xs md:text-sm font-mono text-slate-200 leading-relaxed">
        <code>{children}</code>
      </pre>
    </div>
  );
};

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  return (
    <div className="prose dark:prose-invert max-w-none text-slate-900 dark:text-slate-100 text-sm md:text-base leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex, rehypeHighlight]}
        components={{
          code({ node, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            const rawCode = extractText(children);
            const isMultiLine = rawCode.includes('\n');
            const isBlock = match || isMultiLine;

            if (isBlock) {
              return (
                <CodeBlock language={match ? match[1] : ''} rawCode={rawCode}>
                  {children}
                </CodeBlock>
              );
            }
            return (
              <code
                className="bg-slate-200 dark:bg-slate-800 text-primary dark:text-blue-400 px-1.5 py-0.5 rounded text-xs md:text-sm font-mono font-semibold"
                {...props}
              >
                {children}
              </code>
            );
          },
          table({ children }) {
            return (
              <div className="overflow-x-auto my-4 rounded-xl border border-slate-300 dark:border-slate-700/80 shadow-sm">
                <table className="min-w-full divide-y divide-slate-300 dark:divide-slate-700 text-xs md:text-sm">
                  {children}
                </table>
              </div>
            );
          },
          th({ children }) {
            return <th className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800/90 font-bold text-left text-slate-800 dark:text-slate-200">{children}</th>;
          },
          td({ children }) {
            return <td className="px-4 py-2 border-t border-slate-200 dark:border-slate-800/60">{children}</td>;
          },
          blockquote({ children }) {
            return (
              <blockquote className="border-l-4 border-primary/70 pl-4 py-1.5 italic my-3 text-slate-600 dark:text-slate-400 bg-primary/5 rounded-r-lg">
                {children}
              </blockquote>
            );
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
