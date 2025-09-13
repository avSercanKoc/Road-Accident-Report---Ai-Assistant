import { useState } from 'react';
import { AppStep, AppConfig, UploadedFile, ReportData, AIQuestion } from '../types';
import { INITIAL_REPORT_DATA } from '../constants';
import { processMediaWithAI, clarifyReportWithAI } from '../services/geminiService';
import { createEvidencePackage } from '../services/fileService';
import { AppStep as AppStepEnum } from '../types';

export const useAppLogic = () => {
    const [step, setStep] = useState<AppStep>(AppStepEnum.LandingPage);
    const [appConfig, setAppConfigState] = useState<AppConfig | null>(null);
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
    const [reportData, setReportData] = useState<ReportData | null>(null);
    const [aiQuestions, setAiQuestions] = useState<AIQuestion[]>([]);
    const [loadingMessage, setLoadingMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [blurryDocumentWarning, setBlurryDocumentWarning] = useState<string | null>(null);
    const [accidentLocation, setAccidentLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [isClarifyingWithAI, setIsClarifyingWithAI] = useState(false);

    const startApp = () => {
        setStep(AppStepEnum.SelectCountry);
    };

    const setAppConfig = (config: AppConfig) => {
        setAppConfigState(config);
        setStep(AppStepEnum.UploadMedia);
    };
    
    const processMedia = async () => {
        setErrorMessage(null);
        setBlurryDocumentWarning(null);

        if (uploadedFiles.length === 0) {
            setErrorMessage("Please upload at least one file before proceeding.");
            return;
        }
        
        setLoadingMessage('AI is analyzing data...');
        setStep(AppStepEnum.Processing);

        try {
            const { report, questions, diagram, sketch } = await processMediaWithAI(uploadedFiles, appConfig!, accidentLocation);
            
            const vehicleAFromAI = report.vehicles?.find(v => v.label === 'A');
            const vehicleBFromAI = report.vehicles?.find(v => v.label === 'B');
            const driverAFromAI = report.drivers?.find(d => d.vehicle === 'A');
            const driverBFromAI = report.drivers?.find(d => d.vehicle === 'B');
            const insuranceAFromAI = report.insurance?.find(i => i.vehicle === 'A');
            const insuranceBFromAI = report.insurance?.find(i => i.vehicle === 'B');

            const populatedReport = {
                ...INITIAL_REPORT_DATA,
                ...report,
                locale: appConfig!.locale,
                diagram: { svg: diagram, sketch_base64: sketch, notes: "AI generated" },
                vehicles: [
                    { ...INITIAL_REPORT_DATA.vehicles[0], ...vehicleAFromAI },
                    { ...INITIAL_REPORT_DATA.vehicles[1], ...vehicleBFromAI },
                ],
                drivers: [
                    { ...INITIAL_REPORT_DATA.drivers[0], ...driverAFromAI },
                    { ...INITIAL_REPORT_DATA.drivers[1], ...driverBFromAI },
                ],
                insurance: [
                    { ...INITIAL_REPORT_DATA.insurance[0], ...insuranceAFromAI },
                    { ...INITIAL_REPORT_DATA.insurance[1], ...insuranceBFromAI },
                ],
                 consent: INITIAL_REPORT_DATA.consent,
                 signatures: INITIAL_REPORT_DATA.signatures,
            };

            setReportData(populatedReport);
            
            const docQualityQuestion = questions.find(q => q.field === 'document_quality');
            if (docQualityQuestion) {
                setBlurryDocumentWarning(docQualityQuestion.question);
                setAiQuestions(questions.filter(q => q.field !== 'document_quality'));
            } else {
                setAiQuestions(questions);
                setStep(AppStepEnum.Verification);
            }

        } catch (error) {
            console.error("AI processing failed:", error);
            setErrorMessage((error as Error).message || 'An error occurred while processing data with the AI.');
            setStep(AppStepEnum.UploadMedia);
        } finally {
            setLoadingMessage(null);
        }
    };

    const proceedToVerification = () => {
        setBlurryDocumentWarning(null);
        setStep(AppStepEnum.Verification);
    };

    const returnToUploadStep = () => {
        setBlurryDocumentWarning(null);
        setStep(AppStepEnum.UploadMedia);
    };

    const goBackToUpload = () => {
        setStep(AppStepEnum.UploadMedia);
    };
    
    const handleAiChatResponse = async (userAnswer: string) => {
        if (!reportData || aiQuestions.length === 0) return;

        setErrorMessage(null);
        setIsClarifyingWithAI(true);
        try {
            const updatedReport = await clarifyReportWithAI(reportData, aiQuestions, userAnswer);
            // Merge updated data carefully, preserving signatures, consent, etc.
            setReportData(prevData => ({
                ...prevData!,
                ...updatedReport,
                // Ensure sensitive/local state is not overwritten
                signatures: prevData!.signatures,
                consent: prevData!.consent,
                diagram: prevData!.diagram, // Keep the user-edited diagram
            }));
            setAiQuestions([]); // Clear questions after they are answered
        } catch (error) {
            console.error("AI clarification failed:", error);
            setErrorMessage((error as Error).message || 'An error occurred while processing your answer with the AI.');
        } finally {
            setIsClarifyingWithAI(false);
        }
    };
    
    const generateAndDownloadReport = async () => {
        if (!reportData) return;
        setErrorMessage(null);
        setLoadingMessage('Creating evidence package...');
        try {
            await createEvidencePackage(reportData, uploadedFiles);
            setStep(AppStepEnum.ReportGenerated);
        } catch (error) {
            console.error("Failed to create evidence package:", error);
            setErrorMessage('An error occurred while creating the report package.');
        } finally {
             setLoadingMessage(null);
        }
    };

    return {
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
        startApp,
        setAppConfig,
        setUploadedFiles,
        processMedia,
        setReportData,
        generateAndDownloadReport,
        setErrorMessage,
        proceedToVerification,
        returnToUploadStep,
        goBackToUpload,
        handleAiChatResponse,
    };
};