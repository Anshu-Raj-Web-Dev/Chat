import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getMessages, getUsersForSidebar, sendMessage, updateMessage, deleteMessage } from "../controllers/message.controller.js";

const router = express.Router();

// Existing routes
router.get("/users", protectRoute, getUsersForSidebar);
router.get("/:id", protectRoute, getMessages);
router.post("/send/:id", protectRoute, sendMessage);
router.put("/update/:messageId", protectRoute, updateMessage);
router.delete("/delete/:messageId", protectRoute, deleteMessage);

export default router;
