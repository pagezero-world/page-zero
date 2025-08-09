// src/lib/firebase/client.js
// Single place to initialize Firebase for the browser (CDN SDKs).
// Requires a root-level /firebase-config.js exporting `export default { ... }`

import config from "../../../firebase-config.js";

let _app = null;

export const appPromise = (async () => {
  const { initializeApp, getApps } =
    await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js");
  _app = getApps().length ? getApps()[0] : initializeApp(config);
  return _app;
})();

export const authPromise = (async () => {
  const app = await appPromise;
  const { getAuth } =
    await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js");
  return getAuth(app);
})();

export const dbPromise = (async () => {
  const app = await appPromise;
  const { getFirestore } =
    await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js");
  return getFirestore(app);
})();

/**
 * Fetch role string from users/{uid}.role
 * Returns "dm" | "player" (defaults to "player" on errors/missing).
 */
export async function getUserRole(uid) {
  try {
    const db = await dbPromise;
    const { doc, getDoc } =
      await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js");

    const snap = await getDoc(doc(db, "users", uid));
    const role = snap.exists() ? (snap.data()?.role || "").toString().toLowerCase() : "";
    return role === "dm" ? "dm" : "player";
  } catch (e) {
    console.warn("getUserRole failed; defaulting to player.", e);
    return "player";
  }
}

/** Sign out the current user */
export async function signOutFn() {
  const auth = await authPromise;
  const { signOut } =
    await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js");
  return signOut(auth);
}
