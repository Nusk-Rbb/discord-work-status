---
layout: home

hero:
  name: Discord Work Status
  text: 仕事中のステータスを、Discord に。
  tagline: Rich Presence の「〇〇をプレイ中」を、仕事中・プログラミング中など好きな表示に設定できるデスクトップアプリ。Tauri v2 製で Windows / macOS / Linux に対応しています。
  image:
    src: /icons/work.png
    alt: Discord Work Status
  actions:
    - theme: brand
      text: インストール
      link: /guide/install
    - theme: alt
      text: 使い方
      link: /guide/usage
    - theme: alt
      text: GitHub
      link: https://github.com/Nusk-Rbb/discord-work-status

features:
  - icon: 🗂️
    title: プリセット管理
    details: 「仕事中」「プログラミング中」「休憩中」などを登録して、ワンクリックで切り替えできます。
  - icon: 🎨
    title: 組み込みアイコン 12 種
    details: 仕事 / プログラミング / 休憩 / 会議 / 集中 / 勉強 / 音楽 / ゲーム / 睡眠 / 食事 / 執筆 / 移動 から選ぶだけ。GIF やアニメーション WebP の URL も指定できます。
  - icon: 👀
    title: ライブプレビュー
    details: Discord での見え方を、編集しながらその場で確認できます。
  - icon: 🚀
    title: セットアップ不要
    details: Application ID は組み込み済み。起動して「接続」を押すだけで使えます。
  - icon: 📌
    title: トレイ常駐
    details: ウィンドウを閉じてもバックグラウンドで動作し続けます。起動時の自動接続にも対応。
  - icon: 🔄
    title: 自動アップデート
    details: 新しいバージョンが出ると起動時に通知し、署名を検証したうえで適用します。
---

## 動作要件

Rich Presence は Discord の**ローカル IPC** を利用します。**Discord デスクトップアプリが起動している同じマシン**で実行してください。

- ブラウザ版の Discord では動作しません。
- WSL 内で実行しても、Windows 側の Discord には接続できません。
