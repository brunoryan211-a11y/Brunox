import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Book } from '../types';
import { lookupBookByISBN, BookLookupResult } from '../utils/isbnLookup';
import { formatDateBR, getBorrowedSinceLabel, getDueStatus } from '../utils/dateUtils';
import {
  X,
  ScanBarcode,
  Camera,
  Keyboard,
  Upload,
  CheckCircle2,
  Clock,
  User,
  GraduationCap,
  Plus,
  BookOpen,
  RotateCcw,
  Sparkles,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  books: Book[];
  onOpenLoan: (book: Book) => void;
  onReturnBook: (book: Book) => void;
  onRenewLoan: (book: Book) => void;
  onRegisterNewBookWithDetails: (prefilled: Partial<Book>) => void;
  onViewDetails: (book: Book) => void;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  books,
  onOpenLoan,
  onReturnBook,
  onRenewLoan,
  onRegisterNewBookWithDetails,
  onViewDetails,
}) => {
  const [activeTab, setActiveTab] = useState<'camera' | 'manual' | 'upload'>('manual');
  const [manualCode, setManualCode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [cameras, setCameras] = useState<{ id: string; label: string }[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');

  // Result state
  const [scannedCode, setScannedCode] = useState<string>('');
  const [matchedBook, setMatchedBook] = useState<Book | null>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [onlineLookupResult, setOnlineLookupResult] = useState<BookLookupResult | null>(null);

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = 'qr-reader-container';

  // Reset state on open/close
  useEffect(() => {
    if (isOpen) {
      setScannedCode('');
      setMatchedBook(null);
      setOnlineLookupResult(null);
      setCameraError('');
      setManualCode('');

      // Check available cameras
      Html5Qrcode.getCameras()
        .then((devices) => {
          if (devices && devices.length > 0) {
            setCameras(devices);
            // Default to back camera on mobile or first camera
            const backCam = devices.find(
              (d) =>
                d.label.toLowerCase().includes('back') ||
                d.label.toLowerCase().includes('traseira') ||
                d.label.toLowerCase().includes('environment')
            );
            setSelectedCameraId(backCam ? backCam.id : devices[0].id);
          }
        })
        .catch(() => {
          // Camera access might be restricted or absent
        });
    } else {
      stopCameraScanner();
    }

    return () => {
      stopCameraScanner();
    };
  }, [isOpen]);

  const stopCameraScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
        await html5QrCodeRef.current.clear();
      } catch (err) {
        console.warn('Erro ao parar scanner:', err);
      } finally {
        html5QrCodeRef.current = null;
        setIsScanning(false);
      }
    }
  };

  const startCameraScanner = async () => {
    setCameraError('');
    await stopCameraScanner();

    try {
      const qrScanner = new Html5Qrcode(scannerContainerId);
      html5QrCodeRef.current = qrScanner;

      const cameraIdOrConfig = selectedCameraId
        ? { deviceId: { exact: selectedCameraId } }
        : { facingMode: 'environment' };

      await qrScanner.start(
        cameraIdOrConfig,
        {
          fps: 10,
          qrbox: { width: 260, height: 160 },
          aspectRatio: 1.5,
        },
        (decodedText) => {
          handleCodeIdentified(decodedText);
          stopCameraScanner();
        },
        () => {
          // Frame scan error - ignore to prevent log spam
        }
      );
      setIsScanning(true);
    } catch (err: any) {
      console.error('Erro ao iniciar câmera:', err);
      setCameraError(
        'Não foi possível acessar a câmera. Certifique-se de conceder permissão ou utilize a digitação manual de código de barras.'
      );
      setIsScanning(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    try {
      const qrScanner = new Html5Qrcode('qr-temp-file-scanner');
      const result = await qrScanner.scanFile(file, true);
      handleCodeIdentified(result);
    } catch (err) {
      setCameraError('Nenhum código de barras ou QR Code foi detectado nesta imagem.');
    }
  };

  const handleCodeIdentified = async (code: string) => {
    const trimmed = code.trim();
    if (!trimmed) return;

    setScannedCode(trimmed);
    setCameraError('');

    // 1. Search in local database (match by ISBN or by Book Code)
    const normalizedInput = trimmed.toUpperCase();
    const existing = books.find(
      (b) =>
        (b.isbn && b.isbn.replace(/[^0-9X]/gi, '') === trimmed.replace(/[^0-9X]/gi, '')) ||
        b.code.toUpperCase() === normalizedInput
    );

    if (existing) {
      setMatchedBook(existing);
      setOnlineLookupResult(null);
    } else {
      setMatchedBook(null);
      // 2. Not in database: try online ISBN lookup
      setIsLookingUp(true);
      try {
        const lookup = await lookupBookByISBN(trimmed);
        setOnlineLookupResult(lookup);
      } catch (err) {
        setOnlineLookupResult({ isbn: trimmed, found: false });
      } finally {
        setIsLookingUp(false);
      }
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      handleCodeIdentified(manualCode.trim());
    }
  };

  if (!isOpen) return null;

  const isBorrowed = matchedBook?.isBorrowed && !!matchedBook.currentLoan;
  const currentLoan = matchedBook?.currentLoan;
  const dueStatus = currentLoan ? getDueStatus(currentLoan.dueDate) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-stone-200 shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="bg-stone-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-600 flex items-center justify-center text-white">
              <ScanBarcode className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold font-serif">Leitor de Código de Barras / ISBN</h2>
              <p className="text-xs text-stone-300">
                Escanear livro para busca, empréstimo, devolução ou cadastro
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopCameraScanner();
              onClose();
            }}
            className="text-stone-400 hover:text-white p-1 rounded-md transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scan Method Switcher */}
        <div className="bg-stone-100 p-2 border-b border-stone-200 flex items-center gap-1">
          <button
            onClick={() => {
              stopCameraScanner();
              setActiveTab('manual');
            }}
            className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'manual'
                ? 'bg-white text-stone-900 shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Keyboard className="w-3.5 h-3.5" />
            <span>Digitar / Leitor USB</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('camera');
              startCameraScanner();
            }}
            className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'camera'
                ? 'bg-white text-stone-900 shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Câmera ao Vivo</span>
          </button>

          <button
            onClick={() => {
              stopCameraScanner();
              setActiveTab('upload');
            }}
            className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'upload'
                ? 'bg-white text-stone-900 shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Foto / Arquivo</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* CAMERA TAB */}
          {activeTab === 'camera' && (
            <div className="space-y-3">
              <div className="relative rounded-xl overflow-hidden bg-stone-950 border border-stone-800 min-h-[220px] flex items-center justify-center">
                <div id={scannerContainerId} className="w-full" />

                {!isScanning && !cameraError && (
                  <div className="text-center p-6 text-stone-400">
                    <Camera className="w-8 h-8 mx-auto mb-2 text-stone-500" />
                    <p className="text-xs">Iniciando câmera para leitura...</p>
                  </div>
                )}
              </div>

              {cameraError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">{cameraError}</span>
                    <p className="mt-1 text-[11px] text-rose-700">
                      Você pode usar a aba <strong>"Digitar / Leitor USB"</strong> para inserir o código ou leitor físico.
                    </p>
                  </div>
                </div>
              )}

              {/* Camera selection dropdown if multiple cameras */}
              {cameras.length > 1 && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-stone-500">Selecionar câmera:</span>
                  <select
                    value={selectedCameraId}
                    onChange={(e) => {
                      setSelectedCameraId(e.target.value);
                      startCameraScanner();
                    }}
                    className="p-1.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-700 focus:outline-none"
                  >
                    {cameras.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label || `Câmera ${c.id}`}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {/* MANUAL / SCANNER GUN TAB */}
          {activeTab === 'manual' && (
            <form onSubmit={handleManualSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                  Código de Barras, ISBN ou Tombo
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <ScanBarcode className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      autoFocus
                      value={manualCode}
                      onChange={(e) => setManualCode(e.target.value)}
                      placeholder="Ex: 9788535902778 ou LIV-0101"
                      className="w-full pl-9 pr-3 py-2 text-sm font-mono bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-800/30 focus:border-amber-800"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-bold bg-amber-800 hover:bg-amber-900 text-white rounded-lg shadow-2xs transition-colors cursor-pointer"
                  >
                    Buscar
                  </button>
                </div>
                <p className="text-[11px] text-stone-500 mt-1.5">
                  💡 <em>Dica:</em> Leitores de código de barras USB também funcionam automaticamente aqui.
                </p>
              </div>

              {/* Quick test buttons */}
              <div className="pt-2 border-t border-stone-100">
                <span className="text-[11px] font-semibold text-stone-400 block mb-1.5">
                  Testar com exemplares existentes ou novo ISBN:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setManualCode('9788535902778');
                      handleCodeIdentified('9788535902778');
                    }}
                    className="px-2 py-1 text-[11px] bg-stone-100 hover:bg-stone-200 text-stone-700 rounded cursor-pointer"
                  >
                    ISBN Dom Casmurro
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setManualCode('9788522005239');
                      handleCodeIdentified('9788522005239');
                    }}
                    className="px-2 py-1 text-[11px] bg-stone-100 hover:bg-stone-200 text-stone-700 rounded cursor-pointer"
                  >
                    ISBN O Pequeno Príncipe
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setManualCode('LIV-0103');
                      handleCodeIdentified('LIV-0103');
                    }}
                    className="px-2 py-1 text-[11px] bg-stone-100 hover:bg-stone-200 text-stone-700 rounded cursor-pointer"
                  >
                    Tombo LIV-0103
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setManualCode('9788532530783');
                      handleCodeIdentified('9788532530783');
                    }}
                    className="px-2 py-1 text-[11px] bg-amber-100/70 hover:bg-amber-200 text-amber-900 font-semibold rounded cursor-pointer"
                  >
                    Novo ISBN (Buscar Online)
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* UPLOAD FILE TAB */}
          {activeTab === 'upload' && (
            <div className="space-y-3">
              <label className="border-2 border-dashed border-stone-300 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-stone-50/70 transition-colors">
                <Upload className="w-8 h-8 text-stone-400 mb-2" />
                <span className="text-xs font-semibold text-stone-700">
                  Clique para selecionar uma foto com código de barras
                </span>
                <span className="text-[11px] text-stone-400 mt-1">PNG, JPG ou WEBP</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              <div id="qr-temp-file-scanner" className="hidden" />
            </div>
          )}

          {/* LOOKING UP ONLINE SPINNER */}
          {isLookingUp && (
            <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/80 flex items-center gap-3 text-xs text-amber-900">
              <div className="w-4 h-4 border-2 border-amber-800 border-t-transparent rounded-full animate-spin shrink-0" />
              <span>Buscando informações do ISBN nas bases do Google Books e BrasilAPI...</span>
            </div>
          )}

          {/* SCANNED RESULT: FOUND IN LIBRARY DATABASE */}
          {matchedBook && (
            <div className="rounded-xl border border-stone-200 overflow-hidden bg-white shadow-xs animate-in fade-in duration-200">
              <div className="p-3 bg-stone-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold">Livro Encontrado no Acervo!</span>
                </div>
                <span className="font-mono text-xs text-amber-300 font-bold">
                  {matchedBook.code}
                </span>
              </div>

              <div className="p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div
                    className="w-3.5 h-12 rounded-xs shrink-0"
                    style={{ backgroundColor: matchedBook.coverColor || '#1e3a5f' }}
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-serif font-bold text-stone-900 text-base leading-snug">
                      {matchedBook.title}
                    </h3>
                    <p className="text-xs text-stone-600 mt-0.5">
                      {matchedBook.author} · {matchedBook.genre}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-stone-500 mt-1 font-mono">
                      <span>ISBN: {matchedBook.isbn || 'Não cadastrado'}</span>
                      <span>·</span>
                      <span>{matchedBook.location}</span>
                    </div>
                  </div>
                </div>

                {/* Status Box */}
                {isBorrowed && currentLoan ? (
                  <div
                    className={`p-3 rounded-lg border text-xs ${
                      dueStatus?.isOverdue
                        ? 'bg-rose-50 border-rose-200'
                        : 'bg-amber-50 border-amber-200'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-stone-800 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Este livro está EMPRESTADO no momento</span>
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded ${
                          dueStatus?.isOverdue
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {dueStatus?.label}
                      </span>
                    </div>

                    <div className="mt-2 grid grid-cols-2 gap-2 text-stone-700 text-[11px]">
                      <div>
                        <span className="text-stone-400 block text-[10px]">Quem pegou:</span>
                        <strong className="text-stone-900">{currentLoan.studentName}</strong> (
                        {currentLoan.studentClass})
                      </div>
                      <div>
                        <span className="text-stone-400 block text-[10px]">Prazo:</span>
                        <strong>{formatDateBR(currentLoan.dueDate)}</strong>
                      </div>
                    </div>

                    {/* Quick actions for borrowed book */}
                    <div className="mt-3 pt-2.5 border-t border-stone-200/60 flex items-center gap-2">
                      <button
                        onClick={() => {
                          onReturnBook(matchedBook);
                          onClose();
                        }}
                        className="flex-1 py-1.5 px-3 text-xs font-bold rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer shadow-2xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 inline mr-1" />
                        Registrar Devolução Agora
                      </button>
                      <button
                        onClick={() => {
                          onRenewLoan(matchedBook);
                        }}
                        className="py-1.5 px-3 text-xs font-medium rounded-lg bg-white border border-stone-300 hover:bg-stone-50 text-stone-700 cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3 inline mr-1" />
                        +7 dias
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
                    <div>
                      <span className="font-bold block">🟢 Disponível na Biblioteca</span>
                      <span className="text-[11px] text-emerald-700">
                        Pronto para novo empréstimo
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        onClose();
                        onOpenLoan(matchedBook);
                      }}
                      className="py-1.5 px-3.5 text-xs font-bold rounded-lg bg-amber-800 hover:bg-amber-900 text-white cursor-pointer shadow-2xs"
                    >
                      <BookOpen className="w-3.5 h-3.5 inline mr-1" />
                      Emprestar Livro
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SCANNED RESULT: NOT IN DATABASE */}
          {scannedCode && !matchedBook && !isLookingUp && (
            <div className="rounded-xl border border-stone-200 overflow-hidden bg-white shadow-xs p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                  <ScanBarcode className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-stone-900">
                    Livro não encontrado no acervo da biblioteca
                  </h4>
                  <p className="text-xs text-stone-500 font-mono mt-0.5">
                    Código lido: <strong>{scannedCode}</strong>
                  </p>
                </div>
              </div>

              {/* Online lookup success */}
              {onlineLookupResult?.found ? (
                <div className="p-3.5 rounded-lg bg-emerald-50/80 border border-emerald-200 text-xs space-y-2">
                  <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>Dados encontrados automaticamente via ISBN!</span>
                  </div>
                  <div>
                    <strong className="text-stone-900 text-sm block">
                      {onlineLookupResult.title}
                    </strong>
                    <span className="text-stone-600">
                      Autor: {onlineLookupResult.author || 'Não especificado'} ·{' '}
                      {onlineLookupResult.genre}
                    </span>
                  </div>
                  {onlineLookupResult.notes && (
                    <p className="text-[11px] text-stone-500 italic">
                      "{onlineLookupResult.notes}"
                    </p>
                  )}
                  <button
                    onClick={() => {
                      onClose();
                      onRegisterNewBookWithDetails({
                        isbn: scannedCode,
                        title: onlineLookupResult.title,
                        author: onlineLookupResult.author,
                        genre: onlineLookupResult.genre,
                        notes: onlineLookupResult.notes,
                      });
                    }}
                    className="w-full mt-2 py-2 px-3 text-xs font-bold rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer transition-colors shadow-2xs flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Cadastrar com Dados Preenchidos Automaticamente</span>
                  </button>
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-stone-50 border border-stone-200 text-xs text-stone-600">
                  <p>
                    Deseja cadastrar este novo exemplar no sistema? O código/ISBN será preenchido
                    automaticamente e você poderá informar os detalhes manualmente.
                  </p>
                  <button
                    onClick={() => {
                      onClose();
                      onRegisterNewBookWithDetails({
                        isbn: scannedCode,
                        code: `LIV-${String(books.length + 101).padStart(4, '0')}`,
                      });
                    }}
                    className="mt-2.5 w-full py-2 px-3 text-xs font-bold rounded-lg bg-amber-800 hover:bg-amber-900 text-white cursor-pointer transition-colors shadow-2xs flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Cadastrar Exemplar Manualmente</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
          <span className="text-[11px] text-stone-400">
            Suporta ISBN-13, EAN-13, Code-128 e Tombos Escolares
          </span>
          <button
            onClick={() => {
              stopCameraScanner();
              onClose();
            }}
            className="px-4 py-1.5 text-xs font-semibold bg-stone-900 text-white hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
