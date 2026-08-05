//! 自動アップデート。
//!
//! GitHub Releases に置いた `latest.json` を見に行き、新しいバージョンがあれば
//! インストーラをダウンロードして適用する。成果物は CI（`release.yml`）で
//! 秘密鍵により署名され、アプリに埋め込んだ公開鍵で検証される。
//!
//! 自動更新に対応するのは Windows(MSI/NSIS) / macOS(.app) / Linux(AppImage) のみ。
//! `.deb` `.rpm` は updater 非対応なので、その場合は手動更新のまま。

use std::sync::Mutex;

use serde::Serialize;
use tauri::{AppHandle, Manager};
use tauri_plugin_updater::{Update, UpdaterExt};

/// 直前の `check_update` で見つかった適用待ちのアップデートを保持する。
/// `check_update` で取得した `Update` を `install_update` で使い回すために持つ。
#[derive(Default)]
pub struct PendingUpdate(pub Mutex<Option<Update>>);

/// フロントに返すアップデート情報。
#[derive(Serialize)]
pub struct UpdateInfo {
    /// 新しいバージョン（例: "0.0.3"）
    version: String,
    /// 現在のバージョン
    current_version: String,
    /// リリースノート（あれば）
    notes: Option<String>,
}

/// 新しいバージョンがあるか確認する。あれば情報を返し、`Update` を state に保持する。
/// 更新が無ければ `None`。updater 非対応環境ではエラー文字列を返す。
#[tauri::command]
pub async fn check_update(app: AppHandle) -> Result<Option<UpdateInfo>, String> {
    let updater = app.updater().map_err(|e| e.to_string())?;
    let maybe_update = updater.check().await.map_err(|e| e.to_string())?;

    match maybe_update {
        Some(update) => {
            let info = UpdateInfo {
                version: update.version.clone(),
                current_version: update.current_version.clone(),
                notes: update.body.clone(),
            };
            // 適用に使うので保持しておく
            if let Some(state) = app.try_state::<PendingUpdate>() {
                *state.0.lock().unwrap() = Some(update);
            }
            Ok(Some(info))
        }
        None => Ok(None),
    }
}

/// 保持しているアップデートをダウンロードして適用し、アプリを再起動する。
/// 事前に `check_update` を呼んでおく必要がある。
#[tauri::command]
pub async fn install_update(app: AppHandle) -> Result<(), String> {
    // state から取り出す（ロックを跨いで await しないよう、ここで move out する）
    let update = {
        let state = app
            .try_state::<PendingUpdate>()
            .ok_or_else(|| "アップデート状態が初期化されていません".to_string())?;
        let mut guard = state.0.lock().unwrap();
        guard
            .take()
            .ok_or_else(|| "適用できるアップデートがありません。先に確認してください".to_string())?
    };

    update
        .download_and_install(|_, _| {}, || {})
        .await
        .map_err(|e| e.to_string())?;

    // Windows では上のインストーラ起動時にプロセスが終了することがあるが、
    // macOS / Linux(AppImage) では戻ってくるので明示的に再起動する。
    // restart() は戻らない（型は `!`）ので、これが実質の終端になる。
    app.restart()
}
