// GroupModal.jsx
import React, { useState } from "react";
import toast from "react-hot-toast";
import { useChatStore } from "../store/useChatStore";
import { X } from "lucide-react";

const GroupModal = ({ isOpen, onClose, group }) => {
  const { createGroup, addMember, kickMember, deleteGroup, getGroups } =
    useChatStore();
  const [groupName, setGroupName] = useState("");
  const [userIdToAdd, setUserIdToAdd] = useState("");
  const [userIdToKick, setUserIdToKick] = useState("");

  if (!isOpen) return null;

  const handleCreateGroup = async () => {
    if (!groupName.trim()) return toast.error("Enter group name");
    await createGroup({ name: groupName, members: [] });
    await getGroups();
    setGroupName("");
    onClose();
  };

  const handleAddMember = async () => {
    if (!userIdToAdd) return toast.error("Enter user ID to add");
    await addMember(group._id, userIdToAdd);
    setUserIdToAdd("");
  };

  const handleKickMember = async () => {
    if (!userIdToKick) return toast.error("Enter user ID to kick");
    await kickMember(group._id, userIdToKick);
    setUserIdToKick("");
  };

  const handleDeleteGroup = async () => {
    await deleteGroup(group._id);
    await getGroups();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-base-100 p-5 rounded-lg w-96 relative">
        <button onClick={onClose} className="absolute top-2 right-2">
          <X />
        </button>

        {!group ? (
          <>
            <h3 className="font-medium mb-2">Create Group</h3>
            <input
              type="text"
              placeholder="Group name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="input input-bordered w-full mb-2"
            />
            <button className="btn btn-sm w-full" onClick={handleCreateGroup}>
              Create
            </button>
          </>
        ) : (
          <>
            <h3 className="font-medium mb-2">{group.name} (Admin)</h3>
            <input
              type="text"
              placeholder="User ID to add"
              value={userIdToAdd}
              onChange={(e) => setUserIdToAdd(e.target.value)}
              className="input input-bordered w-full mb-2"
            />
            <button
              className="btn btn-sm w-full mb-2"
              onClick={handleAddMember}
            >
              Add Member
            </button>

            <input
              type="text"
              placeholder="User ID to kick"
              value={userIdToKick}
              onChange={(e) => setUserIdToKick(e.target.value)}
              className="input input-bordered w-full mb-2"
            />
            <button
              className="btn btn-sm w-full mb-2"
              onClick={handleKickMember}
            >
              Kick Member
            </button>

            <button
              className="btn btn-error btn-sm w-full"
              onClick={handleDeleteGroup}
            >
              Delete Group
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default GroupModal;
