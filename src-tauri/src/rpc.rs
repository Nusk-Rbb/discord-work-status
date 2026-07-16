//! Discord Rich Presence（IPC）まわりの状態とロジック。

use std::sync::Mutex;
use std::time::{SystemTime, UNIX_EPOCH};

use discord_rich_presence::{activity, DiscordIpc, DiscordIpcClient};
use serde::{Deserialize, Serialize};

/// アプリ全体で共有する RPC の状態。
///
/// `client` は Discord に接続中の IPC クライアント。未接続なら `None`。
/// `elapsed_start` は「経過時間」表示を有効にした時刻（Unix 秒）。
/// アクティビティを更新しても経過タイマーが巻き戻らないよう保持しておく。
#[derive(Default)]
pub struct RpcState {
    pub client: Mutex<Option<DiscordIpcClient>>,
    pub client_id: Mutex<Option<String>>,
    pub elapsed_start: Mutex<Option<i64>>,
}

/// フロントエンドから受け取るアクティビティ 1 件分の入力。
#[derive(Debug, Default, Clone, Serialize, Deserialize)]
#[serde(default, rename_all = "camelCase")]
pub struct ActivityInput {
    pub details: String,
    pub state: String,
    pub large_image: String,
    pub large_text: String,
    pub small_image: String,
    pub small_text: String,
    pub show_elapsed: bool,
    pub buttons: Vec<ButtonInput>,
}

#[derive(Debug, Default, Clone, Serialize, Deserialize)]
#[serde(default, rename_all = "camelCase")]
pub struct ButtonInput {
    pub label: String,
    pub url: String,
}

fn now_unix() -> i64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_secs() as i64)
        .unwrap_or(0)
}

/// Discord に接続する。既存の接続があれば閉じてから繋ぎ直す。
pub fn connect(state: &RpcState, client_id: &str) -> Result<(), String> {
    let cid = client_id.trim();
    if cid.is_empty() {
        return Err("Client ID が空です".into());
    }

    // 既存接続を閉じる
    if let Some(mut old) = state.client.lock().unwrap().take() {
        let _ = old.close();
    }

    let mut client = DiscordIpcClient::new(cid).map_err(|e| e.to_string())?;
    client.connect().map_err(|e| {
        format!("Discord に接続できませんでした（Discord が起動しているか確認してね）: {e}")
    })?;

    *state.client.lock().unwrap() = Some(client);
    *state.client_id.lock().unwrap() = Some(cid.to_string());
    *state.elapsed_start.lock().unwrap() = None;
    Ok(())
}

/// Discord から切断する。
pub fn disconnect(state: &RpcState) -> Result<(), String> {
    if let Some(mut client) = state.client.lock().unwrap().take() {
        let _ = client.close();
    }
    *state.client_id.lock().unwrap() = None;
    *state.elapsed_start.lock().unwrap() = None;
    Ok(())
}

pub fn is_connected(state: &RpcState) -> bool {
    state.client.lock().unwrap().is_some()
}

/// アクティビティ（プレゼンス）を適用する。
pub fn apply_activity(state: &RpcState, input: &ActivityInput) -> Result<(), String> {
    let mut guard = state.client.lock().unwrap();
    let client = guard
        .as_mut()
        .ok_or("Discord に接続していません")?;

    // 経過時間の開始時刻を決める。
    // 有効なら初回のみ現在時刻を記録し、以降は同じ値を使い回す。
    let start_ts: Option<i64> = if input.show_elapsed {
        let mut es = state.elapsed_start.lock().unwrap();
        if es.is_none() {
            *es = Some(now_unix());
        }
        *es
    } else {
        *state.elapsed_start.lock().unwrap() = None;
        None
    };

    // すべての参照は `input`（所有される引数）とローカル変数から借りるため、
    // set_activity を呼ぶこのスコープ内で有効。
    let mut act = activity::Activity::new();

    let details = input.details.trim();
    if !details.is_empty() {
        act = act.details(details);
    }
    let act_state = input.state.trim();
    if !act_state.is_empty() {
        act = act.state(act_state);
    }

    let large_image = input.large_image.trim();
    let large_text = input.large_text.trim();
    let small_image = input.small_image.trim();
    let small_text = input.small_text.trim();
    let mut assets = activity::Assets::new();
    let mut has_assets = false;
    if !large_image.is_empty() {
        assets = assets.large_image(large_image);
        has_assets = true;
    }
    if !large_text.is_empty() {
        assets = assets.large_text(large_text);
        has_assets = true;
    }
    if !small_image.is_empty() {
        assets = assets.small_image(small_image);
        has_assets = true;
    }
    if !small_text.is_empty() {
        assets = assets.small_text(small_text);
        has_assets = true;
    }
    if has_assets {
        act = act.assets(assets);
    }

    if let Some(ts) = start_ts {
        act = act.timestamps(activity::Timestamps::new().start(ts));
    }

    // Discord はボタン最大 2 個まで。ラベルと URL が両方揃っているものだけ。
    let buttons: Vec<activity::Button> = input
        .buttons
        .iter()
        .filter(|b| !b.label.trim().is_empty() && !b.url.trim().is_empty())
        .take(2)
        .map(|b| activity::Button::new(b.label.trim(), b.url.trim()))
        .collect();
    if !buttons.is_empty() {
        act = act.buttons(buttons);
    }

    client.set_activity(act).map_err(|e| e.to_string())?;
    Ok(())
}

/// プレゼンスを消す（アクティビティ非表示）。
pub fn clear_activity(state: &RpcState) -> Result<(), String> {
    let mut guard = state.client.lock().unwrap();
    let client = guard
        .as_mut()
        .ok_or("Discord に接続していません")?;
    client.clear_activity().map_err(|e| e.to_string())?;
    *state.elapsed_start.lock().unwrap() = None;
    Ok(())
}
