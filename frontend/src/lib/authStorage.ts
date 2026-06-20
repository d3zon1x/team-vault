// Auth token storage utility
const TOKENS_KEY = 'auth_tokens';
const USER_KEY = 'auth_user';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export const authStorage = {
  setTokens: (tokens: AuthTokens) => {
    localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens));
  },

  getTokens: (): AuthTokens | null => {
    const stored = localStorage.getItem(TOKENS_KEY);
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  },

  getAccessToken: (): string | null => {
    const tokens = authStorage.getTokens();
    return tokens?.accessToken || null;
  },

  getRefreshToken: (): string | null => {
    const tokens = authStorage.getTokens();
    return tokens?.refreshToken || null;
  },

  setUser: (user: any) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  getUser: () => {
    const stored = localStorage.getItem(USER_KEY);
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  },

  clearTokens: () => {
    localStorage.removeItem(TOKENS_KEY);
    localStorage.removeItem(USER_KEY);
  },

  isAuthenticated: (): boolean => {
    return !!authStorage.getAccessToken();
  },
};
