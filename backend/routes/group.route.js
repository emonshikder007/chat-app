import express from "express";
import { createGroup, addMember, removeMember, deleteGroup, getGroups, leaveGroup } from "../controllers/group.controller.js";
import { sendGroupMessage } from "../controllers/message.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/create", protectRoute, createGroup);
router.post("/add-member", protectRoute, addMember);
router.post("/kick", protectRoute, removeMember);
router.delete("/:groupId", protectRoute, deleteGroup);
router.post("/:groupId/send", protectRoute, sendGroupMessage);
router.get("/grps", protectRoute, getGroups);
router.post("/leave", protectRoute, leaveGroup);


export default router;