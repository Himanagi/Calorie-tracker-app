const admin = require("firebase-admin");
const fs = require("fs");

// Load your service account key
const serviceAccount = require("./serviceAccountKey.json");

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Fix entry dates for a single user
async function fixEntryDates(uid) {
  const entriesRef = db.collection("users").doc(uid).collection("entries");
  const snapshot = await entriesRef.get();

  const batch = db.batch();
  snapshot.forEach((doc) => {
    const data = doc.data();
    if (data.createdAt && !data.date) {
      const createdAtDate = data.createdAt.toDate
        ? data.createdAt.toDate()
        : new Date(data.createdAt);
      const dateStr = createdAtDate.toISOString().split("T")[0];
      batch.update(doc.ref, { date: dateStr });
    }
  });

  await batch.commit();
  console.log(`✅ Fixed entry dates for user: ${uid}`);
}

// Fix entry dates for all users
async function fixAllUserEntryDates() {
  const usersSnapshot = await db.collection("users").get();

  for (const userDoc of usersSnapshot.docs) {
    const uid = userDoc.id;
    console.log("🔧 Fixing entries for user:", uid);
    await fixEntryDates(uid);
  }

  console.log("✅ Finished fixing entry dates for all users.");
}

fixAllUserEntryDates().catch(console.error);
