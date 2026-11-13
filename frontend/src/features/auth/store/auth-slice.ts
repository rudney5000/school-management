import {
  type ActionCreatorWithoutPayload,
  createSlice,
  type PayloadAction,
  type Slice,
} from '@reduxjs/toolkit';
import type { UserRole } from '@features/auth/model/dto/RegisterDto.ts';

export interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  role: UserRole | null;
  email: string | null;
  phone: string | null;
  username: string | null;
  userId: string | null;
  schoolId: string | null;
  subSchoolId: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  accessToken: localStorage.getItem('accessToken'),
  refreshToken: localStorage.getItem('refreshToken'),
  role: (localStorage.getItem('role') as UserRole) || null,
  email: localStorage.getItem('email'),
  phone: localStorage.getItem('phone'),
  username: localStorage.getItem('username'),
  userId: localStorage.getItem('userId'),
  schoolId: localStorage.getItem('schoolId'),
  subSchoolId: localStorage.getItem('subSchoolId'),
  isAuthenticated: !!localStorage.getItem('accessToken'),
};

const PERSISTED_KEYS = [
  'accessToken',
  'refreshToken',
  'role',
  'email',
  'phone',
  'username',
  'userId',
  'schoolId',
  'subSchoolId',
] as const;

// Writes the value, or removes the key when the new session has none, so a
// value from the previous account never survives into the next one.
function persist(key: (typeof PERSISTED_KEYS)[number], value: string | null | undefined): void {
  if (value) {
    localStorage.setItem(key, value);
  } else {
    localStorage.removeItem(key);
  }
}

export const authSlice: Slice<AuthState> = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<AuthState & { refreshToken: string }>) => {
      const {
        accessToken,
        refreshToken,
        role,
        email,
        phone,
        username,
        userId,
        schoolId,
        subSchoolId,
      } = action.payload;
      state.accessToken = accessToken;
      state.refreshToken = refreshToken;
      state.role = role;
      state.email = email;
      state.phone = phone;
      state.username = username;
      state.userId = userId;
      state.schoolId = schoolId;
      state.subSchoolId = subSchoolId;
      state.isAuthenticated = true;

      persist('accessToken', accessToken);
      persist('refreshToken', refreshToken);
      persist('role', role);
      persist('email', email);
      persist('phone', phone);
      persist('username', username);
      persist('userId', userId);
      persist('schoolId', schoolId);
      persist('subSchoolId', subSchoolId);
    },
    logout: (state, _action: PayloadAction<undefined>) => {
      state.accessToken = null;
      state.refreshToken = null;
      state.role = null;
      state.email = null;
      state.phone = null;
      state.username = null;
      state.userId = null;
      state.schoolId = null;
      state.subSchoolId = null;
      state.isAuthenticated = false;

      PERSISTED_KEYS.forEach((key) => localStorage.removeItem(key));
    },
  },
});

export const { setCredentials } = authSlice.actions;
export const logout = authSlice.actions.logout as ActionCreatorWithoutPayload<'auth/logout'>;
