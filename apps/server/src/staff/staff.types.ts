import type { CountryCode, StaffStatus } from "@prisma/client";

export interface ListStaffQuery {
  cursor?: string;
  q?: string;
  countryCode?: CountryCode;
  status?: StaffStatus;
  limit?: number;
}

export interface CreateStaffInput {
  loginId: string;
  password: string;
  name: string;
  phone?: string;
  countryCode?: CountryCode;
  organization?: string;
}

export interface UpdateStaffInput {
  name?: string;
  phone?: string;
  countryCode?: CountryCode;
  organization?: string;
  status?: StaffStatus;
  password?: string;
}
