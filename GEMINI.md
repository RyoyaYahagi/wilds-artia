# プロジェクト固有ルール

---

## プロジェクト名: wilds-artia（巨戟アーティア厳選マネージャー）

### 1) 憲法ファイル（必読）
   - ファイルパス: `REPO_ROOT/GEMINI.md`
   - このファイルは必ず最初に読み、すべて遵守すること。

### 2) 言語／ランタイム
   - 言語: TypeScript (Node.js)
   - 推奨実行環境: Node.js 20.x LTS
   - フレームワーク: Next.js 15 (App Router)

### 3) 主要ツール／チェック
   - フォーマッタ: Prettier (Next.js 標準)
   - Linter / 型チェック: ESLint + TypeScript tsc (`npm run lint`)
   - ビルド確認: `npm run build`
   - 開発サーバー: `npm run dev`
   - CI コマンド（必須チェック）: `npm run lint && npm run build`

### 4) ファイル参照形式
   - 参照形式: `path/to/file.tsx:123`（行番号任意）

### 5) コーディング規約（必須）
   - 型注釈: すべてのコンポーネント Props、関数引数・戻り値に型定義必須
   - パス操作: Next.js の `@/` エイリアスを使用
   - コンポーネント: 関数コンポーネント + React Hooks のみ使用
   - スタイリング: Tailwind CSS クラスを使用（インラインスタイル禁止）
   - Docstring: JSDoc 形式、日本語で記述
   - コメント: 複雑なロジックは日本語コメント必須

### 6) エラー処理方針
   - Fail-fast の例外: Error クラスを継承したカスタムエラー
   - ログ方針: console.error は開発時のみ、本番では適切なエラーハンドリング
   - ユーザー向けエラー: 日本語メッセージで表示

### 7) テスト方針
   - テストフレームワーク: 現時点では手動テスト（将来的に Jest + React Testing Library）
   - ネットワーク呼び出し: なし（localStorage ベースのアプリ）
   - 動作確認: ブラウザでの動作確認を必須とする

### 8) その他の注意点
   - 秘密情報: 環境変数は `.env.local` に格納、Git にコミット禁止
   - 依存の固定: `package-lock.json` をコミットに含める
   - UI方針: ダークモード基調、オレンジ系アクセントカラー
   - モバイル対応: レスポンシブデザイン必須（スマホでの操作を想定）
   - データ永続化: localStorage を使用、サーバーサイドでのアクセス禁止（'use client' 必須）

### 9) 出力言語: 日本語

---
