import { create } from 'zustand';
import { signIn, signOut, getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';

interface AuthUser {
  username: string;
  email: string;
}

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  error: null,
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      await signIn({ username: email, password });
      const { username, signInDetails } = await getCurrentUser();
      set({ user: { username, email: signInDetails?.loginId ?? email }, isLoading: false });
    } catch (err) {
      set({ error: getErrorMessage(err), isLoading: false });
    }
  },
  logout: async () => {
    await signOut();
    set({ user: null, error: null });
  },
  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const session = await fetchAuthSession();
      if (session.tokens) {
        const { username, signInDetails } = await getCurrentUser();
        set({ user: { username, email: signInDetails?.loginId ?? username }, isLoading: false });
      } else {
        set({ user: null, isLoading: false });
      }
    } catch {
      set({ user: null, isLoading: false });
    }
  },
}));
function getErrorMessage(err: unknown): string {
  if (err instanceof Error) {
    switch (err.name) {
      case 'NotAuthorizedException':
        return 'メールアドレスまたはパスワードが間違っています';
      case 'UserNotFoundException':
        return 'ユーザーが見つかりません';
      case 'UserNotConfirmedException':
        return 'メールアドレスの確認が完了していません';
      case 'TooManyRequestsException':
        return 'しばらく時間をおいてから再試行してください';
      default:
        return err.message;
    }
  }
  return '予期しないエラーが発生しました';
}