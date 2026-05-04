# Google Calendar & Google Tasks 連携セットアップ

## 必要なもの

- Google アカウント
- 約 10 分

---

## 手順

### 1. Google Cloud Console でプロジェクトを作成

1. [console.cloud.google.com](https://console.cloud.google.com) を開く
2. 右上の「プロジェクトを選択」→「新しいプロジェクト」
3. プロジェクト名を入力（例: `youthsamuku-tool`）→「作成」

---

### 2. API を有効化

1. 左メニュー → 「APIとサービス」→「ライブラリ」
2. 「Google Calendar API」を検索 → 「有効にする」
3. 「Tasks API」を検索 → 「有効にする」

---

### 3. OAuth 同意画面を設定

1. 「APIとサービス」→「OAuth 同意画面」
2. User Type: **外部** を選択 → 「作成」
3. アプリ名・サポートメール・デベロッパー連絡先を入力 → 「保存して次へ」
4. スコープは変更不要 → 「保存して次へ」
5. テストユーザーに自分のメールアドレスを追加 → 「保存して次へ」

---

### 4. OAuth 2.0 クライアント ID を作成

1. 「APIとサービス」→「認証情報」→「+ 認証情報を作成」→「OAuth クライアント ID」
2. アプリケーションの種類: **ウェブアプリケーション**
3. 名前: 任意（例: `youthsamuku-web`）
4. 承認済みの JavaScript オリジン:
   - 開発環境: `http://localhost:3000`
   - 本番環境: あなたのドメイン（例: `https://your-domain.com`）
5. 「作成」→ クライアント ID をコピー

---

### 5. .env.local に設定

プロジェクトルートに `.env.local` を作成（まだない場合）:

```
NEXT_PUBLIC_GOOGLE_CLIENT_ID=xxxxxxxxxxxxxx.apps.googleusercontent.com
```

`npm run dev` で再起動すると連携機能が使えます。

---

## 使い方

1. アプリを開くとサイドバー（PC）または「Googleと連携する」ボタンが表示されます
2. ボタンをクリックすると Google ログインのポップアップが表示されます
3. 連携後にイベントを作成すると:
   - **Google カレンダー**: イベントが自動追加
   - **Google Tasks**: 7 つの集客マイルストーンがタスクリストとして追加
4. 既存イベントはイベント詳細ページの「Googleに同期する」ボタンで追加できます

---

## 注意事項

- アクセストークンはブラウザのセッションストレージに保存され、タブを閉じると消えます（再度ログインが必要）
- トークンの有効期限は 1 時間です
- 同期は一方向（アプリ → Google）のみです
