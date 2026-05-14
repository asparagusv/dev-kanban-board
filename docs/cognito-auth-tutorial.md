# 🔐 AWS Cognito + Amplify 認証 チュートリアル

> **対象**: `dev-kanban-board` (Vite + React 19 + TypeScript + MUI + Zustand)  
> **難易度**: 入門 🐣 | **所要時間**: 約 60〜90 分

---

## 📌 全体の流れ

```
① Cognito ユーザープール作成（AWSコンソール）
② App Client 設定確認
③ npm install aws-amplify @aws-amplify/ui-react
④ src/config/awsConfig.ts 作成
⑤ .env に認証情報記入
⑥ Zustand 認証ストア実装
⑦ ログインページ UI 作成
⑧ ProtectedRoute コンポーネント作成
⑨ App.tsx に統合
```

---

## 🧠 概念を理解しよう

### AWS Cognito とは？

「ユーザー認証のためのマネージドサービス」。ユーザー名・パスワード管理・ログイン・メール確認などを自分でサーバーを立てずに AWS に丸投げできます。

```
あなたのアプリ ──ログイン要求──▶ AWS Cognito
               ◀──JWT トークン── (認証OK!)
```

| 用語 | 意味 |
|------|------|
| **ユーザープール** | ユーザーアカウント情報を管理するDB |
| **App Client** | アプリからユーザープールにアクセスする窓口設定 |
| **JWT トークン** | ログイン成功後に発行される「ログイン証明書」 |

### AWS Amplify とは？

AWS のサービスを React アプリから簡単に使うためのライブラリ。Cognito への接続・ログイン・ログアウトなどの処理を数行で書けます。

---

## STEP 1: Cognito ユーザープール作成

1. [AWSコンソール](https://console.aws.amazon.com/) にログイン
2. リージョンを **`ap-northeast-1`（東京）** に変更
3. 検索バーで **"Cognito"** を検索 → 「ユーザープールを作成」

### 設定値

**ステップ1: サインインエクスペリエンス**

| 設定 | 値 |
|------|----|
| Cognito ユーザープール | ✅ 選択 |
| サインインオプション | **Eメール** にチェック |

**ステップ2: セキュリティ要件**

| 設定 | 値 |
|------|----|
| パスワードポリシー | Cognito のデフォルト |
| 多要素認証 (MFA) | **なし**（入門なのでOFF） |

**ステップ3: サインアップ**

| 設定 | 値 |
|------|----|
| セルフサービスのサインアップ | **有効化** |
| 検証属性 | **Eメール** |

**ステップ4: メッセージ配信**

| 設定 | 値 |
|------|----|
| メール | **Cognito でEメールを送信**（無料枠） |

**ステップ5: アプリを統合する**

| 設定 | 値 |
|------|----|
| ユーザープール名 | `dev-kanban-board-pool` |
| ホストされた認証ページ | **チェックしない**（自前UIを使うため） |
| 最初のアプリクライアント | **パブリッククライアント** |
| アプリクライアント名 | `dev-kanban-board-client` |
| クライアントのシークレット | **生成しない** ⚠️ |

> ⚠️ **「クライアントのシークレットを生成しない」を必ず選択！**  
> フロントエンドはシークレットを安全に保持できないため。

### メモする情報

作成後に以下をコピーしておく：

```
ユーザープールID: ap-northeast-1_XXXXXXXXX  ← プール詳細ページ
クライアントID:   XXXXXXXXXXXXXXXXXXXXXXXXXX ← 「アプリの統合」タブ
リージョン:       ap-northeast-1
```

---

## STEP 2: App Client 設定確認

「アプリの統合」タブ → アプリクライアント一覧で以下を確認：

- `ALLOW_USER_SRP_AUTH` ✅
- `ALLOW_REFRESH_TOKEN_AUTH` ✅

> SRP = Secure Remote Password。パスワードを直接送らずに安全認証するプロトコル。

---

## STEP 3: パッケージのインストール

```bash
npm install aws-amplify @aws-amplify/ui-react
```

---

## STEP 4: `src/config/awsConfig.ts` を作成

```
src/
├── config/
│   └── awsConfig.ts   ← 新規作成
```

```typescript
// src/config/awsConfig.ts
import { Amplify } from 'aws-amplify';

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
      userPoolClientId: import.meta.env.VITE_COGNITO_CLIENT_ID,
    },
  },
});
```

> Vite では `process.env` の代わりに `import.meta.env` を使います。  
> `VITE_` プレフィックスがついた変数だけブラウザに公開されます。

---

## STEP 5: `.env` に認証情報を記入

プロジェクトルートに `.env` を作成（既にあれば末尾に追記）：

```bash
# .env
VITE_COGNITO_USER_POOL_ID=ap-northeast-1_XXXXXXXXX
VITE_COGNITO_CLIENT_ID=XXXXXXXXXXXXXXXXXXXXXXXXXX
```

> ⚠️ `.env` は **絶対に Git にコミットしない**！  
> `.gitignore` に `.env` が含まれているか確認：`cat .gitignore | grep .env`

型補完のために `src/vite-env.d.ts` に追記：

```typescript
// src/vite-env.d.ts（既存ファイルに追記）
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_COGNITO_USER_POOL_ID: string;
  readonly VITE_COGNITO_CLIENT_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

---

## STEP 6: Zustand 認証ストア実装

```typescript
// src/store/useAuthStore.ts（新規作成）
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
```

---

## STEP 7: ログインページ UI 作成

```typescript
// src/pages/LoginPage.tsx（新規作成）
import { useState } from 'react';
import { Box, Button, TextField, Typography, Alert, CircularProgress, Paper } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useAuthStore } from '../store/useAuthStore';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const login = useAuthStore((s) => s.login);
  const isLoading = useAuthStore((s) => s.isLoading);
  const error = useAuthStore((s) => s.error);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    await login(email, password);
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default' }}>
      <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 400, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <Box sx={{ bgcolor: 'primary.main', borderRadius: '50%', p: 1, display: 'flex' }}>
          <LockOutlinedIcon sx={{ color: 'white' }} />
        </Box>
        <Typography variant="h5" component="h1" fontWeight="bold">Dev Kanban Board</Typography>
        <Typography variant="body2" color="text.secondary">サインインしてください</Typography>

        {error && <Alert severity="error" sx={{ width: '100%' }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField label="メールアドレス" type="email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth required autoFocus />
          <TextField label="パスワード" type="password" value={password} onChange={(e) => setPassword(e.target.value)} fullWidth required />
          <Button type="submit" variant="contained" fullWidth size="large" disabled={isLoading} sx={{ mt: 1 }}>
            {isLoading ? <CircularProgress size={24} color="inherit" /> : 'ログイン'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
```

---

## STEP 8: ProtectedRoute コンポーネント作成

```typescript
// src/components/ProtectedRoute.tsx（新規作成）
import { ReactNode } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { useAuthStore } from '../store/useAuthStore';
import LoginPage from '../pages/LoginPage';

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);

  if (isLoading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) return <LoginPage />;

  return <>{children}</>;
}
```

> このプロジェクトは React Router 未使用なので「条件分岐でログインページを出す」方式にしています。  
> 将来 React Router を使う場合は `<Navigate to="/login" />` に置き換えるだけです。

---

## STEP 9: App.tsx に統合

### 9-1. `src/main.tsx` を更新

```typescript
// src/main.tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './config/awsConfig';  // ← 他の import より前に！
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

> ⚠️ `awsConfig` は **必ず先頭で import** する。Amplify の初期化前に認証処理が走るとエラーになります。

### 9-2. `src/App.tsx` の変更箇所

```typescript
// 追加する import
import { useEffect } from 'react';  // useState の隣に追加
import { useAuthStore } from './store/useAuthStore';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  // 既存コードはそのまま ...

  // ── 認証関連を追加 ──
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const checkAuth = useAuthStore((s) => s.checkAuth);

  useEffect(() => {
    checkAuth(); // ページ読み込み時にセッションを復元
  }, [checkAuth]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {/* ProtectedRoute でアプリ全体をラップ */}
      <ProtectedRoute>
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
          <AppBar position="static" color="default" elevation={1}>
            <Toolbar>
              <Typography variant="h6" component="h1" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
                Dev Kanban Board
              </Typography>
              {/* ユーザーのメールアドレス表示 */}
              {user && (
                <Typography variant="body2" sx={{ mr: 2, color: 'text.secondary' }}>
                  {user.email}
                </Typography>
              )}
              <IconButton onClick={toggleDarkMode} color="inherit">
                {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
              <Button startIcon={<DownloadIcon />} onClick={exportTasks} color="inherit">Export</Button>
              <Button component="label" startIcon={<UploadIcon />} color="inherit">
                Import
                <input type="file" accept="application/json" onChange={(e) => importTasks(e)} hidden />
              </Button>
              {/* ログアウトボタンを追加 */}
              <Button onClick={logout} color="inherit">ログアウト</Button>
            </Toolbar>
          </AppBar>
          {/* 以下は既存コードそのまま */}
          ...
        </Box>
      </ProtectedRoute>
    </ThemeProvider>
  );
}
```

---

## ✅ 動作確認チェックリスト

```
□ npm run dev でエラーなく起動する
□ localhost:5173 を開くとログインページが表示される
□ AWS コンソールで手動作成したユーザーでログインできる
□ ログイン後に Kanban Board が表示される
□ ページをリロードしてもログインが維持される
□ ログアウトボタンでログインページに戻る
```

### テスト用ユーザーの作成方法

1. Cognito ユーザープールを開く
2. 「ユーザー」タブ → 「ユーザーを作成」
3. メールアドレス（例: `test@example.com`）と一時パスワード（例: `Test1234!`）を入力

> 初回ログイン時に「`NEW_PASSWORD_REQUIRED`」エラーが出た場合は以下のコマンドで解消：
> ```bash
> aws cognito-idp admin-set-user-password \
>   --user-pool-id ap-northeast-1_XXXXXXXXX \
>   --username test@example.com \
>   --password "NewPassword123!" \
>   --permanent
> ```

---

## 🚧 よくあるトラブル

| エラー | 原因 | 対処法 |
|--------|------|--------|
| `Amplify has not been configured` | `awsConfig` の import 順序が間違い | `main.tsx` で最初に import する |
| `.env` の値が `undefined` | dev サーバー未再起動 | `Ctrl+C → npm run dev` |
| CORS エラー | ユーザープールID・クライアントID・リージョンの誤り | `.env` の値を再確認 |
| `NotAuthorizedException` | パスワード間違い | 正しいパスワードで再試行 |

---

## 📁 最終的なファイル構成

```
src/
├── config/
│   └── awsConfig.ts        ← 新規
├── store/
│   ├── useTaskStore.ts     ← 変更なし
│   ├── useThemeStore.ts    ← 変更なし
│   └── useAuthStore.ts     ← 新規
├── components/
│   ├── Column.tsx          ← 変更なし
│   ├── TaskCard.tsx        ← 変更なし
│   └── ProtectedRoute.tsx  ← 新規
├── pages/
│   └── LoginPage.tsx       ← 新規
├── main.tsx                ← 変更（awsConfig import 追加）
└── App.tsx                 ← 変更（認証統合）
.env                        ← 新規（.gitignore 済み）
```

---

## 🚀 次のステップ（発展）

| 機能 | 難易度 | キーワード |
|------|--------|-----------|
| サインアップ画面 | ⭐⭐ | `signUp`, `confirmSignUp` |
| パスワードリセット | ⭐⭐ | `resetPassword`, `confirmResetPassword` |
| Google でログイン | ⭐⭐⭐ | Cognito フェデレーティッドアイデンティティ |
| ユーザーごとのタスク管理 | ⭐⭐⭐⭐ | AWS AppSync, DynamoDB |

---

> 📝 **参考ドキュメント**
> - [AWS Amplify JS v6 公式](https://docs.amplify.aws/javascript/build-a-backend/auth/)
> - [Amazon Cognito 開発者ガイド](https://docs.aws.amazon.com/ja_jp/cognito/latest/developerguide/)
> - [Vite 環境変数](https://ja.vite.dev/guide/env-and-mode)
