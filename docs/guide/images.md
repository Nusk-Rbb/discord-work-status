# 画像の指定方法

最も簡単なのは**組み込みアイコンから選ぶ**方法です。編集画面の画像欄の下にアイコンが並んでいるので、クリックすると URL が入力されます。

自分の画像を使いたい場合は、欄に直接入力してください。次の 3 通りを受け付けます。

| 書き方 | 例 | 対応形式 | 備考 |
| --- | --- | --- | --- |
| **組み込みアイコン** | （ピッカーで選択） | PNG | `src/assets/icons/` の画像。設定不要で使えます |
| **URL 直指定** | `https://example.com/work.gif` | PNG / JPEG / WebP / **GIF / アニメーション WebP / AVIF** | 画像は自分でホストする必要があります。許可ドメインの登録は不要です |
| **アセットキー** | `work` | PNG / JPEG / WebP | Portal の **Rich Presence → Art Assets** にアップロードした画像の名前 |

URL 指定のほうがアニメーション画像も使えて自由度が高くなっています。アセットキーは `CLIENT_ID` のアプリに紐づく Art Assets から解決されるため、[ID を差し替えた](../dev/application-id)場合は画像もそちらにアップロードし直す必要があります。推奨サイズは 1024 x 1024 です。

## 組み込みアイコン一覧

<div class="icon-gallery">
  <figure><img src="/icons/work.png" alt="仕事"><figcaption>仕事</figcaption></figure>
  <figure><img src="/icons/coding.png" alt="プログラミング"><figcaption>プログラミング</figcaption></figure>
  <figure><img src="/icons/break.png" alt="休憩"><figcaption>休憩</figcaption></figure>
  <figure><img src="/icons/meeting.png" alt="会議"><figcaption>会議</figcaption></figure>
  <figure><img src="/icons/focus.png" alt="集中"><figcaption>集中</figcaption></figure>
  <figure><img src="/icons/study.png" alt="勉強"><figcaption>勉強</figcaption></figure>
  <figure><img src="/icons/music.png" alt="音楽"><figcaption>音楽</figcaption></figure>
  <figure><img src="/icons/gaming.png" alt="ゲーム"><figcaption>ゲーム</figcaption></figure>
  <figure><img src="/icons/sleeping.png" alt="睡眠"><figcaption>睡眠</figcaption></figure>
  <figure><img src="/icons/meal.png" alt="食事"><figcaption>食事</figcaption></figure>
  <figure><img src="/icons/writing.png" alt="執筆"><figcaption>執筆</figcaption></figure>
  <figure><img src="/icons/commute.png" alt="移動"><figcaption>移動</figcaption></figure>
</div>

<style scoped>
.icon-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
  gap: 16px;
  margin: 24px 0;
}
.icon-gallery figure {
  margin: 0;
  text-align: center;
}
.icon-gallery img {
  width: 56px;
  height: 56px;
  margin: 0 auto;
}
.icon-gallery figcaption {
  margin-top: 6px;
  font-size: 13px;
  color: var(--vp-c-text-2);
}
</style>

## 組み込みアイコンの仕組み

`src/assets/icons/*.png` の 1 ファイルが 2 つの役割を持ちます。

- **Discord に渡すのは raw の URL** です（`https://raw.githubusercontent.com/.../src/assets/icons/work.png`）。Discord 自身が画像を取得しに来るため、ローカルパスではなく公開 URL である必要があります。**このリポジトリが public であることが前提**で、private にすると画像が表示されなくなります。
- **アプリ内のプレビューは同じファイルをローカルから読みます**。そのためオフラインでも表示されます。

アイコンを追加する場合は、`src/assets/icons/` に PNG を置いて `src/main.js` の `BUILTIN_ICONS` に 1 行追加してください。VS Code の Rich Presence 拡張（[vscord](https://github.com/leonardssh/vscord)）も同様に raw.githubusercontent.com からアイコンを配信しています。

::: info クレジット
組み込みアイコンは [Noto Emoji](https://github.com/googlefonts/noto-emoji) の絵文字を 512x512 の PNG に書き出したものです。Noto Emoji の画像リソースは Apache License 2.0 で提供されています（フォント部分は SIL OFL 1.1）。
:::
