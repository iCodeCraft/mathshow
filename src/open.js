import { execFile } from "node:child_process";
import { pathToFileURL } from "node:url";

export function shouldOpen({ openFlag, env = process.env }) {
  if (!openFlag) return false;
  if (env.MATHSHOW_NO_OPEN === "1") return false;
  if (env.CI === "true") return false;
  return true;
}

export function openPreview(htmlPath) {
  const url = pathToFileURL(htmlPath).href;
  const platform = process.platform;
  const cmd =
    platform === "darwin"
      ? ["open", [url]]
      : platform === "win32"
        ? ["cmd", ["/c", "start", "", url]]
        : ["xdg-open", [url]];

  return new Promise((resolve) => {
    execFile(cmd[0], cmd[1], { windowsHide: true }, (err) => {
      resolve(!err);
    });
  });
}
