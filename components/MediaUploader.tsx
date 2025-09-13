import React, { useState, useRef } from 'react';
import type { UploadedFile, AppConfig } from '../types';

// Icons for UI
const LocationIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
    </svg>
);

const UploadIcon = () => (
    <svg className="mx-auto h-12 w-12 text-zinc-500" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);


interface Props {
    uploadedFiles: UploadedFile[];
    setUploadedFiles: React.Dispatch<React.SetStateAction<UploadedFile[]>>;
    onSubmit: () => void;
    appConfig: AppConfig;
    accidentLocation: { lat: number; lng: number } | null;
    setAccidentLocation: React.Dispatch<React.SetStateAction<{ lat: number; lng: number } | null>>;
}

export const MediaUploader: React.FC<Props> = ({
    uploadedFiles,
    setUploadedFiles,
    onSubmit,
    appConfig,
    accidentLocation,
    setAccidentLocation,
}) => {
    const [isDragOver, setIsDragOver] = useState(false);
    const [isGettingLocation, setIsGettingLocation] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileProcessing = async (files: FileList | null) => {
        if (!files) return;

        const newFiles: UploadedFile[] = await Promise.all(
            Array.from(files).map(async (file) => {
                let type: 'document' | 'scene' | 'audio' = 'scene';
                if (file.type.startsWith('image/')) type = 'scene';
                else if (file.type.startsWith('video/')) type = 'scene';
                else if (file.type.startsWith('audio/')) type = 'audio';
                else type = 'document';
                
                return {
                    file,
                    type,
                    owner: type !== 'scene' ? 'A' : undefined,
                    previewUrl: URL.createObjectURL(file),
                };
            })
        );

        setUploadedFiles(prev => [...prev, ...newFiles]);
    };

    const onDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(true);
    };

    const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
    };

    const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
        handleFileProcessing(e.dataTransfer.files);
    };

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleFileProcessing(e.target.files);
    };

    const updateFile = (index: number, updates: Partial<UploadedFile>) => {
        setUploadedFiles(prev => {
            const newFiles = [...prev];
            newFiles[index] = { ...newFiles[index], ...updates };
            if (updates.type === 'scene' && newFiles[index].owner) {
                delete newFiles[index].owner;
            }
            if (updates.type !== 'scene' && !newFiles[index].owner) {
                newFiles[index].owner = 'A';
            }
            return newFiles;
        });
    };

    const removeFile = (index: number) => {
        setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            return;
        }

        setIsGettingLocation(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setAccidentLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                });
                setIsGettingLocation(false);
            },
            () => {
                alert("Unable to retrieve your location.");
                setIsGettingLocation(false);
            }
        );
    };

    const isSubmitDisabled = uploadedFiles.length === 0;

    return (
        <div className="w-full max-w-4xl mx-auto p-6 sm:p-8 bg-zinc-800/50 border border-zinc-700 rounded-2xl shadow-2xl animate-fade-in">
            <h2 className="text-3xl font-bold mb-2 text-center text-zinc-100">Upload Media</h2>
            <p className="text-zinc-400 mb-8 text-center">
                Provide photos, videos, documents (license, insurance), and audio statements.
            </p>

            <div
                onDragEnter={onDragEnter}
                onDragLeave={onDragLeave}
                onDragOver={onDragOver}
                onDrop={onDrop}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-300 ${isDragOver ? 'border-blue-500 bg-zinc-800' : 'border-zinc-600 bg-transparent'}`}
            >
                <UploadIcon />
                <p className="mt-4 text-zinc-300">Drag and drop files here</p>
                <p className="text-zinc-500 text-sm mt-1">or</p>
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-4 bg-zinc-700 hover:bg-zinc-600 text-blue-400 font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                    Browse Files
                </button>
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={onFileChange}
                    className="hidden"
                    accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
                />
            </div>

            {uploadedFiles.length > 0 && (
                <div className="mt-8">
                    <h3 className="text-xl font-bold text-zinc-200 mb-4">Uploaded Files</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {uploadedFiles.map((uploadedFile, index) => (
                           <FilePreviewCard 
                                key={index} 
                                uploadedFile={uploadedFile} 
                                index={index} 
                                updateFile={updateFile} 
                                removeFile={removeFile} 
                           />
                        ))}
                    </div>
                </div>
            )}
            
            <div className="mt-8 border-t border-zinc-700 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                 <button
                    onClick={handleGetLocation}
                    disabled={isGettingLocation}
                    className="w-full sm:w-auto flex items-center justify-center bg-zinc-700 hover:bg-zinc-600 text-blue-400 font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                >
                    <LocationIcon />
                    {isGettingLocation ? 'Getting Location...' : (accidentLocation ? 'Location Acquired!' : 'Use Current Location')}
                </button>

                <button
                    onClick={onSubmit}
                    disabled={isSubmitDisabled}
                    className="w-full sm:w-auto bg-blue-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg transform transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed enabled:hover:bg-blue-700 enabled:hover:scale-105"
                >
                    Start Analysis
                </button>
            </div>
             {isSubmitDisabled && <p className="text-xs text-orange-400/80 text-center mt-3">Please upload at least one file to continue.</p>}

        </div>
    );
};

const FilePreviewCard: React.FC<{
    uploadedFile: UploadedFile;
    index: number;
    updateFile: (index: number, updates: Partial<UploadedFile>) => void;
    removeFile: (index: number) => void;
}> = ({ uploadedFile, index, updateFile, removeFile }) => {
    const { file, type, owner, previewUrl } = uploadedFile;

    return (
        <div className="bg-zinc-700/50 p-3 rounded-lg flex flex-col border border-zinc-700">
            <div className="relative mb-2">
                {file.type.startsWith('image/') ? (
                    <img src={previewUrl} alt={file.name} className="w-full h-32 object-cover rounded-md" />
                ) : (
                    <div className="w-full h-32 flex items-center justify-center bg-zinc-800 rounded-md">
                        <span className="text-zinc-400 text-sm truncate px-2">{file.name}</span>
                    </div>
                )}
                <button
                    onClick={() => removeFile(index)}
                    className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 leading-none hover:bg-red-600"
                    aria-label="Remove file"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <div className="flex-grow space-y-2 text-sm">
                <select
                    value={type}
                    onChange={(e) => updateFile(index, { type: e.target.value as UploadedFile['type'] })}
                    className="w-full bg-zinc-800 border border-zinc-600 rounded p-1.5 text-zinc-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                    <option value="scene">Accident Scene</option>
                    <option value="document">Document</option>
                    <option value="audio">Audio Recording</option>
                </select>

                {type !== 'scene' && (
                    <select
                        value={owner || 'A'}
                        onChange={(e) => updateFile(index, { owner: e.target.value as 'A' | 'B' })}
                        className="w-full bg-zinc-800 border border-zinc-600 rounded p-1.5 text-zinc-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                        <option value="A">Belongs to Driver A</option>
                        <option value="B">Belongs to Driver B</option>
                    </select>
                )}
            </div>
        </div>
    );
};