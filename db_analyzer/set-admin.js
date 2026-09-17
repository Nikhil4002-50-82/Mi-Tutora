const admin = require("firebase-admin");
const serviceAccount = require("./tutor-app-1e394-firebase-adminsdk-fbsvc-229cb7c69a.json");

if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}

const db = admin.firestore();
const auth = admin.auth();

async function manageAdmin() {
  const action = process.argv[2]; // "add" or "remove"
  const email = process.argv[3]; // user email

  if (!action || !email) {
    console.log("Usage: node set-admin.js <add|remove> <email>");
    process.exit(1);
  }

  try {
    const user = await auth.getUserByEmail(email);
    const userRef = db.collection("users").doc(user.uid);
    const snap = await userRef.get();
    const data = snap.exists ? snap.data() : {};
    let roles = Array.isArray(data.roles) ? [...data.roles] : ["student"];

    if (action === "add") {
      if (!roles.includes("admin")) roles.push("admin");
      await userRef.set({ role: "admin", roles }, { merge: true });
      await auth.setCustomUserClaims(user.uid, { admin: true, role: "admin" });
      console.log(`Successfully granted ADMIN privileges to ${email}`);
    } else if (action === "remove") {
      roles = roles.filter((r) => r !== "admin");
      await userRef.set({ role: roles[0] || "student", roles }, { merge: true });
      await auth.setCustomUserClaims(user.uid, { admin: false });
      console.log(`Successfully removed ADMIN privileges from ${email}`);
    }
  } catch (err) {
    console.error("Error:", err.message);
  }
}

manageAdmin();
