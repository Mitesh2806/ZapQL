import { db, availableAction, availableTrigger } from "./index.js"; // Adjust path if needed

async function main() {
  console.log("🌱 Seeding database...");

  // 1. Seed Triggers
  await db.insert(availableTrigger).values([
    {
      id: "webhook",
      name: "Webhook",
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRI4ZbScZm5qTSrhFjLdiY563n_t7U7nS1u6g&s",
    },
  ]).onConflictDoNothing(); // Prevent errors if run twice

  // 2. Seed Actions
  await db.insert(availableAction).values([
    {
      id: "send-sol",
      name: "Send Solana",
      image: "https://upload.wikimedia.org/wikipedia/en/b/b9/Solana_logo.png",
    },
    {
      id: "email",
      name: "Send Email",
      image: "https://cdn4.iconfinder.com/data/icons/social-media-logos-6/512/112-gmail_email_mail-512.png",
    },
  ]).onConflictDoNothing();

  console.log("✅ Seeding complete!");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});