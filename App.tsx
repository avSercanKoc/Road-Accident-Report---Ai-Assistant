import React from 'react';
import { useAppLogic } from './hooks/useAppLogic';
import { AppStep } from './types';
import { CountrySelector } from './components/CountrySelector';
import { MediaUploader } from './components/MediaUploader';
import { Spinner } from './components/Spinner';
import { ReportView } from './components/ReportView';
import { BlurryDocumentModal } from './components/BlurryDocumentModal';
import { LandingPage } from './components/LandingPage';


const App: React.FC = () => {
    const {
        step,
        appConfig,
        uploadedFiles,
        reportData,
        aiQuestions,
        loadingMessage,
        errorMessage,
        blurryDocumentWarning,
        accidentLocation,
        isClarifyingWithAI,
        setAccidentLocation,
        setAppConfig,
        setUploadedFiles,
        processMedia,
        setReportData,
        generateAndDownloadReport,
        setErrorMessage,
        proceedToVerification,
        returnToUploadStep,
        startApp,
        handleAiChatResponse,
        goBackToUpload,
    } = useAppLogic();

    const renderStep = () => {
        switch (step) {
            case AppStep.LandingPage:
                return <LandingPage onStart={startApp} />;
            case AppStep.SelectCountry:
                return <CountrySelector onSelect={setAppConfig} />;
            case AppStep.UploadMedia:
                return (
                    <MediaUploader
                        uploadedFiles={uploadedFiles}
                        setUploadedFiles={setUploadedFiles}
                        onSubmit={processMedia}
                        appConfig={appConfig!}
                        accidentLocation={accidentLocation}
                        setAccidentLocation={setAccidentLocation}
                    />
                );
            case AppStep.Verification:
            case AppStep.ReportGenerated:
                return (
                    <ReportView
                        step={step}
                        reportData={reportData}
                        setReportData={setReportData}
                        aiQuestions={aiQuestions}
                        appConfig={appConfig}
                        onGenerateAndConfirm={generateAndDownloadReport}
                        onDownloadAgain={generateAndDownloadReport}
                        onAiChatResponse={handleAiChatResponse}
                        isClarifyingWithAI={isClarifyingWithAI}
                        onGoBackToUpload={goBackToUpload}
                    />
                );
            default:
                return null;
        }
    };
    
    const isModalVisible = loadingMessage || blurryDocumentWarning;

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 relative">
            <header className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                   <h1 className="text-xl font-semibold text-zinc-100">Road Accident Report - AI Assistant</h1>
                </div>
            </header>
            
            <main className={`w-full max-w-4xl transition-all duration-500 ${isModalVisible ? 'blur-sm brightness-50' : ''}`}>
                 {errorMessage && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-300 p-4 rounded-lg mb-8 text-center shadow-lg flex justify-between items-center">
                        <span>{errorMessage}</span>
                        <button onClick={() => setErrorMessage(null)} className="font-bold text-2xl leading-none">&times;</button>
                    </div>
                )}
                {renderStep()}
            </main>
            
            {loadingMessage && <Spinner message={loadingMessage} />}
            {blurryDocumentWarning && (
                <BlurryDocumentModal 
                    message={blurryDocumentWarning}
                    onConfirm={proceedToVerification}
                    onCancel={returnToUploadStep}
                />
            )}
        </div>
    );
};

export default App;