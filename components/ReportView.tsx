import React, { useState } from 'react';
import type { AppConfig, ReportData, AIQuestion, AppStep, VehicleData, DriverData, InsuranceData, WitnessData } from '../types';
import { DiagramEditor } from './DiagramEditor';
import { SignaturePad } from './SignaturePad';
import { AppStep as AppStepEnum } from '../types';
import { TURKISH_VIOLATIONS, UK_VIOLATIONS, CALIFORNIA_VIOLATIONS, NEW_YORK_VIOLATIONS } from '../constants';

interface Props {
  step: AppStep;
  reportData: ReportData | null;
  setReportData: React.Dispatch<React.SetStateAction<ReportData | null>>;
  aiQuestions: AIQuestion[];
  appConfig: AppConfig | null;
  onGenerateAndConfirm: () => void;
  onDownloadAgain: () => void;
  onAiChatResponse: (answer: string) => void;
  isClarifyingWithAI: boolean;
  onGoBackToUpload: () => void;
}

const Section: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-zinc-800/50 border border-zinc-700 p-6 rounded-lg mb-6">
        <h3 className="text-xl font-semibold text-zinc-100 border-b border-zinc-700 pb-3 mb-4">{title}</h3>
        {children}
    </div>
);

const InputField: React.FC<{ label: string; value: string | number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; type?: string; }> = ({ label, value, onChange, type = 'text' }) => (
    <div>
        <label className="block text-sm font-medium text-zinc-400 mb-1">{label}</label>
        <input type={type} value={value} onChange={onChange} className="w-full bg-zinc-700/50 border border-zinc-600 rounded-md py-2 px-3 text-zinc-200 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors" />
    </div>
);

const TextAreaField: React.FC<{ label: string; value: string; onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; rows?: number; }> = ({ label, value, onChange, rows = 3 }) => (
    <div>
        <label className="block text-sm font-medium text-zinc-400 mb-1">{label}</label>
        <textarea value={value} onChange={onChange} rows={rows} className="w-full bg-zinc-700/50 border border-zinc-600 rounded-md py-2 px-3 text-zinc-200 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors" />
    </div>
);

const ReportBody: React.FC<Omit<Props, 'step' | 'onGenerateAndConfirm' | 'onDownloadAgain'>> = ({ reportData, setReportData, aiQuestions, appConfig, onAiChatResponse, isClarifyingWithAI, onGoBackToUpload }) => {
    if (!reportData) return null;
    const [chatResponse, setChatResponse] = useState('');
    
    const violations = (() => {
        switch(appConfig?.locale) {
            case 'TR': return TURKISH_VIOLATIONS;
            case 'CA': return CALIFORNIA_VIOLATIONS;
            case 'NY': return NEW_YORK_VIOLATIONS;
            case 'UK':
            default: return UK_VIOLATIONS;
        }
    })();

    const handleSubmitChat = () => {
        if (!chatResponse.trim()) return;
        onAiChatResponse(chatResponse);
        setChatResponse('');
    };

    const handleUpdate = (path: string, value: any) => {
        setReportData(prevData => {
            if (!prevData) return null;
            
            const keys = path.split(/[.\[\]]+/).filter(Boolean);
            const newData = JSON.parse(JSON.stringify(prevData));
            
            let current = newData;
            for (let i = 0; i < keys.length - 1; i++) {
                const key = keys[i];
                if (current[key] === undefined) {
                    const nextKey = keys[i+1];
                    current[key] = isNaN(parseInt(nextKey, 10)) ? {} : [];
                }
                current = current[key];
            }
            
            const finalKey = keys[keys.length - 1];
            current[finalKey] = value;
            
            return newData;
        });
    };
    
    const handleViolationChange = (vehicleIndex: number, violationId: string) => {
        const vehicle = reportData.vehicles[vehicleIndex];
        const currentOffences = vehicle.alleged_offences || [];
        const isChecked = currentOffences.includes(violationId);

        const newOffences = isChecked
            ? currentOffences.filter(id => id !== violationId)
            : [...currentOffences, violationId];
        
        handleUpdate(`vehicles[${vehicleIndex}].alleged_offences`, newOffences);
    };

    const addWitness = () => {
        const newWitnesses = [...reportData.witnesses, { name: '', phone: '' }];
        handleUpdate('witnesses', newWitnesses);
    };

    const removeWitness = (index: number) => {
        const newWitnesses = reportData.witnesses.filter((_, i) => i !== index);
        handleUpdate('witnesses', newWitnesses);
    };

    const renderVehicleSection = (vehicle: VehicleData, index: number) => (
        <Section key={index} title={`Vehicle ${vehicle.label} Information`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField label="License Plate" value={vehicle.plate} onChange={e => handleUpdate(`vehicles[${index}].plate`, e.target.value)} />
                <InputField label="Make/Model" value={vehicle.make_model} onChange={e => handleUpdate(`vehicles[${index}].make_model`, e.target.value)} />
                <InputField label="Initial Point of Impact" value={vehicle.first_impact} onChange={e => handleUpdate(`vehicles[${index}].first_impact`, e.target.value)} />
                <InputField label="Maneuver" value={vehicle.manoeuvre} onChange={e => handleUpdate(`vehicles[${index}].manoeuvre`, e.target.value)} />
            </div>
        </Section>
    );

    const renderDriverSection = (driver: DriverData, index: number) => (
         <Section key={index} title={`Driver ${driver.vehicle} Information`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField label="Full Name" value={driver.name} onChange={e => handleUpdate(`drivers[${index}].name`, e.target.value)} />
                <InputField label="National ID No" value={driver.id_no} onChange={e => handleUpdate(`drivers[${index}].id_no`, e.target.value)} />
                <InputField label="License No" value={driver.licence_no} onChange={e => handleUpdate(`drivers[${index}].licence_no`, e.target.value)} />
                <InputField label="Phone" value={driver.phone} onChange={e => handleUpdate(`drivers[${index}].phone`, e.target.value)} />
                 <div className="md:col-span-2">
                    <TextAreaField label="Statement" value={driver.statement} onChange={e => handleUpdate(`drivers[${index}].statement`, e.target.value)} />
                </div>
            </div>
        </Section>
    );
    
    const renderInsuranceSection = (insurance: InsuranceData, index: number) => (
        <Section key={index} title={`Insurance ${insurance.vehicle} Information`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField label="Company" value={insurance.company} onChange={e => handleUpdate(`insurance[${index}].company`, e.target.value)} />
                <InputField label="Policy No" value={insurance.policy_no} onChange={e => handleUpdate(`insurance[${index}].policy_no`, e.target.value)} />
            </div>
        </Section>
    );
    
    return (
        <>
            {aiQuestions.length > 0 && (
                <Section title="AI Clarification">
                    <ul className="space-y-3 text-orange-300 list-disc list-inside">
                        {aiQuestions.map((q, i) => <li key={i}><span className="text-zinc-300">{q.question}</span></li>)}
                    </ul>
                     <div className="mt-4 pt-4 border-t border-zinc-700">
                        <TextAreaField 
                            label="Your Answer"
                            value={chatResponse}
                            onChange={(e) => setChatResponse(e.target.value)}
                            rows={3}
                        />
                         <div className="flex justify-between items-center mt-3">
                             <button
                                onClick={onGoBackToUpload}
                                className="text-sm bg-zinc-700 hover:bg-zinc-600 text-blue-400 font-semibold py-2 px-4 rounded-lg transition-colors"
                            >
                                ← Change/Add Files
                            </button>
                            <button
                                onClick={handleSubmitChat}
                                disabled={isClarifyingWithAI}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg disabled:opacity-50"
                            >
                                {isClarifyingWithAI ? 'Processing...' : "Send to AI"}
                            </button>
                         </div>
                    </div>
                </Section>
            )}
            
            <Section title="General Accident Information">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField label="Date and Time" value={reportData.accident.timestamp} onChange={e => handleUpdate('accident.timestamp', e.target.value)} type="datetime-local" />
                    <InputField label="Address" value={reportData.accident.geo.address} onChange={e => handleUpdate('accident.geo.address', e.target.value)} />
                    <InputField label="Weather Conditions" value={reportData.accident.weather} onChange={e => handleUpdate('accident.weather', e.target.value)} />
                    <InputField label="Light Conditions" value={reportData.accident.light} onChange={e => handleUpdate('accident.light', e.target.value)} />
                </div>
            </Section>
            
            {reportData.vehicles.map(renderVehicleSection)}
            {reportData.drivers.map(renderDriverSection)}
            {reportData.insurance.map(renderInsuranceSection)}

            <Section title="Witness Information">
                {reportData.witnesses.length > 0 ? (
                    <div className="space-y-4">
                        {reportData.witnesses.map((witness, index) => (
                            <div key={index} className="flex items-end gap-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow">
                                    <InputField
                                        label={`Witness ${index + 1} Name`}
                                        value={witness.name}
                                        onChange={e => handleUpdate(`witnesses[${index}].name`, e.target.value)}
                                    />
                                    <InputField
                                        label={`Witness ${index + 1} Phone`}
                                        value={witness.phone}
                                        onChange={e => handleUpdate(`witnesses[${index}].phone`, e.target.value)}
                                    />
                                </div>
                                <button
                                    onClick={() => removeWitness(index)}
                                    className="bg-zinc-700 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 font-bold p-2 h-10 w-10 flex-shrink-0 rounded-lg flex items-center justify-center transition-colors"
                                    aria-label={`Delete Witness ${index + 1}`}
                                >
                                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-zinc-500 italic">No witness information entered.</p>
                )}
                <button
                    onClick={addWitness}
                    className="mt-4 bg-zinc-700 hover:bg-zinc-600 text-blue-400 font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                    + Add Witness
                </button>
            </Section>

            <Section title="Alleged Violations">
                <p className="text-sm text-zinc-400 mb-4">Check any applicable violations for fault assessment purposes.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    {[0, 1].map(vehicleIndex => (
                        <div key={vehicleIndex}>
                            <h4 className="font-semibold text-zinc-200 mb-3">{`Driver ${reportData.vehicles[vehicleIndex].label}`}</h4>
                            <div className="space-y-2">
                                {violations.map(violation => (
                                    <label key={violation.id} className="flex items-center text-sm text-zinc-300 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="h-4 w-4 rounded bg-zinc-900 border-zinc-600 text-blue-500 focus:ring-blue-600 focus:ring-offset-zinc-800"
                                            checked={(reportData.vehicles[vehicleIndex].alleged_offences || []).includes(violation.id)}
                                            onChange={() => handleViolationChange(vehicleIndex, violation.id)}
                                        />
                                        <span className="ml-3">{violation.text}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </Section>

            <Section title="Accident Diagram">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    <div>
                         <h4 className="font-semibold text-zinc-200 text-center mb-2">AI Generated Sketch</h4>
                        {reportData.diagram.sketch_base64 ? (
                            <img 
                                src={`data:image/png;base64,${reportData.diagram.sketch_base64}`} 
                                alt="AI-generated sketch of the accident"
                                className="w-full rounded-md border border-zinc-600 bg-zinc-700/50"
                            />
                        ) : (
                             <div className="w-full aspect-square bg-zinc-700/50 rounded-md flex items-center justify-center text-zinc-500">
                                Sketch not available
                            </div>
                        )}
                    </div>
                     <div>
                        <h4 className="font-semibold text-zinc-200 text-center mb-2">Interactive Diagram</h4>
                        <DiagramEditor 
                            initialSvg={reportData.diagram.svg}
                            onUpdate={newSvg => handleUpdate('diagram.svg', newSvg)}
                        />
                    </div>
                </div>
            </Section>

            <Section title="Signatures">
                <p className="text-sm text-zinc-400 mb-4">The parties declare that they accept the accuracy of this report.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <SignaturePad title="Driver A Signature" onSave={dataUrl => handleUpdate('signatures.A', dataUrl)} />
                   <SignaturePad title="Driver B Signature" onSave={dataUrl => handleUpdate('signatures.B', dataUrl)} />
                </div>
            </Section>

            <Section title="Consent and Agreement">
                <p className="text-sm text-zinc-400 mb-4">
                    By confirming this report, you declare that all information provided is accurate and consent to its processing for the purpose of creating this accident report.
                </p>
                <div className="space-y-3">
                    <label className="flex items-center text-zinc-300 cursor-pointer">
                        <input
                            type="checkbox"
                            className="h-5 w-5 rounded bg-zinc-900 border-zinc-600 text-blue-500 focus:ring-blue-600 focus:ring-offset-zinc-800"
                            checked={reportData.consent.A}
                            onChange={e => handleUpdate('consent.A', e.target.checked)}
                        />
                        <span className="ml-3">I agree as Driver A.</span>
                    </label>
                    <label className="flex items-center text-zinc-300 cursor-pointer">
                        <input
                            type="checkbox"
                            className="h-5 w-5 rounded bg-zinc-900 border-zinc-600 text-blue-500 focus:ring-blue-600 focus:ring-offset-zinc-800"
                            checked={reportData.consent.B}
                            onChange={e => handleUpdate('consent.B', e.target.checked)}
                        />
                        <span className="ml-3">I agree as Driver B.</span>
                    </label>
                </div>
            </Section>
        </>
    );
};

export const ReportView: React.FC<Props> = ({ step, reportData, setReportData, aiQuestions, appConfig, onGenerateAndConfirm, onDownloadAgain, onAiChatResponse, isClarifyingWithAI, onGoBackToUpload }) => {
    if (!reportData) {
        return null;
    }
    
    const isConfirmationDisabled = !(reportData.signatures.A || reportData.signatures.B) || !reportData.consent.A || !reportData.consent.B;

    const propsForBody = { reportData, setReportData, aiQuestions, appConfig, onAiChatResponse, isClarifyingWithAI, onGoBackToUpload };

    return (
        <div className="animate-fade-in">
            <header className="mb-8">
                <h2 className="text-3xl font-bold text-center text-zinc-100">
                    {step === AppStepEnum.Verification ? 'Verify Report Draft' : 'Report Generated'}
                </h2>
                <p className="text-center text-zinc-400 mt-2">
                    {step === AppStepEnum.Verification 
                        ? 'Please check the AI-generated information, complete any missing fields, and sign below.' 
                        : 'Your accident report evidence package has been successfully created.'}
                </p>
            </header>

            {(['UK', 'CA', 'NY'].includes(appConfig?.locale || '')) && step === AppStepEnum.Verification && (
                <div className="bg-orange-500/10 border border-orange-500/30 text-orange-300 p-4 rounded-lg mb-8 text-center shadow-lg">
                    <h4 className="text-lg font-bold">Important Notice</h4>
                    <p className="mt-1">This is a private agreement and not an official police report.</p>
                </div>
            )}
            
            {step === AppStepEnum.Verification && (
                <div id="report-view-container">
                    <ReportBody {...propsForBody} />
                    
                    <div className="mt-8 text-center">
                        <button
                            onClick={onGenerateAndConfirm}
                            disabled={isConfirmationDisabled}
                            className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed enabled:hover:bg-blue-700 enabled:hover:scale-105"
                        >
                            Confirm and Generate Report
                        </button>
                        {isConfirmationDisabled && (
                             <p className="text-xs text-orange-400/80 text-center mt-3">
                                Please provide at least one signature and check both consent boxes to continue.
                            </p>
                        )}
                    </div>
                </div>
            )}

            {step === AppStepEnum.ReportGenerated && (
                <div className="text-center p-8 bg-zinc-800/50 border border-zinc-700 rounded-lg">
                    <div className="text-green-400 mx-auto mb-4 w-16 h-16 flex items-center justify-center rounded-full bg-green-500/10">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-zinc-100">Success!</h3>
                    <p className="text-zinc-400 mt-2 mb-6">Your report and all media files have been combined into a secure evidence package.</p>
                     <button
                        onClick={onDownloadAgain}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300"
                    >
                        Download Evidence Package (.zip)
                    </button>
                </div>
            )}
        </div>
    );
};