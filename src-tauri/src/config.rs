//! 設定・プリセットの永続化（app_config_dir/config.json）。

use std::fs;
use std::path::PathBuf;

use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Manager};

use crate::rpc::ActivityInput;

/// 1 つのプリセット（「仕事中」など、名前付きのアクティビティ設定）。
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Preset {
    pub id: String,
    pub name: String,
    pub activity: ActivityInput,
}

/// アプリの永続設定全体。
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(default, rename_all = "camelCase")]
pub struct AppConfig {
    pub presets: Vec<Preset>,
    pub active_preset_id: Option<String>,
    /// 起動時に自動接続するか。
    pub auto_connect: bool,
}

impl Default for AppConfig {
    fn default() -> Self {
        AppConfig {
            presets: default_presets(),
            active_preset_id: None,
            auto_connect: false,
        }
    }
}

/// 組み込みアイコンの公開 URL の基点。`src/main.js` の `ICON_BASE` と対になっている。
const ICON_BASE: &str =
    "https://raw.githubusercontent.com/Nusk-Rbb/discord-work-status/main/src/assets/icons/";

/// 初回起動時に入っているサンプルプリセット。
fn default_presets() -> Vec<Preset> {
    let mk = |id: &str, name: &str, details: &str, state: &str, large_text: &str, icon: &str| {
        Preset {
            id: id.to_string(),
            name: name.to_string(),
            activity: ActivityInput {
                details: details.to_string(),
                state: state.to_string(),
                large_image: format!("{ICON_BASE}{icon}"),
                large_text: large_text.to_string(),
                show_elapsed: true,
                ..Default::default()
            },
        }
    };
    vec![
        mk(
            "preset-work",
            "仕事中",
            "仕事中",
            "集中してます",
            "Working",
            "work.png",
        ),
        mk(
            "preset-coding",
            "プログラミング中",
            "プログラミング中",
            "コードを書いています",
            "Coding",
            "coding.png",
        ),
        mk(
            "preset-break",
            "休憩中",
            "休憩中",
            "ちょっと一息",
            "Break",
            "break.png",
        ),
    ]
}

fn config_path(app: &AppHandle) -> Result<PathBuf, String> {
    let dir = app.path().app_config_dir().map_err(|e| e.to_string())?;
    Ok(dir.join("config.json"))
}

/// 設定を読み込む。ファイルが無ければデフォルト（サンプルプリセット入り）を返す。
pub fn load(app: &AppHandle) -> Result<AppConfig, String> {
    let path = config_path(app)?;
    if !path.exists() {
        return Ok(AppConfig::default());
    }
    let data = fs::read_to_string(&path).map_err(|e| e.to_string())?;
    serde_json::from_str(&data).map_err(|e| format!("設定の読み込みに失敗しました: {e}"))
}

/// 設定を保存する。
pub fn save(app: &AppHandle, config: &AppConfig) -> Result<(), String> {
    let path = config_path(app)?;
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    let data = serde_json::to_string_pretty(config).map_err(|e| e.to_string())?;
    fs::write(&path, data).map_err(|e| e.to_string())
}
