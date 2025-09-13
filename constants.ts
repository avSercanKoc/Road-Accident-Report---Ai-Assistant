// FIX: Populated the missing constants used throughout the application.
import type { ReportData } from './types';

export const INITIAL_REPORT_DATA: ReportData = {
    locale: 'UK',
    accident: {
        timestamp: new Date().toISOString().substring(0, 16),
        geo: { address: '' },
        weather: '',
        light: ''
    },
    vehicles: [
        { label: 'A', plate: '', make_model: '', first_impact: '', manoeuvre: '', alleged_offences: [] },
        { label: 'B', plate: '', make_model: '', first_impact: '', manoeuvre: '', alleged_offences: [] }
    ],
    drivers: [
        { vehicle: 'A', name: '', id_no: '', licence_no: '', phone: '', statement: '' },
        { vehicle: 'B', name: '', id_no: '', licence_no: '', phone: '', statement: '' }
    ],
    insurance: [
        { vehicle: 'A', company: '', policy_no: '' },
        { vehicle: 'B', company: '', policy_no: '' }
    ],
    witnesses: [],
    diagram: {
        svg: `<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg" style="background-color:#334155;"></svg>`,
        sketch_base64: null,
        notes: ''
    },
    signatures: { A: null, B: null },
    consent: { A: false, B: false }
};

export const UK_VIOLATIONS = [
    { id: 'uk_1', text: 'Failed to give way' },
    { id: 'uk_2', text: 'Exceeding speed limit' },
    { id: 'uk_3', text: 'Improper lane change' },
    { id: 'uk_4', text: 'Following too closely' },
    { id: 'uk_5', text: 'Disregarded traffic signal' },
];

export const CALIFORNIA_VIOLATIONS = [
    { id: 'ca_1', text: 'Unsafe lane change (CVC 22107)' },
    { id: 'ca_2', text: 'Speeding (CVC 22350)' },
    { id: 'ca_3', text: 'Failure to yield (CVC 21800)' },
    { id: 'ca_4', text: 'Following too closely (CVC 21703)' },
    { id: 'ca_5', text: 'Disobeyed traffic signal (CVC 21453)' },
];

export const NEW_YORK_VIOLATIONS = [
    { id: 'ny_1', text: 'Imprudent speed (VTL 1180)' },
    { id: 'ny_2', text: 'Following too closely (VTL 1129)' },
    { id: 'ny_3', text: 'Failed to yield right-of-way (VTL 1140)' },
    { id: 'ny_4', text: 'Unsafe lane change (VTL 1128)' },
    { id: 'ny_5', text: 'Disobeyed traffic control device (VTL 1110)' },
];

export const TURKISH_VIOLATIONS = [
    { id: 'tr_1', text: 'Kırmızı ışık ihlali' }, // Red light violation
    { id: 'tr_2', text: 'Hız limitini aşma' }, // Exceeding speed limit
    { id: 'tr_3', text: 'Geçiş önceliğine uymama' }, // Failure to give way
    { id: 'tr_4', text: 'Hatalı şerit değiştirme' }, // Improper lane change
    { id: 'tr_5', text: 'Yakın takip' }, // Following too closely
];