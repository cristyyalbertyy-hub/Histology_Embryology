import { assetUrl } from "./assetUrl";

export async function isMediaUrl(path: string): Promise<boolean> {
  try {
    const r = await fetch(assetUrl(path), { method: "HEAD" });
    if (!r.ok) return false;
    const ct = r.headers.get("content-type") ?? "";
    return !ct.includes("text/html");
  } catch {
    return false;
  }
}
