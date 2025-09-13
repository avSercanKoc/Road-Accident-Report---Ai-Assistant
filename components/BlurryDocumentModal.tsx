import React from 'react';

interface Props {
  message: string;
  onConfirm: () => void; // Continue Anyway
  onCancel: () => void;  // Re-upload
}

export const BlurryDocumentModal: React.FC<Props> = ({ message, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-zinc-900 bg-opacity-80 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-zinc-800 border border-orange-500/30 rounded-2xl shadow-2xl max-w-lg w-full p-8 text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-orange-500/10 mb-4">
          <svg className="h-6 w-6 text-orange-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-orange-300">Readability Warning</h3>
        <p className="mt-2 text-zinc-300">{message}</p>
        <div className="mt-8 flex flex-col sm:flex-row-reverse gap-4">
          <button
            onClick={onCancel}
            className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
          >
            Re-upload
          </button>
          <button
            onClick={onConfirm}
            className="w-full sm:w-auto bg-zinc-600 hover:bg-zinc-500 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            Continue Anyway
          </button>
        </div>
      </div>
    </div>
  );
};
