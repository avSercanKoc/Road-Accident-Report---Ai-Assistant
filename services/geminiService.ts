import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { UploadedFile, AppConfig, ReportData, AIQuestion, reportDataSchema } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

// Helper to convert File to a Gemini-compatible format
const fileToGenerativePart = async (file: File) => {
    const base64EncodedData = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });

    return {
        inlineData: {
            mimeType: file.type,
            data: base64EncodedData,
        },
    };
};

// Helper to build the detailed prompt for the AI
const buildPrompt = (filesByType: Record<string, UploadedFile[]>, config: AppConfig, location?: {lat: number, lng: number} | null) => {
    let prompt = `
        CONTEXT:
        - Country Profile: ${config.locale}
        - Language for response: ${config.language}
        - You are an AI assistant processing an accident report. Your goal is to extract information from the provided media and fill a JSON object.
        - Be accurate. If you cannot find information, leave the field blank in the JSON. Do not guess.
        - If you find conflicting information (e.g., photo shows rear damage, but audio says front), create a question about it.
        - **Crucial**: If a document image (license, registration, policy) is blurry, dark, or unreadable, create a question with the field set to 'document_quality' and explain the issue in the question.

        MEDIA INPUTS:
    `;

    if (filesByType['document_A']?.length > 0) {
        prompt += `\n- Driver A Documents (Extract details for Vehicle A/Driver A from these): ${filesByType['document_A'].map(f => f.file.name).join(', ')}`;
    }
    if (filesByType['document_B']?.length > 0) {
        prompt += `\n- Driver B Documents (Extract details for Vehicle B/Driver B from these): ${filesByType['document_B'].map(f => f.file.name).join(', ')}`;
    }
    if (filesByType['scene']?.length > 0) {
        prompt += `\n- Accident Scene Photos/Videos (Use for impact points, location, weather, light conditions): ${filesByType['scene'].map(f => f.file.name).join(', ')}`;
    }
     if (filesByType['audio_A']?.length > 0) {
        prompt += `\n- Driver A Audio Statement (Transcribe and use for statement and manoeuvre): ${filesByType['audio_A'].map(f => f.file.name).join(', ')}`;
    }
     if (filesByType['audio_B']?.length > 0) {
        prompt += `\n- Driver B Audio Statement (Transcribe and use for statement and manoeuvre): ${filesByType['audio_B'].map(f => f.file.name).join(', ')}`;
    }
    if(location) {
        prompt += `\n- USER'S CURRENT LOCATION (Use to determine 'accident.geo.address'): Latitude: ${location.lat}, Longitude: ${location.lng}`;
    }

    prompt += `
        \nTASK:
        Populate the provided JSON schema with data extracted from the media. Return ONLY the valid JSON object.
    `;
    return prompt;
};

// Main function to process media with AI
export const processMediaWithAI = async (
    files: UploadedFile[],
    config: AppConfig,
    location: { lat: number; lng: number } | null
): Promise<{ report: Partial<ReportData>; questions: AIQuestion[]; diagram: string; sketch: string; }> => {
    try {
        // 1. Convert all files to generative parts
        const fileParts = await Promise.all(files.map(f => fileToGenerativePart(f.file)));

        // 2. Group files by type and owner for the prompt
        const filesByType: Record<string, UploadedFile[]> = files.reduce((acc, file) => {
            const key = file.type === 'document' || file.type === 'audio' ? `${file.type}_${file.owner}` : file.type;
            if (!acc[key]) acc[key] = [];
            acc[key].push(file);
            return acc;
        }, {} as Record<string, UploadedFile[]>);

        // 3. Build the prompt
        const textPrompt = buildPrompt(filesByType, config, location);
        
        // 4. Make the first AI call to extract data
        const extractionResult = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [{ text: textPrompt }, ...fileParts] },
            config: {
                responseMimeType: "application/json",
                responseSchema: reportDataSchema,
            }
        });

        const responseText = extractionResult.text.trim();
        if (!responseText) {
            throw new Error("AI returned an empty response for data extraction.");
        }
        
        type ParsedResponse = Partial<ReportData> & { questions?: AIQuestion[] };
        const parsedResponse: ParsedResponse = JSON.parse(responseText);
        const report = parsedResponse;
        const questions = parsedResponse.questions || [];

        const scenePhotoParts = await Promise.all(
            (filesByType['scene'] || []).filter(f => f.file.type.startsWith('image/')).map(f => fileToGenerativePart(f.file))
        );
        
        // 5. Make the second AI call to generate the diagram
        const diagramPrompt = `
            Based on the following information, create a simple, schematic SVG diagram of the accident scene.
            - Scene Photos: Use the provided images to understand the road layout and final positions of the vehicles.
            - Vehicle A Manoeuvre: ${report.vehicles?.find(v => v.label === 'A')?.manoeuvre || 'Not specified'}
            - Vehicle B Manoeuvre: ${report.vehicles?.find(v => v.label === 'B')?.manoeuvre || 'Not specified'}
            - First Impact Points: Vehicle A - ${report.vehicles?.find(v => v.label === 'A')?.first_impact}, Vehicle B - ${report.vehicles?.find(v => v.label === 'B')?.first_impact}

            TASK:
            Return ONLY a valid SVG string. The SVG should be 400x300. Use a dark gray background (#334155).
            - Roads should be a lighter gray.
            - Vehicle A should be a cyan rectangle.
            - Vehicle B should be an indigo rectangle.
            - IMPORTANT: Wrap each vehicle in a group with a specific ID for interactivity: <g id="vehicle-A">...</g> and <g id="vehicle-B">...</g>.
        `;
        
        const diagramResultPromise = ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [{ text: diagramPrompt }, ...scenePhotoParts] },
        });

        // 6. Make the third AI call to generate the sketch image
        const sketchPrompt = `
            Create a simple, black and white, top-down schematic sketch of a traffic accident based on this information:
            - Vehicle A was ${report.vehicles?.find(v => v.label === 'A')?.manoeuvre || 'driving'}.
            - Vehicle B was ${report.vehicles?.find(v => v.label === 'B')?.manoeuvre || 'driving'}.
            - The impact for Vehicle A was on the ${report.vehicles?.find(v => v.label === 'A')?.first_impact}.
            - The impact for Vehicle B was on the ${report.vehicles?.find(v => v.label === 'B')?.first_impact}.
            - Use the provided scene photos to inform the road layout.
            - Label the vehicles 'A' and 'B'.
        `;
        
        const sketchResultPromise = ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: sketchPrompt,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/png',
              aspectRatio: '1:1',
            },
        });

        const [diagramResult, sketchResult] = await Promise.all([diagramResultPromise, sketchResultPromise]);

        const diagramSvg = diagramResult.text.trim();
        const sketchBase64 = sketchResult.generatedImages[0].image.imageBytes;

        
        return { report, questions, diagram: diagramSvg, sketch: sketchBase64 };

    } catch (error) {
        console.error("Error in Gemini service:", error);
        if (error instanceof Error && error.message.includes('API_KEY')) {
             throw new Error("Invalid API Key. Please check your settings.");
        }
        throw new Error("Could not connect to the AI server or process the response.");
    }
};

export const clarifyReportWithAI = async (
    reportData: ReportData,
    questions: AIQuestion[],
    userAnswer: string
): Promise<Partial<ReportData>> => {
     try {
        const prompt = `
            CONTEXT: You are an AI assistant helping a user finalize an accident report. The user is answering your previous questions to fill in missing information.

            CURRENT REPORT DATA (JSON):
            \`\`\`json
            ${JSON.stringify(reportData, null, 2)}
            \`\`\`

            YOUR PREVIOUS QUESTIONS FOR THE USER:
            - ${questions.map(q => q.question).join('\n- ')}

            USER'S ANSWER:
            """
            ${userAnswer}
            """

            TASK:
            Based ONLY on the user's answer, update the CURRENT REPORT DATA. Do not change any existing data unless the user's answer explicitly corrects it. Fill in only the missing fields mentioned in the user's answer. Return the complete, updated JSON object for the entire report. Return ONLY the JSON object, without any extra text or markdown.
        `;
        
        const result = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [{ text: prompt }] },
            config: {
                responseMimeType: "application/json",
            }
        });

        const responseText = result.text.trim();
        if (!responseText) {
            throw new Error("AI returned an empty response during clarification.");
        }

        return JSON.parse(responseText) as Partial<ReportData>;

     } catch (error) {
        console.error("Error in Gemini clarification service:", error);
        throw new Error("An error occurred while processing your answer with the AI.");
     }
};