"use strict";

const { invoke } = window.__TAURI__.core;
const dialog = window.__TAURI__.dialog;

// ---- 組み込みアイコン ----
//
// 画像ファイルの実体は src/assets/icons/ の 1 つだけで、2 つの役割を持つ。
//   - Discord に渡すのは ICON_BASE + file の URL。Discord 側が自分で取りに来るため、
//     ローカルパスではなく公開 URL でないといけない（= このリポジトリが public である前提）。
//   - アプリ内プレビューは同じファイルをローカルから読む。オフラインでも出るし、
//     リポジトリを公開する前でも見た目を確認できる。
const ICON_BASE =
  "https://raw.githubusercontent.com/Nusk-Rbb/discord-work-status/main/src/assets/icons/";

const BUILTIN_ICONS = [
  { file: "work.png", label: "仕事" },
  { file: "coding.png", label: "プログラミング" },
  { file: "break.png", label: "休憩" },
  { file: "meeting.png", label: "会議" },
  { file: "focus.png", label: "集中" },
  { file: "study.png", label: "勉強" },
  { file: "music.png", label: "音楽" },
  { file: "gaming.png", label: "ゲーム" },
  { file: "sleeping.png", label: "睡眠" },
  { file: "meal.png", label: "食事" },
  { file: "writing.png", label: "執筆" },
  { file: "commute.png", label: "移動" },
];

const iconUrl = (file) => ICON_BASE + file;
const iconLocalPath = (file) => "assets/icons/" + file;

// 組み込みアイコンの URL ならローカルの実体パスを返す。それ以外（外部 URL）は null。
function localPathForUrl(url) {
  const v = (url || "").trim();
  if (!v.startsWith(ICON_BASE)) return null;
  const file = v.slice(ICON_BASE.length);
  return BUILTIN_ICONS.some((i) => i.file === file) ? iconLocalPath(file) : null;
}

// ---- アプリ状態 ----
let config = {
  presets: [],
  activePresetId: null,
  autoConnect: false,
};
let selectedId = null;
let connected = false;
let saveTimer = null;

// ---- DOM ----
const $ = (id) => document.getElementById(id);
const els = {
  autoConnect: $("auto-connect"),
  statusBadge: $("status-badge"),
  connectBtn: $("connect-btn"),
  presetList: $("preset-list"),
  addPreset: $("add-preset"),
  deletePreset: $("delete-preset"),
  editorTitle: $("editor-title"),
  name: $("f-name"),
  details: $("f-details"),
  state: $("f-state"),
  largeImage: $("f-large-image"),
  largeText: $("f-large-text"),
  smallImage: $("f-small-image"),
  smallText: $("f-small-text"),
  pickerLarge: $("picker-large"),
  pickerSmall: $("picker-small"),
  elapsed: $("f-elapsed"),
  btn1Label: $("f-btn1-label"),
  btn1Url: $("f-btn1-url"),
  btn2Label: $("f-btn2-label"),
  btn2Url: $("f-btn2-url"),
  applyBtn: $("apply-btn"),
  clearBtn: $("clear-btn"),
  toast: $("toast"),
  // preview
  pvLarge: $("pv-large"),
  pvSmall: $("pv-small"),
  pvDetails: $("pv-details"),
  pvState: $("pv-state"),
  pvElapsed: $("pv-elapsed"),
  pvButtons: $("pv-buttons"),
};

// ---- ユーティリティ ----
function toast(msg, type = "ok") {
  els.toast.textContent = msg;
  els.toast.className = `toast show ${type}`;
  clearTimeout(toast._t);
  toast._t = setTimeout(() => {
    els.toast.className = "toast";
  }, 3200);
}

function newId() {
  return "preset-" + Math.random().toString(36).slice(2, 9);
}

function emptyActivity() {
  return {
    details: "",
    state: "",
    largeImage: "",
    largeText: "",
    smallImage: "",
    smallText: "",
    showElapsed: false,
    buttons: [],
  };
}

function currentPreset() {
  return config.presets.find((p) => p.id === selectedId) || null;
}

// ---- 永続化 ----
function scheduleSave() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(saveConfig, 400);
}

async function saveConfig() {
  try {
    await invoke("save_config", { config });
  } catch (e) {
    toast("設定の保存に失敗: " + e, "err");
  }
}

// ---- プリセット一覧の描画 ----
function renderPresetList() {
  els.presetList.innerHTML = "";
  for (const p of config.presets) {
    const li = document.createElement("li");
    li.className = "preset-item" + (p.id === selectedId ? " active" : "");
    li.textContent = p.name || "(名称未設定)";
    li.title = p.name;
    li.addEventListener("click", () => selectPreset(p.id));
    els.presetList.appendChild(li);
  }
  els.deletePreset.disabled = config.presets.length === 0;
}

// ---- フォーム <-> プリセット ----
function selectPreset(id) {
  selectedId = id;
  const p = currentPreset();
  if (!p) {
    clearForm();
    renderPresetList();
    return;
  }
  const a = p.activity || emptyActivity();
  els.name.value = p.name || "";
  els.details.value = a.details || "";
  els.state.value = a.state || "";
  els.largeImage.value = a.largeImage || "";
  els.largeText.value = a.largeText || "";
  els.smallImage.value = a.smallImage || "";
  els.smallText.value = a.smallText || "";
  els.elapsed.checked = !!a.showElapsed;
  const btns = a.buttons || [];
  els.btn1Label.value = btns[0]?.label || "";
  els.btn1Url.value = btns[0]?.url || "";
  els.btn2Label.value = btns[1]?.label || "";
  els.btn2Url.value = btns[1]?.url || "";

  markIconSelected(els.pickerLarge, els.largeImage);
  markIconSelected(els.pickerSmall, els.smallImage);
  renderPresetList();
  updatePreview();
}

function clearForm() {
  [
    els.name, els.details, els.state, els.largeImage, els.largeText,
    els.smallImage, els.smallText, els.btn1Label, els.btn1Url,
    els.btn2Label, els.btn2Url,
  ].forEach((el) => (el.value = ""));
  els.elapsed.checked = false;
  updatePreview();
}

// フォームの内容から activity オブジェクトを組み立てる
function readActivity() {
  const buttons = [];
  if (els.btn1Label.value.trim() && els.btn1Url.value.trim()) {
    buttons.push({ label: els.btn1Label.value.trim(), url: els.btn1Url.value.trim() });
  }
  if (els.btn2Label.value.trim() && els.btn2Url.value.trim()) {
    buttons.push({ label: els.btn2Label.value.trim(), url: els.btn2Url.value.trim() });
  }
  return {
    details: els.details.value,
    state: els.state.value,
    largeImage: els.largeImage.value,
    largeText: els.largeText.value,
    smallImage: els.smallImage.value,
    smallText: els.smallText.value,
    showElapsed: els.elapsed.checked,
    buttons,
  };
}

// フォーム変更時：選択中プリセットへ反映＆保存＆プレビュー更新
function onFormChange() {
  const p = currentPreset();
  if (!p) return;
  p.name = els.name.value;
  p.activity = readActivity();
  // 一覧のラベルだけ更新（全再描画は避ける）
  const items = els.presetList.querySelectorAll(".preset-item");
  const idx = config.presets.indexOf(p);
  if (items[idx]) items[idx].textContent = p.name || "(名称未設定)";
  // URL を手打ちした場合もピッカーの選択状態を合わせる。
  markIconSelected(els.pickerLarge, els.largeImage);
  markIconSelected(els.pickerSmall, els.smallImage);
  updatePreview();
  scheduleSave();
}

// ---- プレビュー ----

// 画像欄は「Art Assets のキー名」と「https:// の直リンク」の両方を受け付ける。
// URL なら実物を出せるので img を描く。キーは実物が手元に無いので名前だけ出す。
// maxChars はキー名が枠からはみ出さないよう小画像側で切り詰めるため。
function setPreviewImage(el, value, fallback, maxChars) {
  const v = (value || "").trim();
  el.replaceChildren();
  if (/^https:\/\//i.test(v)) {
    const img = document.createElement("img");
    // 組み込みアイコンは実体がローカルにあるので、そっちを読んで通信を省く。
    img.src = localPathForUrl(v) || v;
    img.alt = "";
    el.appendChild(img);
    return;
  }
  el.textContent = v ? (maxChars ? v.slice(0, maxChars) : v) : fallback;
}

// ---- アイコンピッカー ----

// 入力欄の現在値と一致する選択肢に印をつける。
function markIconSelected(container, input) {
  const cur = input.value.trim();
  for (const btn of container.querySelectorAll(".icon-choice")) {
    btn.classList.toggle("active", btn.dataset.value === cur);
  }
}

function renderIconPicker(container, input) {
  container.replaceChildren();

  const mk = (value, label, child) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "icon-choice";
    btn.dataset.value = value;
    btn.title = label;
    btn.appendChild(child);
    btn.addEventListener("click", () => {
      input.value = value;
      onFormChange();
      markIconSelected(container, input);
    });
    container.appendChild(btn);
  };

  const none = document.createElement("span");
  none.textContent = "✕";
  mk("", "なし（画像を使わない）", none);

  for (const icon of BUILTIN_ICONS) {
    const img = document.createElement("img");
    img.src = iconLocalPath(icon.file);
    img.alt = icon.label;
    mk(iconUrl(icon.file), icon.label, img);
  }

  markIconSelected(container, input);
}

function updatePreview() {
  const a = readActivity();
  setPreviewImage(els.pvLarge, a.largeImage, "🖼");
  els.pvLarge.title = a.largeText || "";
  els.pvSmall.style.display = a.smallImage || a.smallText ? "flex" : "none";
  setPreviewImage(els.pvSmall, a.smallImage, "•", 3);
  els.pvSmall.title = a.smallText || "";

  els.pvDetails.textContent = a.details || "詳細";
  els.pvDetails.style.opacity = a.details ? "1" : "0.4";
  els.pvState.textContent = a.state || "状態";
  els.pvState.style.opacity = a.state ? "1" : "0.4";
  els.pvElapsed.style.display = a.showElapsed ? "block" : "none";

  els.pvButtons.innerHTML = "";
  for (const b of a.buttons) {
    const div = document.createElement("div");
    div.className = "pv-btn";
    div.textContent = b.label;
    els.pvButtons.appendChild(div);
  }
}

// ---- 接続状態 ----
function setConnected(v) {
  connected = v;
  els.statusBadge.textContent = v ? "接続中" : "未接続";
  els.statusBadge.className = "badge " + (v ? "on" : "off");
  els.connectBtn.textContent = v ? "切断" : "接続";
}

async function refreshConnection() {
  try {
    setConnected(await invoke("is_connected"));
  } catch {
    setConnected(false);
  }
}

async function doConnect() {
  try {
    await invoke("connect");
    setConnected(true);
    toast("Discord に接続したよ", "ok");
  } catch (e) {
    setConnected(false);
    toast(String(e), "err");
  }
}

async function doDisconnect() {
  try {
    await invoke("disconnect");
  } catch {}
  setConnected(false);
  toast("切断したよ", "ok");
}

// ---- 適用 / クリア ----
async function applyCurrent() {
  const p = currentPreset();
  if (!p) {
    toast("プリセットを選んでね", "err");
    return;
  }
  // 未接続なら先に接続を試みる
  if (!connected) {
    await doConnect();
    if (!connected) return;
  }
  try {
    await invoke("apply_activity", { activity: readActivity() });
    config.activePresetId = p.id;
    scheduleSave();
    toast(`「${p.name}」を適用したよ ✨`, "ok");
  } catch (e) {
    toast(String(e), "err");
  }
}

async function clearPresence() {
  try {
    await invoke("clear_activity");
    toast("プレゼンスを消したよ", "ok");
  } catch (e) {
    toast(String(e), "err");
  }
}

// ---- プリセット追加 / 削除 ----
function addPreset() {
  const p = { id: newId(), name: "新しいプリセット", activity: emptyActivity() };
  config.presets.push(p);
  selectPreset(p.id);
  scheduleSave();
}

async function deletePreset() {
  const p = currentPreset();
  if (!p) return;
  let ok = true;
  if (dialog?.ask) {
    ok = await dialog.ask(`「${p.name}」を削除する？`, {
      title: "プリセット削除",
      kind: "warning",
    });
  }
  if (!ok) return;
  config.presets = config.presets.filter((x) => x.id !== p.id);
  selectedId = config.presets[0]?.id || null;
  if (selectedId) selectPreset(selectedId);
  else clearForm();
  renderPresetList();
  scheduleSave();
}

// ---- イベント登録 ----
function bindEvents() {
  const formEls = [
    els.name, els.details, els.state, els.largeImage, els.largeText,
    els.smallImage, els.smallText, els.btn1Label, els.btn1Url,
    els.btn2Label, els.btn2Url,
  ];
  formEls.forEach((el) => el.addEventListener("input", onFormChange));
  els.elapsed.addEventListener("change", onFormChange);

  els.addPreset.addEventListener("click", addPreset);
  els.deletePreset.addEventListener("click", deletePreset);
  els.applyBtn.addEventListener("click", applyCurrent);
  els.clearBtn.addEventListener("click", clearPresence);

  els.connectBtn.addEventListener("click", () =>
    connected ? doDisconnect() : doConnect()
  );
  els.autoConnect.addEventListener("change", () => {
    config.autoConnect = els.autoConnect.checked;
    scheduleSave();
  });
}

// ---- 初期化 ----
async function init() {
  bindEvents();
  renderIconPicker(els.pickerLarge, els.largeImage);
  renderIconPicker(els.pickerSmall, els.smallImage);
  try {
    config = await invoke("load_config");
  } catch (e) {
    toast("設定の読み込みに失敗: " + e, "err");
  }
  // 欠損フィールドの補完
  config.presets = config.presets || [];
  els.autoConnect.checked = !!config.autoConnect;

  selectedId =
    config.activePresetId && config.presets.some((p) => p.id === config.activePresetId)
      ? config.activePresetId
      : config.presets[0]?.id || null;

  if (selectedId) selectPreset(selectedId);
  renderPresetList();

  await refreshConnection();

  // 自動接続
  if (config.autoConnect && !connected) {
    await doConnect();
    if (connected && selectedId) {
      try {
        await invoke("apply_activity", { activity: readActivity() });
        toast("起動時プリセットを適用したよ ✨", "ok");
      } catch (e) {
        toast(String(e), "err");
      }
    }
  }
}

window.addEventListener("DOMContentLoaded", init);
