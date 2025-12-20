import Group from "../models/groupMessage.model.js";

export const createGroup = async (req, res) => {
  try {
    const { name, members } = req.body;
    const adminId = req.user._id;

    const group = await Group.create({
      name,
      admin: adminId,
      members: [adminId, ...members],
    });

    res.status(201).json(group);
  } catch (error) {
    res.status(500).json({ error: "Failed to create group", err: error });
  }
};

export const addMember = async (req, res) => {
  const { groupId, userId } = user.body;
  const adminId = req.user._id;

  const group = await Group.findById(groupId);

  if (group.admin.toString() !== adminId.toString()) {
    return res.status(403).json({ error: "Only admin can add members" });
  }

  if (!group.members.includes(userId)) {
    group.members.push(userId);
    await group.save();
  }

  res.json(group);
};

export const removeMember = async ( req, res ) => {
    const { groupId, memberId } = req.body;
    const adminId = req.user._id;

    const group = await Group.findById(groupId);
    if(!group) return res.status(404).json({ error: "Group not found" });

    if(group.admin.toString() !== adminId.toString()) {
        return res.status(403).json({ error: "Only admin can kick members" });
    }

    group.members = group.members.filter(
        (id) => id.toString() !== memberId
    );

    await group.save();
    res.json(group);

};


export const deleteGroup = async ( req, res ) => {

    const { groupId } = req.params;
    const adminId = req.user._id;

    const group = await Group.findById(groupId);

    if(!group) return res.status(404).json({ error: "Group not found" });

    if(group.admin.toString() !== adminId.toString()) {
        return res.status(403).json({ error: "Only admin can delete group" });
    }

    await Group.findByIdAndDelete(groupId);
    await Message.deleteMany({ groupId });

    res.json({ message: "Group deleted successfully" });

}


export const getGroups = async (req, res) => {
  try {
    const groups = await Group.find({
      members: req.user._id,
    });

    res.status(200).json(groups); // ⚠️ MUST BE ARRAY
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
