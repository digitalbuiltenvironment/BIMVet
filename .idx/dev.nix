{ pkgs, ... }: {
  channel = "stable-23.05"; # "stable-23.05" or "unstable"
  packages = [
    pkgs.nodejs
    pkgs.nodePackages.firebase-tools
  ];
  idx.extensions = [
  ];
  idx.previews = {
    enable = true;
    previews = [
      {
        command = ["npm" "run" "dev" "--" "--port" "$PORT" "--hostname" "0.0.0.0"];
        manager = "web";
        id = "web";
      }
      {
        id = "ios";
        manager = "ios";
      }
    ];
  };
}