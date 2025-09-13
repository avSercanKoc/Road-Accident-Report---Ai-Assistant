import React, { useRef, useEffect, useState } from 'react';

interface Props {
  title: string;
  onSave: (dataUrl: string) => void;
}

export const SignaturePad: React.FC<Props> = ({ title, onSave }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);

  const getContext = () => canvasRef.current?.getContext('2d');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      canvas.width = canvas.offsetWidth * ratio;
      canvas.height = canvas.offsetHeight * ratio;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(ratio, ratio);
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, []);

  const startDrawing = (event: React.MouseEvent | React.TouchEvent) => {
    const ctx = getContext();
    if (ctx) {
      const pos = getEventPosition(event);
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
      setIsDrawing(true);
      setHasDrawn(true);
    }
  };

  const draw = (event: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const ctx = getContext();
    if (ctx) {
        event.preventDefault(); // Prevents page scrolling on touch devices
        const pos = getEventPosition(event);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
    }
  };

  const stopDrawing = () => {
    const ctx = getContext();
    if(ctx){
      ctx.closePath();
      setIsDrawing(false);
    }
  };

  const getEventPosition = (event: React.MouseEvent | React.TouchEvent) => {
      const canvas = canvasRef.current!;
      const rect = canvas.getBoundingClientRect();
      if ('touches' in event.nativeEvent) {
          return {
              x: event.nativeEvent.touches[0].clientX - rect.left,
              y: event.nativeEvent.touches[0].clientY - rect.top
          }
      }
      return {
          x: event.nativeEvent.offsetX,
          y: event.nativeEvent.offsetY
      }
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = getContext();
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setSignatureDataUrl(null);
      setHasDrawn(false);
    }
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (canvas && hasDrawn) {
      const dataUrl = canvas.toDataURL('image/png');
      setSignatureDataUrl(dataUrl);
      onSave(dataUrl);
    }
  };

  if (signatureDataUrl) {
    return (
        <div className="text-center">
            <h4 className="text-lg font-semibold text-zinc-300 mb-2">{title}</h4>
            <img src={signatureDataUrl} alt={title} className="bg-zinc-100 rounded-md border-2 border-green-500 p-2" />
            <button onClick={() => { setSignatureDataUrl(null); setHasDrawn(false); }} className="mt-2 text-sm text-blue-400 hover:text-blue-300">Change</button>
        </div>
    );
  }

  return (
    <div>
        <h4 className="text-lg font-semibold text-zinc-300 mb-2">{title}</h4>
        <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="bg-zinc-700/70 border border-zinc-600 rounded-md cursor-crosshair w-full h-32"
        />
        <div className="flex justify-between mt-2">
            <button onClick={clearCanvas} className="text-sm bg-zinc-600 hover:bg-zinc-500 text-white py-1 px-3 rounded-md transition-colors">Clear</button>
            <button onClick={saveSignature} disabled={!hasDrawn} className="text-sm bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded-md transition-colors disabled:opacity-50">Done</button>
        </div>
    </div>
  );
};
