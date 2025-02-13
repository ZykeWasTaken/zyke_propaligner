export interface PresetData {
    id: string;
    label: string;
    prop: string;
    bone: number;
    dict: string;
    clip: string;
    offset: [number, number, number];
    rotation: [number, number, number];
    created: number;
}

export interface EditingData {
    prop: string;
    bone: number;
    dict: string;
    clip: string;
    offset: [number, number, number];
    rotation: [number, number, number];
}

export type NewPresetData = EditingData & { label: string };

export interface HistoryData {
    prop: string;
    bone: number;
    dict: string;
    clip: string;
    offset: [number, number, number];
    rotation: [number, number, number];
    created: number;
}

export interface OpenedModal {
    canClose: boolean;
    onClose: (() => void) | null;
    [key: string]: any;
}
