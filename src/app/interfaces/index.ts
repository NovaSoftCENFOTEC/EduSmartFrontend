import {inject} from "@angular/core";

export interface ILoginResponse {
  accessToken: string;
  expiresIn: number
}

export interface IResponse<T> {
  data: T;
  message: string,
  meta: T;
}

export interface IUser {
  id?: number;
  name?: string;
  lastname?: string;
  email?: string;
  password?: string;
  createdAt?: string;
  updatedAt?: string;
  profilePicture?: string;
  authorities?: IAuthority[];
  role?: IRole
  school?: ISchool;
  active?: boolean;
}

export interface IAuthority {
  authority: string;
}

export interface IFeedBackMessage {
  type?: IFeedbackStatus;
  message?: string;
}

export enum IFeedbackStatus {
  success = "SUCCESS",
  error = "ERROR",
  default = ''
}

export enum IRoleType {
  admin = "ROLE_ADMIN",
  user = "ROLE_USER",
  superAdmin = 'ROLE_SUPER_ADMIN',
  student = 'ROLE_STUDENT',
  teacher = 'ROLE_TEACHER',

}

export interface IRole {
  id: number;
  name : string;
  description: string;
  createdAt: string;
  updatedAt: string;
}
export interface ISearch {
  page?: number;
  size?: number;
  pageNumber?: number;
  pageSize?: number;
  totalElements?: number;
  totalPages?: number;
}

export interface ISchool {
    id?: number;
    name?: string;
    domain?: string;
    createdAt?: string;
}

export interface IBadge {
  id?: number;
  title?: string;
  description?: string;
  iconUrl?: string;
  students?: IUser[];
}
