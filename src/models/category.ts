export interface Category {
    [x: string]: any;
    id?: string;
    category?: string;
}

export interface Position {
    id?: string;
    position: string;
}

export interface Setup {
    id?: string;
    setup: string;
}

export interface Rate {
    id?: string;
    rate: string;
}

export interface Skills {
    id?: any;
    itemName?: string;
}

export interface EducDegree {
    id?: any;
    degree?: string;
}

export interface Course {
    id?: any;
    course?: string;
}

export interface University {
    id?: string;
    university?: string;
}