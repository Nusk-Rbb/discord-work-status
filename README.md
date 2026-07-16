# Discord Work Status

Discord の **Rich Presence**（「〇〇をプレイ中」の表示）を、仕事中・プログラミング中など
好きなステータスに自由に設定できるデスクトップアプリ。Tauri v2 製でクロスプラットフォーム対応。

![status](https://img.shields.io/badge/tauri-v2-5865F2)

## 特徴

- 🎛 **プリセット管理** — 「仕事中」「プログラミング中」「休憩中」などを登録してワンクリックで切替
- ✏️ **自由に編集** — 詳細 / 状態テキスト、大小の画像、経過時間、リンクボタン（最大 2 個）
- 👀 **ライブプレビュー** — Discord での見え方をその場で確認
- 🔌 **自分のアプリで動く** — Discord Developer Portal で作った Application ID を入れるだけ
- 🖥 **トレイ常駐** — ウィンドウを閉じてもバックグラウンドで動き続ける
- 💾 **設定は自動保存** — 次回起動時に前回の状態を復元（自動接続オプションつき）

## 事前準備：Discord Application を作る

Rich Presence は「自分の Discord アプリ」として表示されるので、まず ID を用意してね。

1. [Discord Developer Portal](https://discord.com/developers/applications) を開く
2. **New Application** でアプリを作成（この**名前がプレゼンスのタイトル**になる。例: `Work`）
3. **General Information** の **Application ID**（= Client ID）をコピー → アプリの上部に貼り付け
4. 画像を使いたい場合は **Rich Presence → Art Assets** に画像をアップロードし、
   その **キー名**を「大画像キー / 小画像キー」に入力する

## 実行方法

### NixOS / Nix（推奨）

```sh
nix develop          # devShell に入る（必要な webkit2gtk などが揃う）
cargo tauri dev      # 開発起動
cargo tauri build    # リリースビルド
```

### その他の環境（手動で依存を入れる場合）

必要ツール: Rust (cargo)、Node.js、Tauri CLI（`cargo install tauri-cli --version '^2'` など）、
および各 OS の [Tauri 前提パッケージ](https://tauri.app/start/prerequisites/)
（Linux は `webkit2gtk-4.1`、`libayatana-appindicator` ほか）。

```sh
cargo tauri dev
cargo tauri build
```

> **重要:** Rich Presence は Discord のローカル IPC に繋ぐため、**Discord 本体が起動している
> 同じマシン**でこのアプリを動かす必要があるよ。WSL 内で動かしても Windows 側の Discord
> には繋がらないので注意（母艦の NixOS / Windows ネイティブで動かしてね）。

## 使い方

1. アプリを起動し、上部に **Application ID** を入力して「接続」
2. 左のプリセットを選ぶ or ＋で新規作成
3. 詳細・状態・画像などを編集（右にプレビュー）
4. 下の「**この状態を適用**」で Discord に反映 ✨
5. 消したいときは「プレゼンスを消す」

設定ファイルは OS の設定ディレクトリ（`app_config_dir`）配下の `config.json` に保存される。

## 構成

```
.
├── src/                 # フロントエンド（素の HTML/CSS/JS、ビルド不要）
│   ├── index.html
│   ├── styles.css
│   └── main.js
├── src-tauri/           # Rust バックエンド
│   ├── src/
│   │   ├── main.rs
│   │   ├── lib.rs       # Tauri コマンド + トレイ
│   │   ├── rpc.rs       # Discord IPC ロジック
│   │   └── config.rs    # 設定の永続化
│   ├── Cargo.toml
│   └── tauri.conf.json
├── flake.nix            # Nix devShell
└── package.json
```

## 技術スタック

- [Tauri v2](https://tauri.app/) — Rust バックエンド + WebView フロント
- [discord-rich-presence](https://crates.io/crates/discord-rich-presence) — Discord IPC
- フロントはフレームワーク無し（`withGlobalTauri` で `window.__TAURI__` を直接利用）
