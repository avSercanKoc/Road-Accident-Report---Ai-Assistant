// FIX: Populated the missing type definitions for the entire application.
import { Type } from "@google/genai";

export enum AppStep {
  LandingPage = 'LANDING_PAGE',
  SelectCountry = 'SELECT_COUNTRY',
  UploadMedia = 'UPLOAD_MEDIA',
  Processing = 'PROCESSING',
  Verification = 'VERIFICATION',
  ReportGenerated = 'REPORT_GENERATED',
}

export interface AppConfig {
  locale: 'TR' | 'UK' | 'CA' | 'NY';
  language: 'TR' | 'EN';
}

export interface UploadedFile {
  file: File;
  type: 'document' | 'scene' | 'audio';
  owner?: 'A' | 'B';
  previewUrl: string;
}

export interface AIQuestion {
  field: string;
  question: string;
}

export interface VehicleData {
    label: 'A' | 'B';
    plate: string;
    make_model: string;
    first_impact: string;
    manoeuvre: string;
    alleged_offences: string[];
}

export interface DriverData {
    vehicle: 'A' | 'B';
    name: string;
    id_no: string;
    licence_no: string;
    phone: string;
    statement: string;
}

export interface InsuranceData {
    vehicle: 'A' | 'B';
    company: string;
    policy_no: string;
}

export interface WitnessData {
    name: string;
    phone: string;
}

export interface ReportData {
  locale: string;
  accident: {
    timestamp: string;
    geo: {
      address: string;
    };
    weather: string;
    light: string;
  };
  vehicles: VehicleData[];
  drivers: DriverData[];
  insurance: InsuranceData[];
  witnesses: WitnessData[];
  diagram: {
    svg: string;
    sketch_base64: string | null;
    notes: string;
  };
  signatures: {
    A: string | null;
    B: string | null;
  };
  consent: {
    A: boolean;
    B: boolean;
  };
}

export const reportDataSchema = {
    type: Type.OBJECT,
    properties: {
        accident: {
            type: Type.OBJECT,
            properties: {
                timestamp: { type: Type.STRING, description: "ISO 8601 format date and time of the accident." },
                geo: {
                    type: Type.OBJECT,
                    properties: {
                        address: { type: Type.STRING, description: "Full address of the accident location." }
                    }
                },
                weather: { type: Type.STRING, description: "Weather conditions (e.g., Clear, Raining, Foggy)." },
                light: { type: Type.STRING, description: "Light conditions (e.g., Daylight, Dark, Dusk)." }
            }
        },
        vehicles: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    label: { type: Type.STRING, description: "Vehicle identifier, either 'A' or 'B'." },
                    plate: { type: Type.STRING, description: "License plate number." },
                    make_model: { type: Type.STRING, description: "Make and model of the vehicle (e.g., Ford Focus)." },
                    first_impact: { type: Type.STRING, description: "Initial point of impact on the vehicle (e.g., Front Bumper)." },
                    manoeuvre: { type: Type.STRING, description: "What the vehicle was doing (e.g., Turning left, Parked)." }
                }
            }
        },
        drivers: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    vehicle: { type: Type.STRING, description: "The vehicle this driver was operating, 'A' or 'B'." },
                    name: { type: Type.STRING, description: "Driver's full name." },
                    id_no: { type: Type.STRING, description: "National ID or other identification number." },
                    licence_no: { type: Type.STRING, description: "Driving license number." },
                    phone: { type: Type.STRING, description: "Driver's phone number." },
                    statement: { type: Type.STRING, description: "A brief statement from the driver about the accident, transcribed from audio if provided." }
                }
            }
        },
        insurance: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    vehicle: { type: Type.STRING, description: "The vehicle this policy belongs to, 'A' or 'B'." },
                    company: { type: Type.STRING, description: "Name of the insurance company." },
                    policy_no: { type: Type.STRING, description: "Insurance policy number." }
                }
            }
        },
        questions: {
            type: Type.ARRAY,
            description: "A list of questions for the user if information is missing, conflicting, or media is unreadable.",
            items: {
                type: Type.OBJECT,
                properties: {
                    field: { type: Type.STRING, description: "The specific data field the question relates to, or 'document_quality' for unreadable documents." },
                    question: { type: Type.STRING, description: "The question to ask the user." }
                }
            }
        }
    }
};