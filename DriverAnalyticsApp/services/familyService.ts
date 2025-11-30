/**
 * Family Service
 * Handles family account creation, joining, and member management
 */

import apiRequest from './apiClient';

export type FamilyMember = {
  user_id: number;
  name: string;
  email: string;
  role: 'parent' | 'teen';
  family_id: number;
};

export type FamilyAccount = {
  family_id: number;
  family_name: string;
  invite_code: string;
};

/**
 * Create a new family account (parent only)
 */
export async function createFamily(familyName: string): Promise<{
  message: string;
  family: FamilyAccount;
}> {
  return apiRequest('/families', {
    method: 'POST',
    body: { family_name: familyName },
  });
}

/**
 * Join a family using invite code (teen only)
 */
export async function joinFamily(inviteCode: string): Promise<{
  message: string;
  family: FamilyAccount;
}> {
  return apiRequest('/families/join', {
    method: 'POST',
    body: { invite_code: inviteCode },
  });
}

/**
 * Get all family members
 */
export async function getFamilyMembers(): Promise<{
  members: FamilyMember[];
  family: FamilyAccount;
}> {
  return apiRequest('/families/members');
}

/**
 * Get family account details
 */
export async function getFamily(familyId: number): Promise<{
  family: FamilyAccount;
  members: FamilyMember[];
}> {
  return apiRequest(`/families/${familyId}`);
}

/**
 * Get current user's family
 */
export async function getMyFamily(): Promise<{
  family: FamilyAccount;
  members: FamilyMember[];
}> {
  return apiRequest('/families/me');
}

/**
 * Leave current family
 */
export async function leaveFamily(): Promise<{
  message: string;
  token?: string;
  user?: {
    user_id: number;
    name: string;
    email: string;
    role: string;
    family_id: number | null;
  };
}> {
  return apiRequest('/families/leave', {
    method: 'POST',
  });
}

