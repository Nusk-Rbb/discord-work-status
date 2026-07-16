mod config;
mod rpc;

use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    AppHandle, Manager, State, WindowEvent,
};

use config::AppConfig;
use rpc::{ActivityInput, RpcState};

// ---- Tauri コマンド（フロントエンドから呼ばれる） ----

#[tauri::command]
fn load_config(app: AppHandle) -> Result<AppConfig, String> {
    config::load(&app)
}

#[tauri::command]
fn save_config(app: AppHandle, config: AppConfig) -> Result<(), String> {
    config::save(&app, &config)
}

#[tauri::command]
fn connect(state: State<RpcState>) -> Result<(), String> {
    rpc::connect(&state)
}

#[tauri::command]
fn disconnect(state: State<RpcState>) -> Result<(), String> {
    rpc::disconnect(&state)
}

#[tauri::command]
fn is_connected(state: State<RpcState>) -> bool {
    rpc::is_connected(&state)
}

#[tauri::command]
fn apply_activity(state: State<RpcState>, activity: ActivityInput) -> Result<(), String> {
    rpc::apply_activity(&state, &activity)
}

#[tauri::command]
fn clear_activity(state: State<RpcState>) -> Result<(), String> {
    rpc::clear_activity(&state)
}

#[tauri::command]
fn quit_app(app: AppHandle) {
    // 切断してから終了
    if let Some(state) = app.try_state::<RpcState>() {
        let _ = rpc::disconnect(&state);
    }
    app.exit(0);
}

/// メインウィンドウを表示して前面に持ってくる。
fn show_main_window(app: &AppHandle) {
    if let Some(w) = app.get_webview_window("main") {
        let _ = w.show();
        let _ = w.unminimize();
        let _ = w.set_focus();
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .manage(RpcState::default())
        .invoke_handler(tauri::generate_handler![
            load_config,
            save_config,
            connect,
            disconnect,
            is_connected,
            apply_activity,
            clear_activity,
            quit_app,
        ])
        .setup(|app| {
            // システムトレイ
            let show_item = MenuItem::with_id(app, "show", "表示", true, None::<&str>)?;
            let quit_item = MenuItem::with_id(app, "quit", "終了", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&show_item, &quit_item])?;

            TrayIconBuilder::with_id("main-tray")
                .tooltip("Discord Work Status")
                .icon(app.default_window_icon().unwrap().clone())
                .menu(&menu)
                .show_menu_on_left_click(false)
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "show" => show_main_window(app),
                    "quit" => {
                        if let Some(state) = app.try_state::<RpcState>() {
                            let _ = rpc::disconnect(&state);
                        }
                        app.exit(0);
                    }
                    _ => {}
                })
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } = event
                    {
                        show_main_window(tray.app_handle());
                    }
                })
                .build(app)?;

            Ok(())
        })
        .on_window_event(|window, event| {
            // ウィンドウを閉じても終了せず、トレイに常駐させる。
            if let WindowEvent::CloseRequested { api, .. } = event {
                let _ = window.hide();
                api.prevent_close();
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
