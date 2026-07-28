import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Code2, Copy, Check, Save, Maximize2, Minimize2 } from 'lucide-react';

export function PythonCodeModal({ isOpen, onClose, initialCode = '', scriptName = 'Скрипт Python', onSave }) {
  const [code, setCode] = useState(() => (initialCode || '').replace(/\t/g, '    '));
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const textareaRef = useRef(null);
  const preRef = useRef(null);
  const lineSidebarRef = useRef(null);

  useEffect(() => {
    setCode((initialCode || '').replace(/\t/g, '    '));
  }, [initialCode, isOpen]);

  if (!isOpen) return null;

  const lineCount = (code.match(/\n/g) || []).length + 1;
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    if (onSave) onSave(code);
    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const newCode = code.substring(0, start) + '    ' + code.substring(end);
      setCode(newCode);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 4;
        }
      }, 0);
    }
  };

  const handleContainerScroll = (e) => {
    if (lineSidebarRef.current) {
      lineSidebarRef.current.scrollTop = e.target.scrollTop;
    }
  };

  // Robust Single-Pass Python Highlighting Lexer (Strictly font-style: normal)
  const highlightPython = (src) => {
    if (!src) return '';

    const escapeHtml = (str) =>
      str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    const tokenRegex = /("""[\s\S]*?"""|'''[\s\S]*?'''|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|#.*|@\w+|\b\d+(?:\.\d+)?\b|\b[a-zA-Z_]\w*\b)/g;

    const keywords = new Set([
      'def', 'class', 'import', 'from', 'as', 'return', 'if', 'elif', 'else',
      'try', 'except', 'finally', 'for', 'while', 'in', 'is', 'not', 'and',
      'or', 'with', 'lambda', 'yield', 'raise', 'pass', 'break', 'continue',
      'global', 'assert'
    ]);

    const builtins = new Set([
      'True', 'False', 'None', 'self', 'print', 'len', 'int', 'float', 'str',
      'dict', 'list', 'set', 'tuple', 'open', 'range', 'isinstance', 'type',
      'sum', 'min', 'max', 'abs', 'all', 'any', 'enumerate', 'zip', 'map', 'filter'
    ]);

    let result = '';
    let lastIndex = 0;
    let match;

    while ((match = tokenRegex.exec(src)) !== null) {
      const textBefore = src.slice(lastIndex, match.index);
      result += escapeHtml(textBefore);

      const token = match[0];
      lastIndex = tokenRegex.lastIndex;

      if (token.startsWith('#')) {
        result += `<span style="color: #64748b; font-style: normal; font-weight: 400;">${escapeHtml(token)}</span>`;
      } else if (token.startsWith('"') || token.startsWith("'")) {
        result += `<span style="color: #a3e635; font-style: normal; font-weight: 400;">${escapeHtml(token)}</span>`;
      } else if (token.startsWith('@')) {
        result += `<span style="color: #f43f5e; font-style: normal; font-weight: 400;">${escapeHtml(token)}</span>`;
      } else if (keywords.has(token)) {
        result += `<span style="color: #38bdf8; font-style: normal; font-weight: 400;">${escapeHtml(token)}</span>`;
      } else if (builtins.has(token)) {
        result += `<span style="color: #c084fc; font-style: normal; font-weight: 400;">${escapeHtml(token)}</span>`;
      } else if (/^\d/.test(token)) {
        result += `<span style="color: #f97316; font-style: normal; font-weight: 400;">${escapeHtml(token)}</span>`;
      } else {
        result += escapeHtml(token);
      }
    }

    result += escapeHtml(src.slice(lastIndex));
    return result;
  };

  const sharedCodeStyles = {
    fontSize: '14px',
    lineHeight: '21px',
    fontWeight: '400',
    fontStyle: 'normal',
    tabSize: 4,
    letterSpacing: '0px',
    wordSpacing: '0px',
    whiteSpace: 'pre',
    wordBreak: 'normal',
    overflowWrap: 'normal',
    boxSizing: 'border-box',
    padding: '16px 20px',
    margin: 0,
    border: 'none',
    width: '100%',
    height: '100%',
    gridArea: '1 / 1 / 2 / 2',
    fontVariantLigatures: 'none',
    fontFeatureSettings: '"liga" 0',
    textRendering: 'geometricPrecision',
    WebkitFontSmoothing: 'antialiased',
    MozOsxFontSmoothing: 'grayscale',
  };

  return createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.78)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: isFullscreen ? '0' : '24px',
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: isFullscreen ? '100vw' : '90vw',
          height: isFullscreen ? '100vh' : '88vh',
          maxWidth: isFullscreen ? '100vw' : '1360px',
          borderRadius: isFullscreen ? '0' : '16px',
          border: '1px solid rgba(245, 158, 11, 0.4)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.85)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          background: '#0f172a',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '14px 20px',
            background: 'rgba(15, 23, 42, 0.95)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
                  {scriptName}
                </span>
                <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '12px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', fontWeight: 600 }}>
                  Python 3.x
                </span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Рядків: {lineCount} | Символів: {code.length}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button onClick={handleCopy} className="btn-secondary" style={{ fontSize: '0.78rem', padding: '6px 12px' }} title="Копіювати код">
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Скопійовано' : 'Копіювати'}
            </button>

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="btn-icon"
              title={isFullscreen ? 'Згорнути' : 'На весь екран'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4 text-slate-300" /> : <Maximize2 className="w-4 h-4 text-slate-300" />}
            </button>

            <button onClick={onClose} className="btn-icon" title="Закрити">
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Code Editor Body */}
        <div style={{ flex: 1, display: 'flex', position: 'relative', overflow: 'hidden', background: '#090d16' }}>
          {/* Line Numbers Sidebar */}
          <div
            ref={lineSidebarRef}
            className="python-code-editor-layer"
            style={{
              width: '56px',
              padding: '16px 8px 16px 0',
              background: '#0c121e',
              borderRight: '1px solid rgba(255, 255, 255, 0.06)',
              textAlign: 'right',
              userSelect: 'none',
              color: '#475569',
              overflow: 'hidden',
            }}
          >
            {lineNumbers.map((n) => (
              <div key={n}>{n}</div>
            ))}
          </div>

          {/* Scrollable Grid Container with explicit minmax sizing */}
          <div
            style={{
              flex: 1,
              display: 'grid',
              gridTemplateColumns: 'minmax(100%, max-content)',
              gridTemplateRows: 'minmax(100%, max-content)',
              overflow: 'auto',
              position: 'relative',
              background: '#090d16',
            }}
            onScroll={handleContainerScroll}
          >
            {/* Syntax Highlighted View Layer */}
            <pre
              ref={preRef}
              className="python-code-editor-layer"
              style={{
                ...sharedCodeStyles,
                color: '#f8fafc',
                pointerEvents: 'none',
                background: 'transparent',
                overflow: 'visible',
              }}
              dangerouslySetInnerHTML={{ __html: highlightPython(code) + (code.endsWith('\n') ? ' ' : '') }}
            />

            {/* Editable Textarea Layer */}
            <textarea
              ref={textareaRef}
              className="python-code-editor-layer"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\t/g, '    '))}
              onKeyDown={handleKeyDown}
              spellCheck="false"
              autoFocus
              style={{
                ...sharedCodeStyles,
                color: 'transparent',
                caretColor: '#38bdf8',
                background: 'transparent',
                outline: 'none',
                resize: 'none',
                overflow: 'hidden',
              }}
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '12px 20px',
            background: 'rgba(15, 23, 42, 0.95)',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
            💡 Повнофункціональний редактор з підсвіткою синтаксису Python 3.x. Підтримується клавіша Tab для відступів.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button onClick={onClose} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.82rem' }}>
              Скасувати
            </button>
            <button
              onClick={handleSave}
              className="btn-primary"
              style={{
                padding: '8px 20px',
                fontSize: '0.82rem',
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              }}
            >
              <Save className="w-4 h-4" />
              Зберегти та оновити скрипт
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
