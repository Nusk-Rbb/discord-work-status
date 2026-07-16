# Discord Work Status

Discord の **Rich Presence**（「〇〇をプレイ中」の表示）を、仕事中・プログラミング中など
好きなステータスに自由に設定できるデスクトップアプリ。Tauri v2 製でクロスプラットフォーム対応。

![status](https://img.shields.io/badge/tauri-v2-5865F2)

## 特徴

- 🎛 **プリセット管理** — 「仕事中」「プログラミング中」「休憩中」などを登録してワンクリックで切替
- ✏️ **自由に編集** — 詳細 / 状態テキスト、大小の画像、経過時間、リンクボタン（最大 2 個）
- 🖼 **画像は URL 直指定 OK** — Portal へのアップロード不要。GIF やアニメ WebP も使える
- 👀 **ライブプレビュー** — Discord での見え方をその場で確認
- 🔌 **セットアップ不要** — Application ID は組み込み済み。起動して「接続」を押すだけ
- 🖥 **トレイ常駐** — ウィンドウを閉じてもバックグラウンドで動き続ける
- 💾 **設定は自動保存** — 次回起動時に前回の状態を復元（自動接続オプションつき）

## Application ID について

接続先の Discord Application ID は `src-tauri/src/rpc.rs` の `CLIENT_ID` に組み込んであるので、
使う側での準備は不要。この ID は公開前提の値（Client Secret や Bot Token とは別物）で、
OAuth URL や招待リンクにもそのまま載るものだから、リポジトリに含めて問題ないよ。

**別のアプリとして表示したい場合**（プレゼンスのタイトルや画像を自分のものにしたい）は、
自分で Application を作って `CLIENT_ID` を差し替えてね。

1. [Discord Developer Portal](https://discord.com/developers/applications) を開く
2. **New Application** でアプリを作成（この**名前がプレゼンスのタイトル**になる。例: `Work`）
3. **General Information** の **Application ID** をコピーして `rpc.rs` の `CLIENT_ID` に貼る

## 画像の指定方法

一番簡単なのは**組み込みアイコンから選ぶ**こと。編集画面の画像欄の下にアイコンが並んでいる
ので、クリックすれば URL が入る。仕事 💼 / プログラミング 💻 / 休憩 ☕ など 12 種類。

自分の画像を使いたいときは、欄に直接書けば OK。3 通りを受け付けるよ。

| 書き方 | 例 | 対応形式 | 備考 |
| --- | --- | --- | --- |
| **組み込みアイコン** | （ピッカーで選択） | PNG | `src/assets/icons/` の画像。設定なしで使える |
| **URL 直指定** | `https://example.com/work.gif` | PNG / JPEG / WebP / **GIF / アニメ WebP / AVIF** | 自分でホストする必要あり。許可ドメインの登録は不要 |
| **アセットキー** | `work` | PNG / JPEG / WebP | Portal の **Rich Presence → Art Assets** にアップロードした画像の名前 |

URL 指定のほうがアニメーション画像も使えて自由度が高い。アセットキーは `CLIENT_ID` の
アプリに紐づく Art Assets から解決されるので、ID を差し替えた場合は画像もそちらに
アップロードし直す必要がある。推奨サイズは 1024 x 1024。

### 組み込みアイコンの仕組み

`src/assets/icons/*.png` の 1 ファイルが 2 役を持つ。

- **Discord に渡すのは raw の URL**（`https://raw.githubusercontent.com/.../src/assets/icons/work.png`）。
  Discord が自分で画像を取りに来るため、ローカルパスではなく公開 URL でないといけない。
  **このリポジトリが public であることが前提**で、private にすると画像が出なくなる。
- **アプリ内のプレビューは同じファイルをローカルから読む**ので、オフラインでも表示される。

アイコンを増やすときは、`src/assets/icons/` に PNG を足して `src/main.js` の
`BUILTIN_ICONS` に 1 行追加する。VS Code の Rich Presence 拡張（[vscord](https://github.com/leonardssh/vscord)）も
同じく raw.githubusercontent.com でアイコンを配っている。

## 自動ビルド（GitHub Actions）

| ワークフロー | いつ動く | 何をする |
| --- | --- | --- |
| `ci.yml` | `main` への push / PR | `cargo fmt --check`、`cargo clippy -D warnings`、`cargo build` |
| `release.yml` | `v*` タグの push | Windows / Linux / macOS のインストーラを作って Release に添付 |

リリースの出し方：

```sh
git tag v0.1.0
git push --tags
```

各 OS のビルドが終わると **下書き（draft）状態の Release** ができるので、中身を確認してから
GitHub 上で publish する。成果物は `.msi` / `.exe`（Windows）、`.deb` / `.AppImage`（Linux）、
`.dmg`（macOS）。

> macOS の `.dmg` は未署名なので、初回起動時に Gatekeeper に弾かれる。
> 右クリック →「開く」で回避できる。署名するには Apple Developer 登録が必要。

NixOS 向けの成果物は作っていない（Tauri の Linux バンドラを使わないため）。
`nix build` でローカルにビルドしてね。

## ライセンス / クレジット

組み込みアイコンは [Noto Emoji](https://github.com/googlefonts/noto-emoji) の絵文字を
512x512 の PNG に書き出したもの。Noto Emoji の画像リソースは Apache License 2.0 で
提供されている（フォント部分は SIL OFL 1.1）。

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

1. アプリを起動し、右上の「**接続**」を押す（起動時に自動接続するオプションもあるよ）
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
