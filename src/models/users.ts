import { Roles } from "./roles";

export interface Users {
    [x: string]: any;
    id?: string;
    role?: Roles;
    email?: string;
    password?: string;
    confirm_pass?: string;
}