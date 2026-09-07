# Application ID について

接続先の Discord Application ID は `src-tauri/src/rpc.rs` の `CLIENT_ID` に組み込まれているため、**利用者側での準備は不要**です。

この ID は公開前提の値であり（Client Secret や Bot Token とは別物です）、OAuth URL や招待リンクにもそのまま含まれるものなので、リポジトリに含めて問題ありません。

## 別のアプリとして表示したい場合

プレゼンスのタイトルや画像を自分のものにしたい場合は、自分で Application を作成して `CLIENT_ID` を差し替えてください。

1. [Discord Developer Portal](https://discord.com/developers/applications) を開きます。
2. **New Application** でアプリを作成します。この**名前がプレゼンスのタイトル**になります。
3. **General Information** の **Application ID** をコピーし、`rpc.rs` の `CLIENT_ID` に貼り付けます。

::: warning アセットキーを使っている場合
[アセットキー](../guide/images)（Art Assets にアップロードした画像名）は `CLIENT_ID` のアプリに紐づいて解決されます。ID を差し替えた場合は、画像も新しいアプリの **Rich Presence → Art Assets** にアップロードし直してください。

`https://` の URL 直指定を使っている場合は、ID を差し替えても影響ありません。
:::
