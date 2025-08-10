export interface ILoginResponse {
  accessToken: string;
  authUser: IUser;
  expiresIn: number;
}

export interface IResponse<T> {
  data: T;
  message: string;
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
  profilePic?: string;
  authorities?: IAuthority[];
  role?: IRole;
  school?: ISchool;
  active?: boolean;
  needsPasswordChange?: boolean;
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
  default = "",
}

export enum IRoleType {
  teacher = "ROLE_TEACHER",
  student = "ROLE_STUDENT",
  superAdmin = "ROLE_SUPER_ADMIN",
}

export interface IRole {
  id: number;
  name: string;
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

export interface ICourse {
  id?: number;
  code?: string;
  title?: string;
  description?: string;
  createdAt?: string;
}

export interface IGroup {
  id?: number;
  name?: string;
  course?: ICourse;
  students?: IUser[];
  teacher?: IUser;
}

export interface IStory {
  id?: number;
  title: string;
  content: string;
  createdAt?: Date;
  courseId?: number;
}

export interface IStudent {
  id?: number;
  name?: string;
  lastname?: string;
  email?: string;
  password?: string;
  createdAt?: string;
  updatedAt?: string;
  profilePicture?: string;
  authorities?: IAuthority[];
  role?: IRole;
  schoolId?: ISchool;
  active?: boolean;
}

export interface IAssignment {
  group: { id: number };
  id?: number;
  title: string;
  description: string;
  type: string;
  dueDate: Date;
  createdAt?: Date;
  groupId?: number;
}

export interface IQuiz {
  story: { id: number };
  id?: number;
  title: string;
  description: string;
  dueDate: Date;
  numberOfQuestions: number;
  generateWithAI: boolean;
  questions?: IQuestion[];
}

export interface IQuestion {
  id?: number;
  text: string;
  quiz?: IQuiz;
  options?: IOption[];
}

export interface IOption {
  id?: number;
  text: string;
  correct: boolean;
  question?: IQuestion;
}

export interface IMaterial {
  id?: number;
  name: string;
  fileUrl: string;
  uploadedAt?: string;
  course?: Partial<ICourse> | null;
  teacher?: Partial<IUser> | null;
}

export interface IAudioTrack {
  id?: number;
  title: string;
  voiceType: VoiceTypeEnum;
  url: string;
  createdAt?: string;
  story?: IStory;
}

export enum VoiceTypeEnum {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  NEUTRAL = 'NEUTRAL'
}
