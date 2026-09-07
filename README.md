# Discord Work Status

Discord の **Rich Presence**（「〇〇をプレイ中」の表示）を、仕事中・プログラミング中など
好きなステータスに設定できるデスクトップアプリです。Tauri v2 製で Windows / macOS / Linux
に対応しています。

[![tauri](https://img.shields.io/badge/tauri-v2-5865F2)](https://tauri.app/)
[![license](https://img.shields.io/badge/license-MIT-green)](LICENSE)

**📖 ドキュメント: <https://nusk-rbb.github.io/discord-work-status/>**

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
合わせてダウンロードしてください（Windows: `.msi` / macOS: `.dmg` / Linux: `.deb` `.rpm`
`.AppImage`）。

詳しい手順と、初回インストール時に出る OS の警告への対処は
[インストールガイド](https://nusk-rbb.github.io/discord-work-status/guide/install)を参照して
ください。

> **動作要件:** Rich Presence は Discord のローカル IPC を利用します。**Discord デスクトップ
> アプリが起動している同じマシン**で実行してください。ブラウザ版の Discord では動作しません。

## ドキュメント

| ページ | 内容 |
| --- | --- |
| [インストール](https://nusk-rbb.github.io/discord-work-status/guide/install) | ダウンロードと、OS の警告への対処 |
| [使い方](https://nusk-rbb.github.io/discord-work-status/guide/usage) | プリセットの編集と適用 |
| [画像の指定方法](https://nusk-rbb.github.io/discord-work-status/guide/images) | 組み込みアイコン / URL 直指定 / アセットキー |
| [自動アップデート](https://nusk-rbb.github.io/discord-work-status/guide/updates) | 対応形式と署名の検証 |
| [ソースからビルドする](https://nusk-rbb.github.io/discord-work-status/dev/build) | 開発環境のセットアップと構成 |
| [Application ID](https://nusk-rbb.github.io/discord-work-status/dev/application-id) | 別のアプリとして表示したい場合 |
| [リリース手順](https://nusk-rbb.github.io/discord-work-status/dev/release) | タグ push と署名鍵の管理 |

## ソースからビルドする

```sh
cargo install tauri-cli --version "^2.0.0" --locked

git clone https://github.com/Nusk-Rbb/discord-work-status.git
cd discord-work-status

cargo tauri dev      # 開発用に起動
cargo tauri build    # リリースビルド（インストーラを生成）
```

前提パッケージなどは[ビルドガイド](https://nusk-rbb.github.io/discord-work-status/dev/build)を
参照してください。フロントエンドは素の HTML / CSS / JS でビルド工程を持たないため、アプリの
ビルドに Node.js は不要です。

## ライセンス

本ソフトウェアは [MIT License](LICENSE) のもとで提供されています。

組み込みアイコン（`src/assets/icons/`）は
[Noto Emoji](https://github.com/googlefonts/noto-emoji) の絵文字を 512x512 の PNG に
書き出したものです。Noto Emoji の画像リソースは Apache License 2.0 で提供されています
（フォント部分は SIL OFL 1.1）。
