# Efficient Artian Optimizer

[![Deploy to Cloudflare Pages](https://img.shields.io/badge/Deploy-Cloudflare%20Pages-orange)](https://wilds-artia.pages.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**[🎮 アプリを使う](https://wilds-artia.pages.dev)**

Monster Hunter Wilds（モンスターハンターワイルズ）のアーティア武器厳選を効率化するWebアプリケーションです。

## 機能

### 🗡️ 巨戟スキル再付与
- 武器×属性ごとにトラックを作成
- シリーズスキル・グループスキルの記録
- 最適な厳選戦略の計算・可視化
- スキルテーブル（Excel風の全トラック横断表示）

### 🔧 復元強化
- 通常アーティア・巨戟アーティア両対応
- ボーナス種別（攻撃、会心率、属性値、斬れ味、装填）の記録
- ボーナスレベル（Lv1〜EX）の管理

### 📊 最適化機能
- 複数トラックを横断した厳選手順の最適化
- 競合発生時の警告表示
- ステップごとの詳細表示

### 💾 データ管理
- テストデータの読み込み機能
- 削除前自動バックアップ（最新5件保持）
- トースト通知によるフィードバック

## 技術スタック

| カテゴリ       | 技術                  |
| -------------- | --------------------- |
| フレームワーク | React 18 + TypeScript |
| ビルドツール   | Vite 6                |
| スタイリング   | Tailwind CSS 3        |
| アイコン       | Lucide React          |
| データ永続化   | IndexedDB（idb）      |
| Linter         | ESLint 9              |
| ホスティング   | Cloudflare Pages      |

## 開発

### 必要環境
- Node.js 20.x LTS

### セットアップ

```bash
# 依存のインストール
npm install

# 開発サーバー起動
npm run dev

# Lint実行
npm run lint

# ビルド
npm run build

# プレビュー
npm run preview
```

### スクリプト
| コマンド          | 説明                                      |
| ----------------- | ----------------------------------------- |
| `npm run dev`     | 開発サーバー起動（http://localhost:5173） |
| `npm run build`   | TypeScriptチェック + 本番ビルド           |
| `npm run lint`    | ESLint実行                                |
| `npm run preview` | ビルド結果のプレビュー                    |

## プロジェクト構成

```
src/
├── components/     # UIコンポーネント
│   ├── KyogekiSkillMode.tsx  # 巨戟スキル再付与モード
│   ├── RestoreMode.tsx       # 復元強化モード
│   ├── OptimizationChart.tsx # 最適化結果表示
│   ├── SkillTable.tsx        # スキルテーブル
│   ├── TabNav.tsx            # タブナビゲーション
│   ├── ConfirmModal.tsx      # 確認モーダル
│   └── Toast.tsx             # トースト通知
├── hooks/          # カスタムフック
│   ├── useKyogekiSkill.ts    # 巨戟スキルデータ管理
│   └── useRestore.ts         # 復元強化データ管理
├── utils.ts        # 共通ユーティリティ関数
├── types.ts        # TypeScript型定義
├── constants.ts    # 定数定義
├── db.ts           # IndexedDB設定
├── App.tsx         # メインアプリケーション
└── main.tsx        # エントリーポイント
```

## データについて

すべてのデータはブラウザの IndexedDB に保存されます。サーバーへのデータ送信は行われません。

## ライセンス

MIT License

---

*Monster Hunter Wilds および関連する名称・ロゴは株式会社カプコンの商標です。*
