
// seed.js
// Usage: node seed.js
import fs from 'fs';
import readline from 'readline';
import admin from 'firebase-admin';

const serviceAccountPath = './serviceAccountKey.json';
if (!fs.existsSync(serviceAccountPath)) {
  console.error('Missing serviceAccountKey.json in project root.');
  process.exit(1);
}
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath));
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise(r => rl.question(q, r));

async function main() {
  const dmEmail = await ask('Enter your DM email (use the SAME address you will sign up with): ');
  rl.close();

  // Create campaign
  const campRef = db.collection('campaigns').doc();
  const now = admin.firestore.FieldValue.serverTimestamp();
  await campRef.set({
    title: 'Highgrove Age',
    system: '5e-2024',
    ownerUid: 'TO_BE_SET_ON_FIRST_LOGIN',
    isPublic: false,
    createdAt: now, updatedAt: now
  });

  // Members: mark your email (string) so UI can resolve after first login
  await campRef.collection('members').doc('pending-dm').set({
    role: 'dm',
    email: dmEmail,
    joinedAt: now
  });

  const party = [
    { id: 'siron', aliasName: 'Siron', level: 7, currentHP: 58, tempHP: 0, inspiration: 1 },
    { id: 'luca', aliasName: 'Luca', level: 7, currentHP: 54, tempHP: 0, inspiration: 1 },
    { id: 'callahan', aliasName: 'Callahan', level: 7, currentHP: 48, tempHP: 0, inspiration: 1 },
    { id: 'todd', aliasName: 'Todd', level: 7, currentHP: 52, tempHP: 0, inspiration: 1 }
  ];
  for (const p of party) {
    await campRef.collection('party').doc(p.id).set({
      ...p,
      allowPlayerEdit: true,
      updatedAt: now
    });
  }

  const sessionRef = campRef.collection('sessions').doc();
  await sessionRef.set({
    number: 1,
    date: new Date().toISOString().slice(0,10),
    title: 'The Sunlit Pool',
    recap: 'The party met at the pools; new paladin energy in the air.',
    publicRecap: false,
    createdBy: 'seed',
    createdAt: now, updatedAt: now
  });

  console.log('Seed complete.');
  console.log('Campaign ID:', campRef.id);
}

main().catch(e => { console.error(e); process.exit(1); });
