// /firebase/auth.js
// All Firebase auth helpers. Uses the client in /src/lib/firebase (no /public imports).

import { authPromise } from "/src/lib/firebase/client.js";

async function _authSDK() {
  const auth = await authPromise;
  const mod = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js");
  return { auth, ...mod };
}

export async function login(email, password) {
  const { auth, signInWithEmailAndPassword /*, signOut*/ } = await _authSDK();
  const cred = await signInWithEmailAndPassword(auth, email, password);
  // If you want to force email verification:
  // if (!cred.user.emailVerified) { await signOut(auth); throw new Error('Verify your email first.'); }
  return cred.user;
}

export async function signupWithProfile({ first, last, email, password }) {
  const { auth, createUserWithEmailAndPassword, sendEmailVerification, signOut } = await _authSDK();
  const { dbPromise } = await import("/src/lib/firebase/client.js");
  const db = await dbPromise;
  const { doc, setDoc, serverTimestamp } =
    await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js");

  const cred = await createUserWithEmailAndPassword(auth, email, password);

  await setDoc(doc(db, "users", cred.user.uid), {
    firstName: first, lastName: last, email, createdAt: serverTimestamp()
  });

  try { await sendEmailVerification(cred.user, { url: `${location.origin}/login?verified=1`, handleCodeInApp: false }); } catch {}
  await signOut(auth);
  return true;
}

export async function resendVerification(email, password) {
  const { auth, signInWithEmailAndPassword, sendEmailVerification, signOut } = await _authSDK();
  const { user } = await signInWithEmailAndPassword(auth, email, password);
  if (user.emailVerified) { await signOut(auth); return { alreadyVerified: true }; }
  await sendEmailVerification(user, { url: `${location.origin}/login?verified=1`, handleCodeInApp: false });
  await signOut(auth);
  return { sent: true };
}

export async function forgotPassword(email) {
  const { auth, sendPasswordResetEmail } = await _authSDK();
  await sendPasswordResetEmail(auth, email, { url: `${location.origin}/login`, handleCodeInApp: false });
  return true;
}

export async function onAuthChanged(cb) {
  const { auth, onAuthStateChanged } = await _authSDK();
  return onAuthStateChanged(auth, cb);
}

export async function logout() {
  const { auth, signOut } = await _authSDK();
  await signOut(auth);
}
