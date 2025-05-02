export interface OpenedModal {
    canClose: boolean;
    onClose: (() => void) | null;
    [key: string]: any;
}

export interface ParticleAlignmentData {
    dict: string;
    clip: string;
    offset: { x: number; y: number; z: number };
    size: number;
}

export interface AlignmentData {
    dict: string;
    clip: string;
    props: PropAlignmentData[];
}

export interface PropAlignmentData {
    prop: string;
    bone: number;
    offset: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number };
    particles: ParticleAlignmentData[] | null;
    tempId: number;
}

export interface HistoryData extends AlignmentData {
    created: number;
}

export interface Preset {
    id: string;
    label: string;
    data: AlignmentData;
    last_used: number;
}

export interface NewPresetData {
    label: string;
    data: AlignmentData;
}

export interface Bone {
    label: string;
    name: string;
    value: string;
    id: number;
    idx: number;
}
