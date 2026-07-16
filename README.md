# Discord Work Status

Discord の **Rich Presence**（「〇〇をプレイ中」の表示）を、仕事中・プログラミング中など
好きなステータスに設定できるデスクトップアプリです。Tauri v2 製で Windows / macOS / Linux
に対応しています。

![tauri](https://img.shields.io/badge/tauri-v2-5865F2)

## 特徴

- **プリセット管理** — 「仕事中」「プログラミング中」「休憩中」などを登録し、ワンクリックで切り替えできます。
- **組み込みアイコン** — 仕事 / プログラミング / 休憩 / 会議 / 集中 / 勉強 / 音楽 / ゲーム / 睡眠 / 食事 / 執筆 / 移動 の 12 種類から選択できます。
- **カスタム画像** — `https://` の URL を直接指定できます。GIF やアニメーション WebP にも対応しています。
- **ライブプレビュー** — Discord での見え方を編集しながら確認できます。
- **セットアップ不要** — Application ID は組み込み済みです。起動して「接続」を押すだけで使えます。
- **トレイ常駐** — ウィンドウを閉じてもバックグラウンドで動作し続けます。
- **設定の自動保存** — 次回起動時に前回の状態を復元します。起動時に自動接続するオプションもあります。

## インストール

[Releases](https://github.com/Nusk-Rbb/discord-work-status/releases) から、お使いの環境に
合わせてダウンロードしてください。

| 環境 | ファイル |
| --- | --- |
| Windows | `.msi`（推奨）または `-setup.exe` |
| macOS (Apple Silicon) | `aarch64.dmg` |
| macOS (Intel) | `x64.dmg` |
| Linux (Debian / Ubuntu) | `.deb` |
| Linux (Fedora / RHEL) | `.rpm` |
| Linux (その他) | `.AppImage` |

> **動作要件:** Rich Presence は Discord のローカル IPC を利用します。**Discord デスクトップ
> アプリが起動している同じマシン**で実行してください。ブラウザ版の Discord では動作しません。
> WSL 内で実行しても Windows 側の Discord には接続できません。

### インストール時の警告について

本アプリは未署名のため、初回インストール時に OS の警告が表示されます。次の手順で続行できます。

- **Windows** — 「WindowsによってPCが保護されました」と表示されたら、「**詳細情報**」→
  「**実行**」を選択してください。
- **macOS** — Gatekeeper の警告が表示されたら、アプリを**右クリックして「開く」**を選択して
  ください。

> **補足:** この警告は有料のコード署名証明書を購入しても解消されません。Microsoft は
> [SmartScreen のドキュメント](https://learn.microsoft.com/en-us/windows/apps/package-and-deploy/smartscreen-reputation)
> で「EV 証明書による SmartScreen の回避は既に廃止されている」と明記しており、署名の有無に
> かかわらず、ダウンロード数に応じた評価が蓄積されるまで警告は表示されます。警告を確実に
> 回避できるのは Microsoft Store 経由の配布のみです。

## 使い方

1. アプリを起動し、右上の「**接続**」を押します（起動時に自動接続するオプションもあります）。
2. 左のプリセットを選ぶか、＋ で新規作成します。
3. 詳細・状態・画像などを編集します。右側にプレビューが表示されます。
4. 下部の「**この状態を適用**」で Discord に反映されます。
5. 消したいときは「プレゼンスを消す」を押します。

設定は OS の設定ディレクトリ（`app_config_dir`）配下の `config.json` に保存されます。

## 画像の指定方法

最も簡単なのは**組み込みアイコンから選ぶ**方法です。編集画面の画像欄の下にアイコンが並んで
いるので、クリックすると URL が入力されます。

自分の画像を使いたい場合は、欄に直接入力してください。次の 3 通りを受け付けます。

| 書き方 | 例 | 対応形式 | 備考 |
| --- | --- | --- | --- |
| **組み込みアイコン** | （ピッカーで選択） | PNG | `src/assets/icons/` の画像。設定不要で使えます |
| **URL 直指定** | `https://example.com/work.gif` | PNG / JPEG / WebP / **GIF / アニメーション WebP / AVIF** | 画像は自分でホストする必要があります。許可ドメインの登録は不要です |
| **アセットキー** | `work` | PNG / JPEG / WebP | Portal の **Rich Presence → Art Assets** にアップロードした画像の名前 |

URL 指定のほうがアニメーション画像も使えて自由度が高くなっています。アセットキーは
`CLIENT_ID` のアプリに紐づく Art Assets から解決されるため、ID を差し替えた場合は画像も
そちらにアップロードし直す必要があります。推奨サイズは 1024 x 1024 です。

### 組み込みアイコンの仕組み

`src/assets/icons/*.png` の 1 ファイルが 2 つの役割を持ちます。

- **Discord に渡すのは raw の URL** です（`https://raw.githubusercontent.com/.../src/assets/icons/work.png`）。
  Discord 自身が画像を取得しに来るため、ローカルパスではなく公開 URL である必要があります。
  **このリポジトリが public であることが前提**で、private にすると画像が表示されなくなります。
- **アプリ内のプレビューは同じファイルをローカルから読みます**。そのためオフラインでも表示されます。

アイコンを追加する場合は、`src/assets/icons/` に PNG を置いて `src/main.js` の
`BUILTIN_ICONS` に 1 行追加してください。VS Code の Rich Presence 拡張
（[vscord](https://github.com/leonardssh/vscord)）も同様に raw.githubusercontent.com から
アイコンを配信しています。

## Application ID について

接続先の Discord Application ID は `src-tauri/src/rpc.rs` の `CLIENT_ID` に組み込まれている
ため、利用者側での準備は不要です。この ID は公開前提の値であり（Client Secret や Bot Token
とは別物です）、OAuth URL や招待リンクにもそのまま含まれるものなので、リポジトリに含めて
問題ありません。

**別のアプリとして表示したい場合**（プレゼンスのタイトルや画像を自分のものにしたい場合）は、
自分で Application を作成して `CLIENT_ID` を差し替えてください。

1. [Discord Developer Portal](https://discord.com/developers/applications) を開きます。
2. **New Application** でアプリを作成します。この**名前がプレゼンスのタイトル**になります。
3. **General Information** の **Application ID** をコピーし、`rpc.rs` の `CLIENT_ID` に貼り付けます。

## ソースからビルドする

### 必要なもの

- [Rust](https://www.rust-lang.org/tools/install)（cargo）
- 各 OS の前提パッケージ（[Tauri の Prerequisites](https://v2.tauri.app/start/prerequisites/) を参照）

Linux の場合は `webkit2gtk-4.1` と、システムトレイ用の `libayatana-appindicator` が必要です。
Debian / Ubuntu では次のように入ります。

```sh
sudo apt install libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf xdg-utils
```

フロントエンドは素の HTML / CSS / JS でビルド工程を持たないため、Node.js は不要です。

### 手順

```sh
cargo install tauri-cli --version "^2.0.0" --locked

git clone https://github.com/Nusk-Rbb/discord-work-status.git
cd discord-work-status

cargo tauri dev      # 開発用に起動
cargo tauri build    # リリースビルド（インストーラを生成）
```

## 自動ビルド（GitHub Actions）

| ワークフロー | いつ動くか | 内容 |
| --- | --- | --- |
| `ci.yml` | `main` への push / PR | `cargo fmt --check`、`cargo clippy -D warnings`、`cargo build` |
| `release.yml` | `v*` タグの push | Windows / macOS / Linux のインストーラを生成し Release に添付 |

リリースの手順は次のとおりです。

```sh
git tag v0.0.2
git push --tags
```

各 OS のビルドが完了すると **下書き（draft）状態の Release** が作成されるので、内容を確認して
から GitHub 上で publish してください。

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
│   │   └── config.rs    # 設定の永続化
│   ├── Cargo.toml
│   └── tauri.conf.json
├── .github/workflows/   # CI / Release
└── package.json
```

## 技術スタック

- [Tauri v2](https://tauri.app/) — Rust バックエンド + WebView フロントエンド
- [discord-rich-presence](https://crates.io/crates/discord-rich-presence) — Discord IPC
- フロントエンドはフレームワーク無し（`withGlobalTauri` で `window.__TAURI__` を直接利用）

## ライセンス

本ソフトウェアは [MIT License](LICENSE) のもとで提供されています。

### クレジット

組み込みアイコン（`src/assets/icons/`）は [Noto Emoji](https://github.com/googlefonts/noto-emoji)
の絵文字を 512x512 の PNG に書き出したものです。Noto Emoji の画像リソースは Apache
License 2.0 で提供されています（フォント部分は SIL OFL 1.1）。
