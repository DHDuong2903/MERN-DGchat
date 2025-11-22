import dotenv from "dotenv";
import mongoose from "mongoose";
import { Conversation } from "./src/models/Conversation.js";

dotenv.config();

async function fixGroupField() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB");

    // Find all conversations with corrupted group field
    const allConversations = await Conversation.find({}).lean();

    console.log(`\nTotal conversations: ${allConversations.length}`);

    for (const conv of allConversations) {
      console.log(`\nConversation ${conv._id}:`);
      console.log("  Type:", conv.type);
      console.log("  Group:", conv.group);
      console.log("  Group type:", typeof conv.group, Array.isArray(conv.group) ? "(ARRAY - CORRUPTED)" : "");

      // Fix if group is array or invalid
      if (conv.type === "direct") {
        if (conv.group) {
          await Conversation.updateOne({ _id: conv._id }, { $unset: { group: "" } });
          console.log("  ✓ Removed group field from direct conversation");
        }
      } else if (conv.type === "group") {
        if (Array.isArray(conv.group) || !conv.group || !conv.group.name) {
          const defaultName = `Nhóm ${conv.participants.length} thành viên`;
          await Conversation.updateOne(
            { _id: conv._id },
            {
              $set: {
                group: {
                  name: defaultName,
                  createdBy: conv.participants[0].userId,
                },
              },
            }
          );
          console.log(`  ✓ Fixed group field with name: "${defaultName}"`);
        }
      }
    }

    console.log("\nDone!");
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

fixGroupField();
