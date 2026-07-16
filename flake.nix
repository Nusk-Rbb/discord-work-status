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
      in
      {
        # NixOS では Tauri の Linux バンドラ（deb/rpm/appimage）は使わない。
        # FHS パス決め打ち・linuxdeploy 依存で動かないため、素直に Nix でパッケージする。
        #   nix build   → ./result/bin/discord-work-status
        #   nix run
        packages.default = pkgs.rustPlatform.buildRustPackage {
          pname = "discord-work-status";
          version = "0.0.2";

          # フロントエンド (../src) も参照するのでリポジトリ全体を src にする。
          # flake なので git 管理下のファイルだけが対象（target/ は .gitignore 済み）。
          src = ./.;

          cargoRoot = "src-tauri";
          buildAndTestSubdir = "src-tauri";
          cargoLock.lockFile = ./src-tauri/Cargo.lock;

          nativeBuildInputs = with pkgs; [
            pkg-config
            wrapGAppsHook3 # GTK/gdk-pixbuf 環境変数のラップ
          ];
          buildInputs = libraries;

          # libappindicator-sys は libayatana-appindicator3.so.1 を実行時に dlopen する。
          # 通常のリンクではないので RPATH では解決されず、LD_LIBRARY_PATH が必要。
          # これが無いとトレイ生成時に panic して起動直後に落ちる。
          preFixup = ''
            gappsWrapperArgs+=(
              --prefix LD_LIBRARY_PATH : "${pkgs.lib.makeLibraryPath [ pkgs.libayatana-appindicator ]}"
            )
          '';

          # フロントは素の HTML/CSS/JS なのでビルド不要。テストも無い。
          doCheck = false;

          meta = with pkgs.lib; {
            description = "Discord Rich Presence を自由に設定できるデスクトップアプリ";
            platforms = platforms.linux;
            mainProgram = "discord-work-status";
          };
        };

        devShells.default = pkgs.mkShell {
          buildInputs = libraries;

          nativeBuildInputs = with pkgs; [
            cargo
            rustc
            rustfmt
            rust-analyzer
            clippy
            cargo-tauri
            nodejs_22
            pkg-config
            gobject-introspection
            wrapGAppsHook3
          ];

          # GTK / gdk-pixbuf まわりの環境変数（GDK_PIXBUF_MODULE_FILE, XDG_DATA_DIRS 等）は
          # nativeBuildInputs の wrapGAppsHook3 の setup-hook が自動設定してくれる。
          #
          # LD_LIBRARY_PATH は「必要な分だけ」通す。webkit や gtk は cc-wrapper が焼く
          # RPATH で解決されるので入れる必要はない（nix + Tauri でよく見る「全部入れる」
          # アドバイスは不要に広い）。libayatana-appindicator だけは libappindicator-sys が
          # 実行時 dlopen するため、これが無いとトレイ生成で panic する。
          shellHook = ''
            export LD_LIBRARY_PATH="${pkgs.lib.makeLibraryPath [ pkgs.libayatana-appindicator ]}''${LD_LIBRARY_PATH:+:$LD_LIBRARY_PATH}"

            # Wayland 環境で描画が崩れる場合の保険（必要に応じてコメント解除）
            # export WEBKIT_DISABLE_COMPOSITING_MODE=1
            # export WEBKIT_DISABLE_DMABUF_RENDERER=1

            echo "🎮 Discord Work Status dev shell"
            echo "   起動:   cargo tauri dev"
            echo "   ビルド: nix build   (Tauri のバンドラは NixOS では使わない)"
          '';
        };
      });
}
