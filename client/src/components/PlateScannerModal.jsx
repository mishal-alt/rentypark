import { useEffect, useRef, useState } from 'react';
import { Camera, RotateCcw, Check, X } from 'lucide-react';
import { extractPlateCandidate } from '../utils/plate';

const STATUS = {
  STARTING: 'starting',
  LIVE: 'live',
  READING: 'reading',
  REVIEW: 'review',
  ERROR: 'error',
};

export default function PlateScannerModal({ title = 'Scan Number Plate', onCapture, onClose }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [status, setStatus] = useState(STATUS.STARTING);
  const [error, setError] = useState('');
  const [capturedImage, setCapturedImage] = useState(null);
  const [recognizedText, setRecognizedText] = useState('');

  useEffect(() => {
    startCamera();
    return stopCamera;
  }, []);

  async function startCamera() {
    setStatus(STATUS.STARTING);
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setStatus(STATUS.LIVE);
    } catch (err) {
      setError(
        err.name === 'NotAllowedError'
          ? 'Camera access was denied. Allow camera permission and try again, or type the plate manually.'
          : 'Could not access a camera on this device. You can type the plate manually instead.'
      );
      setStatus(STATUS.ERROR);
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }

  async function handleCapture() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setCapturedImage(dataUrl);
    setStatus(STATUS.READING);

    try {
      const Tesseract = await import('tesseract.js');
      const { data } = await Tesseract.recognize(dataUrl, 'eng');
      setRecognizedText(extractPlateCandidate(data.text));
      setStatus(STATUS.REVIEW);
    } catch {
      setError('Could not read the plate from that photo. Try again with better lighting, or type it manually.');
      setRecognizedText('');
      setStatus(STATUS.REVIEW);
    }
  }

  function handleRetake() {
    setCapturedImage(null);
    setRecognizedText('');
    setError('');
    setStatus(STATUS.LIVE);
  }

  function handleUsePlate() {
    if (!recognizedText.trim()) return;
    onCapture(recognizedText.trim());
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-lg xs:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            aria-label="Close scanner"
            className="flex h-9 w-9 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="relative mb-4 flex aspect-video items-center justify-center overflow-hidden rounded-lg bg-slate-900">
          {status === STATUS.ERROR ? (
            <p className="px-4 text-center text-sm text-slate-300">{error}</p>
          ) : capturedImage ? (
            <img src={capturedImage} alt="Captured plate" className="h-full w-full object-cover" />
          ) : (
            <>
              <video ref={videoRef} muted playsInline className="h-full w-full object-cover" />
              {status === STATUS.STARTING && <p className="absolute text-sm text-slate-300">Starting camera...</p>}
            </>
          )}
          {status === STATUS.READING && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <p className="text-sm font-medium text-white">Reading plate...</p>
            </div>
          )}
        </div>

        <canvas ref={canvasRef} className="hidden" />

        {status === STATUS.LIVE && (
          <button
            onClick={handleCapture}
            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-3 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <Camera className="h-4 w-4" />
            Capture Photo
          </button>
        )}

        {status === STATUS.REVIEW && (
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Detected plate (edit if needed)</label>
            <input
              autoFocus
              className="mb-3 min-h-11 w-full rounded-md border border-slate-300 px-3 text-base uppercase tracking-wide focus:border-blue-500 focus:outline-none"
              value={recognizedText}
              onChange={(e) => setRecognizedText(e.target.value)}
              placeholder="Type the plate if it wasn't read correctly"
            />
            {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
            <div className="flex gap-2">
              <button
                onClick={handleRetake}
                className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-md border border-slate-300 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <RotateCcw className="h-4 w-4" />
                Retake
              </button>
              <button
                onClick={handleUsePlate}
                disabled={!recognizedText.trim()}
                className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-md bg-blue-600 px-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                <Check className="h-4 w-4" />
                Use This Plate
              </button>
            </div>
          </div>
        )}

        {status === STATUS.ERROR && (
          <button
            onClick={startCamera}
            className="min-h-11 w-full rounded-md border border-slate-300 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}
