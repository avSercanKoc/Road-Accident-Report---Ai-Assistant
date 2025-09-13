import React from 'react';

interface Props {
  onStart: () => void;
}

const FeatureCard: React.FC<{ icon: React.ReactNode, title: string, children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="bg-zinc-800/50 p-6 rounded-lg border border-zinc-700 text-center">
        <div className="flex justify-center mb-4">{icon}</div>
        <h3 className="text-xl font-bold mb-2 text-zinc-100">{title}</h3>
        <p className="text-zinc-400">{children}</p>
    </div>
);

const StepCard: React.FC<{ number: string, title: string, children: React.ReactNode }> = ({ number, title, children }) => (
    <div className="text-center">
        <div className="mb-4 text-3xl font-bold text-blue-500">{number}</div>
        <h3 className="text-xl font-bold mb-2 text-zinc-100">{title}</h3>
        <p className="text-zinc-400">{children}</p>
    </div>
);

const UploadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
);
const AIVerifyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
);
const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

export const LandingPage: React.FC<Props> = ({ onStart }) => {
    return (
        <div className="min-h-screen bg-zinc-900 text-zinc-200 animate-fade-in">
            {/* Hero Section */}
            <section className="min-h-screen flex flex-col items-center justify-center text-center p-4">
                <div className="relative z-10">
                    <h1 className="text-5xl md:text-7xl font-bold text-zinc-100 mb-4">
                        Traffic Accident Reporting, Simplified.
                    </h1>
                    <p className="max-w-3xl mx-auto text-lg md:text-xl text-zinc-400 mb-8">
                        Capture the scene with your phone. Our AI builds the complete report from photos, videos, and voice statements—so you can move forward.
                    </p>
                    <button onClick={onStart} className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition-all transform hover:scale-105">
                        Start Your Report
                    </button>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="py-20 px-4 bg-black/20">
                <div className="max-w-5xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-12 text-zinc-100">A Clear Path Through a Stressful Event</h2>
                    <div className="grid md:grid-cols-3 gap-12">
                        <StepCard number="1" title="Capture & Upload">
                            Take photos of documents, the scene, and record a quick voice statement.
                        </StepCard>
                        <StepCard number="2" title="Verify & Edit">
                            Review the auto-filled draft, answer clarifying questions, and adjust the diagram.
                        </StepCard>
                        <StepCard number="3" title="Sign & Download">
                            Get a complete, signed evidence package with your report and all original files.
                        </StepCard>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 px-4">
                 <div className="max-w-6xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-zinc-100">Intelligent, Not Artificial.</h2>
                    <p className="text-lg text-zinc-400 mt-2 mb-12">This isn't just a form-filler. It's a comprehensive analysis tool.</p>
                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard icon={<UploadIcon />} title="Image Understanding">
                            Analyzes documents and scene photos to extract critical data like license plates and points of impact.
                        </FeatureCard>
                        <FeatureCard icon={<AIVerifyIcon />} title="Audio Intelligence">
                            Understands voice memos, transcribes statements, and cross-references them with visual evidence.
                        </FeatureCard>
                        <FeatureCard icon={<DownloadIcon />} title="Diagram Generation">
                            Generates a clean, editable diagram of the accident scene based on all available information.
                        </FeatureCard>
                    </div>
                 </div>
            </section>

            {/* Final CTA Section */}
            <section className="py-20 px-4 bg-black/20">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6 text-zinc-100">Get Back on the Road, Faster.</h2>
                    <button onClick={onStart} className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition-all transform hover:scale-105">
                        Create My Report
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 px-4 border-t border-zinc-800">
                <p className="text-center text-zinc-500">
                    A Google AI Studio Multimodal Challenge Submission.
                </p>
            </footer>
        </div>
    );
};
