# インストール

[Releases](https://github.com/Nusk-Rbb/discord-work-status/releases) から、お使いの環境に合わせてダウンロードしてください。

| 環境 | ファイル |
| --- | --- |
| Windows | `.msi`（推奨）または `-setup.exe` |
| macOS (Apple Silicon) | `aarch64.dmg` |
| macOS (Intel) | `x64.dmg` |
| Linux (Debian / Ubuntu) | `.deb` |
| Linux (Fedora / RHEL) | `.rpm` |
| Linux (その他) | `.AppImage` |

::: warning 動作要件
Rich Presence は Discord のローカル IPC を利用します。**Discord デスクトップアプリが起動している同じマシン**で実行してください。ブラウザ版の Discord では動作しません。WSL 内で実行しても Windows 側の Discord には接続できません。
:::

## インストール時の警告について

本アプリは未署名のため、初回インストール時に OS の警告が表示されます。次の手順で続行できます。

- **Windows** — 「WindowsによってPCが保護されました」と表示されたら、「**詳細情報**」→「**実行**」を選択してください。
- **macOS** — Gatekeeper の警告が表示されたら、アプリを**右クリック**して「**開く**」を選択してください。

::: tip なぜ署名しても消えないのか
この警告は有料のコード署名証明書を購入しても解消されません。Microsoft は [SmartScreen のドキュメント](https://learn.microsoft.com/en-us/windows/apps/package-and-deploy/smartscreen-reputation)で「EV 証明書による SmartScreen の回避は既に廃止されている」と明記しており、署名の有無にかかわらず、ダウンロード数に応じた評価が蓄積されるまで警告は表示されます。警告を確実に回避できるのは Microsoft Store 経由の配布のみです。
:::

## 設定の保存先

設定は OS の設定ディレクトリ（`app_config_dir`）配下の `config.json` に保存されます。次回起動時に前回の状態が復元されます。

## 次のステップ

インストールできたら、[使い方](./usage)へ進んでください。
