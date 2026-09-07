# ソースからビルドする

## 必要なもの

- [Rust](https://www.rust-lang.org/tools/install)（cargo）
- 各 OS の前提パッケージ（[Tauri の Prerequisites](https://v2.tauri.app/start/prerequisites/) を参照）

Linux の場合は `webkit2gtk-4.1` と、システムトレイ用の `libayatana-appindicator` が必要です。Debian / Ubuntu では次のように入ります。

```sh
sudo apt install libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf xdg-utils
```

フロントエンドは素の HTML / CSS / JS でビルド工程を持たないため、**Node.js は不要**です。

## 手順

```sh
cargo install tauri-cli --version "^2.0.0" --locked

git clone https://github.com/Nusk-Rbb/discord-work-status.git
cd discord-work-status

cargo tauri dev      # 開発用に起動
cargo tauri build    # リリースビルド（インストーラを生成）
```

## 構成

```
.
├── src/                 # フロントエンド（素の HTML/CSS/JS、ビルド不要）
│   ├── assets/icons/    # 組み込みアイコン（Discord へは raw URL で渡す）
│   ├── index.html
│   ├── styles.css
│   └── main.js
├── src-tauri/           # Rust バックエンド
│   ├── src/
│   │   ├── main.rs
│   │   ├── lib.rs       # Tauri コマンド + トレイ
│   │   ├── rpc.rs       # Discord IPC ロジック / CLIENT_ID
│   │   ├── update.rs    # 自動アップデート（updater プラグイン）
│   │   └── config.rs    # 設定の永続化
│   ├── Cargo.toml
│   └── tauri.conf.json
├── docs/                # このドキュメントサイト（VitePress）
├── .github/workflows/   # CI / Release / Docs
└── package.json
```

## 技術スタック

- [Tauri v2](https://tauri.app/) — Rust バックエンド + WebView フロントエンド
- [discord-rich-presence](https://crates.io/crates/discord-rich-presence) — Discord IPC
- フロントエンドはフレームワーク無し（`withGlobalTauri` で `window.__TAURI__` を直接利用）

## ドキュメントサイトをローカルで動かす

このサイト自体は `docs/` 配下の VitePress プロジェクトです。アプリのビルドとは独立しています。

```sh
cd docs
npm install
npm run docs:dev      # http://localhost:5173/discord-work-status/
npm run docs:build    # 静的ファイルを生成
npm run docs:preview  # 生成結果を確認
```
