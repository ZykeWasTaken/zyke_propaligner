export interface PresetData {
    prop: string;
    bone: number;
    dict: string;
    clip: string;
    offset: [number, number, number];
    rotation: [number, number, number];
}

export interface Preset {
    id: string;
    label: string;
    data: PresetData;
    last_used: number;
}

export interface EditingData {
    prop: string;
    bone: number;
    dict: string;
    clip: string;
    offset: [number, number, number];
    rotation: [number, number, number];
}

export interface NewPresetData {
    label: string;
    data: PresetData;
}

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
