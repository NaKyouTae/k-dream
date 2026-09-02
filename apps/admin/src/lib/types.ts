export type StaffType = "ADMIN" | "AGENT";
export type StaffStatus = "ACTIVE" | "SUSPENDED";
export type CountryCode = "UZ" | "MN";
export type SchoolType = "LANGUAGE" | "COLLEGE" | "UNIVERSITY" | "GRADUATE";
export type SchoolStatus = "ACTIVE" | "INACTIVE";
export type StudentStatus =
  | "REVIEW_REQUESTED"
  | "REVIEWING"
  | "SUPPLEMENT_REQUIRED"
  | "REVIEW_COMPLETED";

/** GET /auth/me 응답 (JWT payload) */
export interface Me {
  sub: string;
  loginId: string;
  name: string;
  type: StaffType;
  /** 에이전트만 값이 있다 */
  countryCode?: CountryCode | null;
  organization?: string | null;
}

export interface Cursor<T> {
  items: T[];
  nextCursor: string | null;
}

/** staff 테이블 공통 형태. 관리자는 countryCode/organization 이 null 이다 */
export interface Staff {
  id: string;
  type: StaffType;
  loginId: string;
  name: string;
  countryCode: CountryCode | null;
  organization: string | null;
  phone: string | null;
  status: StaffStatus;
  lastLoginAt: string | null;
  createdAt: string;
  _count: { students: number };
}

export interface Agent {
  id: string;
  loginId: string;
  name: string;
  countryCode: CountryCode;
  organization: string | null;
  phone: string | null;
  status: StaffStatus;
  lastLoginAt: string | null;
  createdAt: string;
  _count: { students: number };
}

export interface School {
  id: string;
  nameKo: string;
  nameEn: string | null;
  type: SchoolType;
  region: string | null;
  website: string | null;
  memo: string | null;
  status: SchoolStatus;
  createdAt: string;
  _count: { students: number };
}

export type ProgramCode = "LANG" | "ASSOC" | "BACH" | "MASTER";
export type GenderCode = "M" | "F" | "OTHER";
export type DocumentCategory =
  | "PASSPORT"
  | "PHOTO"
  | "GRAD_CERT"
  | "TRANSCRIPT"
  | "TOPIK"
  | "FINANCE"
  | "FAMILY"
  | "OTHER";
export type DocumentReviewStatus = "NOT_REVIEWED" | "OK" | "SUPPLEMENT_REQUIRED";

export interface StudentListItem {
  id: string;
  studentNo: string;
  countryCode: CountryCode;
  passportName: string;
  localName: string | null;
  desiredProgram: ProgramCode;
  desiredMajor: string | null;
  status: StudentStatus;
  reviewNote: string | null;
  createdAt: string;
  updatedAt: string;
  agent: { id: string; name: string; organization: string | null };
  school: { id: string; nameKo: string } | null;
  _count: { documents: number };
}

export interface StudentDocument {
  id: string;
  studentId: string;
  /** 업로드 후 나중에 지정할 수 있어 비어 있을 수 있다 */
  category: DocumentCategory | null;
  originalFileName: string;
  mimeType: string;
  fileSizeBytes: number;
  versionNo: number;
  reviewStatus: DocumentReviewStatus;
  reviewNote: string | null;
  uploadedAt: string;
  uploader: { id: string; name: string };
}

export interface StudentDetail
  extends Omit<StudentListItem, "agent" | "school" | "_count"> {
  birthDate: string;
  genderCode: GenderCode;
  passportNo: string;
  passportExpiry: string;
  phone: string | null;
  email: string | null;
  reviewedAt: string | null;
  agent: {
    id: string;
    name: string;
    organization: string | null;
    loginId: string;
  };
  school: { id: string; nameKo: string; type: SchoolType } | null;
  reviewedBy: { id: string; name: string } | null;
  documents: StudentDocument[];
}

export interface AuditLog {
  id: string;
  actionCode: string;
  entityType: string;
  entityId: string | null;
  detail: Record<string, unknown> | null;
  ipAddress: string | null;
  createdAt: string;
  actor: { name: string; loginId: string; type: StaffType } | null;
}

export const COUNTRY_LABEL: Record<CountryCode, string> = {
  UZ: "우즈베키스탄",
  MN: "몽골",
};

/**
 * 에이전트 계정 생성 시 서버가 넣는 초기 비밀번호.
 * 서버의 agents.constants.ts 와 같은 값을 유지해야 한다 (안내 문구용).
 */
export const DEFAULT_AGENT_PASSWORD = "123456789a";

export const STAFF_TYPE_LABEL: Record<StaffType, string> = {
  ADMIN: "관리자",
  AGENT: "에이전트",
};

export const STAFF_STATUS_LABEL: Record<StaffStatus, string> = {
  ACTIVE: "활성",
  SUSPENDED: "정지",
};

export const SCHOOL_TYPE_LABEL: Record<SchoolType, string> = {
  LANGUAGE: "어학연수",
  COLLEGE: "전문대",
  UNIVERSITY: "4년제",
  GRADUATE: "석사",
};

export const SCHOOL_STATUS_LABEL: Record<SchoolStatus, string> = {
  ACTIVE: "운영중",
  INACTIVE: "비활성",
};

export const STUDENT_STATUS_LABEL: Record<StudentStatus, string> = {
  REVIEW_REQUESTED: "검토 요청",
  REVIEWING: "검토 중",
  SUPPLEMENT_REQUIRED: "서류 보완 필요",
  REVIEW_COMPLETED: "검토 완료",
};

export const PROGRAM_LABEL: Record<ProgramCode, string> = {
  LANG: "어학연수",
  ASSOC: "전문대",
  BACH: "4년제",
  MASTER: "석사",
};

export const GENDER_LABEL: Record<GenderCode, string> = {
  M: "남",
  F: "여",
  OTHER: "기타",
};

export const DOCUMENT_CATEGORY_LABEL: Record<DocumentCategory, string> = {
  PASSPORT: "여권",
  PHOTO: "증명사진",
  GRAD_CERT: "졸업증명서",
  TRANSCRIPT: "성적증명서",
  TOPIK: "TOPIK 증명",
  FINANCE: "재정증명",
  FAMILY: "가족/출생서류",
  OTHER: "기타",
};

/** 업로드 폼에서 고르는 순서 */
export const DOCUMENT_CATEGORY_ORDER: DocumentCategory[] = [
  "PASSPORT",
  "PHOTO",
  "GRAD_CERT",
  "TRANSCRIPT",
  "TOPIK",
  "FINANCE",
  "FAMILY",
  "OTHER",
];

export const DOCUMENT_REVIEW_LABEL: Record<DocumentReviewStatus, string> = {
  NOT_REVIEWED: "미검토",
  OK: "확인 완료",
  SUPPLEMENT_REQUIRED: "보완 필요",
};

/** 목록 필터 탭 순서이자 진행 순서 */
export const STUDENT_STATUS_ORDER: StudentStatus[] = [
  "REVIEW_REQUESTED",
  "REVIEWING",
  "SUPPLEMENT_REQUIRED",
  "REVIEW_COMPLETED",
];

export const STUDENT_STATUS_TONE: Record<
  StudentStatus,
  "info" | "warning" | "danger" | "success"
> = {
  REVIEW_REQUESTED: "info",
  REVIEWING: "warning",
  SUPPLEMENT_REQUIRED: "danger",
  REVIEW_COMPLETED: "success",
};

export const AUDIT_ACTION_LABEL: Record<string, string> = {
  LOGIN: "로그인",
  LOGOUT: "로그아웃",
  CREATE_ADMIN: "관리자 생성",
  UPDATE_ADMIN: "관리자 수정",
  RESET_ADMIN_PASSWORD: "관리자 비밀번호 재설정",
  CREATE_AGENT: "에이전트 생성",
  UPDATE_AGENT: "에이전트 수정",
  RESET_AGENT_PASSWORD: "에이전트 비밀번호 재설정",
  CREATE_STUDENT: "학생 등록",
  UPDATE_STUDENT: "학생 정보 수정",
  UPDATE_STUDENT_STATUS: "학생 상태 변경",
  REQUEST_REVIEW: "검토 요청",
  CREATE_COMMENT: "메모 작성",
  DELETE_COMMENT: "메모 삭제",
  UPLOAD_DOCUMENT: "서류 업로드",
  UPDATE_DOCUMENT: "서류 분류 변경",
  REVIEW_DOCUMENT: "서류 검토",
  DELETE_DOCUMENT: "서류 삭제",
  CREATE_SCHOOL: "학교 등록",
  UPDATE_SCHOOL: "학교 수정",
  DELETE_SCHOOL: "학교 삭제",
};
