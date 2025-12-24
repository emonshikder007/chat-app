import express from "express";
import { createGroup, addMember, removeMember, deleteGroup, getGroups } from "../controllers/group.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/create", protectRoute, createGroup);
router.post("/add-member", protectRoute, addMember);
router.post("/kick", protectRoute, removeMember);
router.delete("/:groupId", protectRoute, deleteGroup);
router.get("/grps", protectRoute, getGroups);


export default router;