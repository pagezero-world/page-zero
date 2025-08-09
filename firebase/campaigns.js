// /firebase/campaigns.js
// Firestore helpers via /src/lib/firebase client.

import { dbPromise } from "/src/lib/firebase/client.js";

async function _fs() {
  const db = await dbPromise;
  const mod = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js");
  return { db, ...mod };
}

export async function getCampaign(id) {
  const { db, doc, getDoc } = await _fs();
  const snap = await getDoc(doc(db, "campaigns", id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function getParty(id) {
  const { db, collection, query, orderBy, getDocs } = await _fs();
  const q = query(collection(db, "campaigns", id, "party"), orderBy("aliasName"));
  const s = await getDocs(q);
  return s.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getSessions(id) {
  const { db, collection, query, orderBy, limit, getDocs } = await _fs();
  const q = query(collection(db, "campaigns", id, "sessions"), orderBy("date", "desc"), limit(20));
  const s = await getDocs(q);
  return s.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function updateHP(id, charId, newHP) {
  const { db, doc, updateDoc } = await _fs();
  await updateDoc(doc(db, "campaigns", id, "party", charId), { currentHP: newHP, updatedAt: new Date() });
}

export async function toggleRecapVisibility(id, sessionId, state) {
  const { db, doc, updateDoc } = await _fs();
  await updateDoc(doc(db, "campaigns", id, "sessions", sessionId), { publicRecap: !!state, updatedAt: new Date() });
}
