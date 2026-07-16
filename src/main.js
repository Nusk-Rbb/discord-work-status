"use strict";

const { invoke } = window.__TAURI__.core;
const dialog = window.__TAURI__.dialog;

// ---- アプリ状態 ----
let config = {
  clientId: "",
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
  clientId: $("client-id"),
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
  updatePreview();
  scheduleSave();
}

// ---- プレビュー ----
function updatePreview() {
  const a = readActivity();
  els.pvLarge.textContent = a.largeImage || "🖼";
  els.pvLarge.title = a.largeText || "";
  els.pvSmall.style.display = a.smallImage || a.smallText ? "flex" : "none";
  els.pvSmall.textContent = a.smallImage ? a.smallImage.slice(0, 3) : "•";
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
  const cid = els.clientId.value.trim();
  if (!cid) {
    toast("Client ID を入力してね", "err");
    return;
  }
  try {
    await invoke("connect", { clientId: cid });
    config.clientId = cid;
    scheduleSave();
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
    const cid = els.clientId.value.trim();
    if (!cid) {
      toast("先に Client ID を入れて接続してね", "err");
      return;
    }
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
  els.clientId.addEventListener("input", () => {
    config.clientId = els.clientId.value.trim();
    scheduleSave();
  });
  els.autoConnect.addEventListener("change", () => {
    config.autoConnect = els.autoConnect.checked;
    scheduleSave();
  });
}

// ---- 初期化 ----
async function init() {
  bindEvents();
  try {
    config = await invoke("load_config");
  } catch (e) {
    toast("設定の読み込みに失敗: " + e, "err");
  }
  // 欠損フィールドの補完
  config.presets = config.presets || [];
  els.clientId.value = config.clientId || "";
  els.autoConnect.checked = !!config.autoConnect;

  selectedId =
    config.activePresetId && config.presets.some((p) => p.id === config.activePresetId)
      ? config.activePresetId
      : config.presets[0]?.id || null;

  if (selectedId) selectPreset(selectedId);
  renderPresetList();

  await refreshConnection();

  // 自動接続
  if (config.autoConnect && config.clientId && !connected) {
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
