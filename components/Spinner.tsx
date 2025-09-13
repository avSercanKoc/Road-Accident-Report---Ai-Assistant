import React from 'react';

interface Props {
  message: string;
}

export const Spinner: React.FC<Props> = ({ message }) => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-zinc-900 bg-opacity-80 z-50">
      <div className="w-16 h-16 border-4 border-blue-500 border-solid border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-lg text-zinc-200 font-semibold">{message}</p>
    </div>
  );
};
