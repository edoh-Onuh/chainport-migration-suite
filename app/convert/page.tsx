'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Code, Download, Sparkles, Loader2, Check, AlertTriangle, Copy, CheckCircle } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

export default function ConvertPage() {
  const [solidityCode, setSolidityCode] = useState('');
  const [rustCode, setRustCode] = useState('');
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState('');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [copied, setCopied] = useState(false);
  const [conversionStats, setConversionStats] = useState<{
    functions: number;
    structs: number;
    events: number;
    complexity: string;
  } | null>(null);

  // Toast management
  const addToast = (message: string, type: Toast['type']) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const copyToClipboard = async () => {
    if (rustCode) {
      await navigator.clipboard.writeText(rustCode);
      setCopied(true);
      addToast('Code copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleConvert = async () => {
    if (!solidityCode.trim()) {
      setError('Please enter Solidity code to convert');
      addToast('Please enter Solidity code first', 'error');
      return;
    }

    setIsConverting(true);
    setError('');
    setRustCode('');
    addToast('Converting your code...', 'info');

    try {
      const response = await fetch('/api/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ solidityCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Conversion failed');
      }

      setRustCode(data.rustCode);
      setConversionStats(data.stats);
      addToast('Conversion successful! 🎉', 'success');
      
      // Track successful conversion in localStorage
      const totalMigrations = parseInt(localStorage.getItem('totalMigrations') || '0') + 1;
      const successfulMigrations = parseInt(localStorage.getItem('successfulMigrations') || '0') + 1;
      const contractsMigrated = parseInt(localStorage.getItem('contractsMigrated') || '0') + 1;
      
      localStorage.setItem('totalMigrations', totalMigrations.toString());
      localStorage.setItem('successfulMigrations', successfulMigrations.toString());
      localStorage.setItem('contractsMigrated', contractsMigrated.toString());
      
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to convert contract. Please try again.';
      setError(errorMessage);
      addToast(errorMessage, 'error');
      
      // Track failed conversion
      const totalMigrations = parseInt(localStorage.getItem('totalMigrations') || '0') + 1;
      localStorage.setItem('totalMigrations', totalMigrations.toString());
    } finally {
      setIsConverting(false);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([rustCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'contract.rs';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast('Code downloaded successfully!', 'success');
  };

  const sampleContract = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleVault {
    mapping(address => uint256) public balances;
    address public owner;
    
    event Deposit(address indexed user, uint256 amount);
    event Withdrawal(address indexed user, uint256 amount);
    
    constructor() {
        owner = msg.sender;
    }
    
    function deposit() public payable {
        require(msg.value > 0, "Must deposit something");
        balances[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value);
    }
    
    function withdraw(uint256 amount) public {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        balances[msg.sender] -= amount;
        payable(msg.sender).transfer(amount);
        emit Withdrawal(msg.sender, amount);
    }
    
    function getBalance() public view returns (uint256) {
        return balances[msg.sender];
    }
}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Header */}
      <header className="border-b border-yellow-600/30 backdrop-blur-sm bg-black/20 sticky top-0 z-50 safe-area-top">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link 
              href="/" 
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-all touch-manipulation min-h-[44px]"
              aria-label="Back to home"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Back to Home</span>
              <span className="sm:hidden">Back</span>
            </Link>
            <div className="flex items-center space-x-2">
              <Code className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" />
              <h1 className="text-base sm:text-xl font-bold text-white">Converter</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container-responsive py-6 sm:py-10 safe-area-bottom">
        {/* Info Banner */}
        <div className="mb-6 sm:mb-8 p-4 bg-yellow-600/20 border border-yellow-500/30 rounded-lg flex items-start gap-3 animate-fade-in">
          <Sparkles className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-white mb-1 text-sm sm:text-base">AI-Powered Conversion</h3>
            <p className="text-xs sm:text-sm text-gray-300">
              Our GPT-4 engine analyzes your Solidity contract and generates equivalent Rust/Anchor code with security best practices.
            </p>
          </div>
        </div>

        {/* Conversion Interface */}
        <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Input Side */}
          <div className="space-y-3 sm:space-y-4 animate-slide-up">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
              <h2 className="text-lg sm:text-2xl font-bold text-white flex items-center gap-2">
                <Code className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
                Solidity Contract
              </h2>
              <button
                onClick={() => setSolidityCode(sampleContract)}
                className="text-xs sm:text-sm px-3 sm:px-4 py-2 bg-yellow-600/20 hover:bg-yellow-600/30 active:bg-yellow-600/40 border border-yellow-500/30 text-yellow-300 rounded-lg transition-all touch-manipulation"
                aria-label="Load sample contract"
              >
                Load Sample
              </button>
            </div>
            <textarea
              value={solidityCode}
              onChange={(e) => setSolidityCode(e.target.value)}
              placeholder="Paste your Solidity contract here..."
              className="input-field h-[400px] sm:h-[500px] lg:h-[600px] resize-none"
              spellCheck={false}
              aria-label="Solidity code input"
            />
            <button
              onClick={handleConvert}
              disabled={isConverting || !solidityCode.trim()}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              aria-label="Convert Solidity to Rust"
            >
              {isConverting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Converting...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Convert to Rust/Anchor</span>
                </>
              )}
            </button>
          </div>

          {/* Output Side */}
          <div className="space-y-3 sm:space-y-4 animate-slide-up" style={{animationDelay: '0.1s'}}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
              <h2 className="text-lg sm:text-2xl font-bold text-white flex items-center gap-2">
                <Code className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
                Rust/Anchor Output
              </h2>
              {rustCode && (
                <div className="flex gap-2">
                  <button
                    onClick={copyToClipboard}
                    className="text-xs sm:text-sm px-3 sm:px-4 py-2 bg-amber-600/20 hover:bg-amber-600/30 active:bg-amber-600/40 border border-amber-500/30 text-amber-300 rounded-lg transition-all touch-manipulation flex items-center gap-2"
                    aria-label="Copy code"
                  >
                    {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy'}</span>
                  </button>
                  <button
                    onClick={handleDownload}
                    className="text-xs sm:text-sm px-3 sm:px-4 py-2 bg-amber-600/20 hover:bg-amber-600/30 active:bg-amber-600/40 border border-amber-500/30 text-amber-300 rounded-lg transition-all touch-manipulation flex items-center gap-2"
                    aria-label="Download code"
                  >
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">Download</span>
                  </button>
                </div>
              )}
            </div>

            {error && (
              <div className="p-4 bg-red-600/20 border border-red-500/30 rounded-lg flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-red-300 mb-1">Conversion Error</h4>
                  <p className="text-sm text-red-200">{error}</p>
                </div>
              </div>
            )}

            {rustCode ? (
              <div className="relative animate-scale-in">
                <SyntaxHighlighter
                  language="rust"
                  style={vscDarkPlus}
                  className="rounded-lg border border-yellow-700/30 max-h-[400px] sm:max-h-[500px] lg:max-h-[600px] overflow-auto"
                  customStyle={{
                    margin: 0,
                    padding: '1rem',
                    fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
                    background: 'rgba(17, 24, 39, 0.5)',
                  }}
                >
                  {rustCode}
                </SyntaxHighlighter>
              </div>
            ) : (
              <div className="h-[400px] sm:h-[500px] lg:h-[600px] flex items-center justify-center bg-gray-900/50 border border-yellow-700/30 rounded-lg">
                <div className="text-center text-gray-500 px-4">
                  <Code className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 opacity-30" />
                  <p className="text-sm sm:text-base">Converted Rust/Anchor code will appear here</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Conversion Stats */}
        {conversionStats && (
          <div className="card animate-scale-in">
            <h3 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Check className="w-5 h-5 text-green-400" />
              Conversion Complete
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              <div className="text-center sm:text-left">
                <div className="text-xl sm:text-2xl font-bold text-yellow-400">{conversionStats.functions}</div>
                <div className="text-xs sm:text-sm text-gray-400">Functions</div>
              </div>
              <div className="text-center sm:text-left">
                <div className="text-xl sm:text-2xl font-bold text-amber-400">{conversionStats.structs}</div>
                <div className="text-xs sm:text-sm text-gray-400">Structs</div>
              </div>
              <div className="text-center sm:text-left">
                <div className="text-xl sm:text-2xl font-bold text-pink-400">{conversionStats.events}</div>
                <div className="text-xs sm:text-sm text-gray-400">Events</div>
              </div>
              <div className="text-center sm:text-left">
                <div className="text-xl sm:text-2xl font-bold text-green-400">{conversionStats.complexity}</div>
                <div className="text-xs sm:text-sm text-gray-400">Complexity</div>
              </div>
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="mt-8 grid md:grid-cols-3 gap-4">
          <TipCard
            title="Best Practices"
            description="Our AI follows Anchor framework conventions and Solana security patterns."
          />
          <TipCard
            title="Manual Review"
            description="Always review and test converted code before deploying to production."
          />
          <TipCard
            title="Optimization"
            description="Converted code includes gas-to-compute optimizations for Solana's architecture."
          />
        </div>
      </main>

      {/* Toast Notifications */}
      <div className="fixed bottom-4 right-4 left-4 sm:left-auto z-50 space-y-2 safe-area-bottom">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`animate-slide-up px-4 sm:px-6 py-3 sm:py-4 rounded-lg shadow-2xl backdrop-blur-sm flex items-center gap-3 w-full sm:min-w-[300px] sm:max-w-[400px] sm:ml-auto ${
              toast.type === 'success' ? 'bg-green-900/90 border border-green-500/50' :
              toast.type === 'error' ? 'bg-red-900/90 border border-red-500/50' :
              'bg-blue-900/90 border border-blue-500/50'
            }`}
          >
            {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />}
            {toast.type === 'error' && <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />}
            {toast.type === 'info' && <Loader2 className="w-5 h-5 text-blue-400 flex-shrink-0 animate-spin" />}
            <span className="text-white text-xs sm:text-sm font-medium">{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TipCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="p-4 bg-yellow-900/20 backdrop-blur-sm border border-yellow-700/30 rounded-lg">
      <h4 className="font-semibold text-white mb-2">{title}</h4>
      <p className="text-sm text-gray-400">{description}</p>
    </div>
  );
}
