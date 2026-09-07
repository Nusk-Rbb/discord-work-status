# リリース手順

## 自動ビルド（GitHub Actions）

| ワークフロー | いつ動くか | 内容 |
| --- | --- | --- |
| `ci.yml` | `main` への push / PR | `cargo fmt --check`、`cargo clippy -D warnings`、`cargo build` |
| `release.yml` | `v*` タグの push | Windows / macOS / Linux のインストーラを生成し Release に添付 |
| `docs.yml` | `docs/` を含む `main` への push | このドキュメントサイトをビルドして GitHub Pages へデプロイ |

## リリースの流れ

```sh
git tag v0.0.4
git push --tags
```

各 OS のビルドが完了すると **下書き（draft）状態の Release** が作成されるので、内容を確認してから GitHub 上で publish してください。

::: danger draft のままにしない
draft のままだと[自動アップデート](../guide/updates)に反映されません。updater は最新の**公開済み**リリースを見に行くためです。
:::

## メンテナ向け: 署名鍵のセットアップ（初回のみ）

リリースに署名するため、リポジトリの **Settings → Secrets and variables → Actions** に次の Secret を登録してください（`release.yml` が参照します）。

| Secret 名 | 値 |
| --- | --- |
| `TAURI_SIGNING_PRIVATE_KEY` | `tauri signer generate` で作った秘密鍵の中身（base64 文字列） |

鍵をパスワード付きで作った場合は、`release.yml` の `TAURI_SIGNING_PRIVATE_KEY_PASSWORD: ""` を <code v-pre>${{ secrets.TAURI_SIGNING_PRIVATE_KEY_PASSWORD }}</code> に変え、同名の Secret も登録してください。パスワード無しなら空文字のままで動きます（GitHub の Secrets は空値を登録できないため、パスワードはワークフロー内で直接指定しています）。

鍵ペアは次のコマンドで生成できます。

```sh
npm install
npx tauri signer generate -w ~/.tauri/discord-work-status.key
```

出力された公開鍵を `tauri.conf.json` の `plugins.updater.pubkey` に貼り、秘密鍵を上記の Secret に登録します。公開鍵はリポジトリに含めて問題ありませんが、**秘密鍵は絶対にコミットしないでください**。

::: danger 秘密鍵は必ず手元にも保存する
秘密鍵は Secret に登録する前に、必ず手元の安全な場所（パスワードマネージャ等）へ保存してください。

GitHub Secrets は書き込み専用で読み出せないため、手元の控えを失うと鍵は永久に復旧できません。その場合は新しい鍵ペアを作り直すことになり、**既存ユーザー全員が手動で再インストールしない限り自動更新を受け取れなくなります**（署名検証が通らなくなるため）。
:::
