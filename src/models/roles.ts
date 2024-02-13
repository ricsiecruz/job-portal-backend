import * as mongodb from "mongodb";

export interface Roles {
    role?: string;
    data?: Data;
}

interface Data {
    info?: Info;
    jobs_applied?: JobsApplied[];
    reviews?: Reviews[];
    shortlisted?: Shortlisted[];
    job_posts?: JobPosts[];
    employerInfo?: EmployerInfo;
    candidateInfo?: CandidateInfo;
    applied?: Applied[];
}

export interface JobPosts {
    _jobId?: mongodb.ObjectId;
    location?: string;
    designation?: string;
    description?: string;
    category?: string;
    date_posted?: string;
    position?: string;
    urgent?: boolean;
    setup?: string;
    salary?: Salary;
    payment?: string;
    applicants?: Applicants[];
}

export interface Applicants {
    id?: string;
    email?: string;
    date_applied?: any;
    candidateInfo: CandidateInfo
}

export interface JobList {
    designation: string;
    description: string;
    category?: string;
    date_posted?: string;
    position?: string;
    urgent?: boolean;
    setup?: string;
    salary?: Salary;
    payment?: string;
}

interface Salary {
    min?: number;
    max?: number;
}

interface EmployerInfo {
    logo?: string;
    company?: string;
    location?: City;
}

export interface CandidateInfo {
    image?: string;
    banner?: string;
    name?: string;
    phone?: string;
    designation?: string;
    location?: string;
    salary?: string;
    skills?: any;
    applied?: Applied[];
    // skills?: Skills
}

export interface Applied {
    _jobId: string;
}

interface City {
    city?: string;
}

interface Info {
    image?: string;
    name?: string;
    phone?: number;
    // email?: string;
    skills?: Skills;
    designation?: string;
    education?: string;
    experience?: string;
    profile_url?: string;
    about?: string;
    links?: string;
}

interface Skills {
    id?: any;
    itemName?: string;
}

interface JobsApplied {
    image?: string;
    company?: string;
    location?: string;
    designation?: string;
    date_applied?: string;
    status?: string;
}

interface Reviews {
    review?: string;
}

interface Shortlisted {
    company?: string;
}
