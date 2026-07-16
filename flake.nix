{
  description = "Discord Work Status — Rich Presence を自由に設定できるデスクトップアプリ (Tauri)";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs { inherit system; };

        # Tauri (webkit2gtk-4.1) のビルド／実行に必要なライブラリ群
        libraries = with pkgs; [
          webkitgtk_4_1
          gtk3
          cairo
          gdk-pixbuf
          glib
          dbus
          openssl
          librsvg
          libsoup_3
          libayatana-appindicator # システムトレイ用
        ];

        buildTools = with pkgs; [
          cargo
          rustc
          rustfmt
          rust-analyzer
          clippy
          cargo-tauri
          nodejs_22
          pkg-config
          gobject-introspection
          wrapGAppsHook
        ];
      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = libraries;
          nativeBuildInputs = buildTools;

          # webkitgtk の実行時ライブラリ解決とトレイ用 gdk-pixbuf ローダ
          shellHook = ''
            export LD_LIBRARY_PATH="${pkgs.lib.makeLibraryPath libraries}:$LD_LIBRARY_PATH"
            export GDK_PIXBUF_MODULE_FILE="$(echo ${pkgs.librsvg.out}/lib/gdk-pixbuf-2.0/*/loaders.cache)"
            export XDG_DATA_DIRS="${pkgs.gtk3}/share/gsettings-schemas/${pkgs.gtk3.name}:$XDG_DATA_DIRS"

            # Niri / Wayland 環境で描画が崩れる場合の保険（必要に応じてコメント解除）
            # export WEBKIT_DISABLE_COMPOSITING_MODE=1
            # export WEBKIT_DISABLE_DMABUF_RENDERER=1

            echo "🎮 Discord Work Status dev shell"
            echo "   起動:  cargo tauri dev"
            echo "   ビルド: cargo tauri build"
          '';
        };
      });
}
