import { X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

const ChatHeader = () => {
  const { selectedChat, setSelectedChat } = useChatStore();
  const { onlineUsers, authUser } = useAuthStore();

  if (!selectedChat) return null;

  const isPrivate = selectedChat.type === "private";
  const data = selectedChat.data;
  const isAdmin =
    selectedChat.type === "group" &&
    data.admin === authUser._id;
  console.log(selectedChat);

  return (
    <div className="p-2.5 border-b border-base-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="avatar">
            <div className="size-10 rounded-full relative">
              <img
                src={
                  isPrivate ? data.profilePic || "/avatar.png" : "/avatar.png"
                }
                alt={isPrivate ? data.fullName : data.name}
              />
            </div>
          </div>

          <div>
            <h3 className="font-medium">
              {isPrivate ? data.fullName : data.name}
            </h3>
            {isPrivate && (
              <p className="text-sm text-base-content/70">
                {onlineUsers.includes(data._id) ? "Online" : "Offline"}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {selectedChat.type === "group" && isAdmin && (
            <>
              <button
                className="btn btn-xs"
                onClick={() => {
                  const userId = prompt("Enter User ID to add");
                  if (!userId) return;

                  useChatStore
                    .getState()
                    .addMember(selectedChat.data._id, userId);
                }}
              >
                Add
              </button>

              <button
                className="btn btn-xs btn-warning"
                onClick={() => {
                  const memberId = prompt("Enter User ID to kick");
                  if (!memberId) return;

                  useChatStore
                    .getState()
                    .kickMember(selectedChat.data._id, memberId);
                }}
              >
                Kick
              </button>

              <button
                className="btn btn-xs btn-error"
                onClick={() => {
                  const ok = confirm("Delete this group?");
                  if (!ok) return;

                  useChatStore
                    .getState()
                    .deleteGroup(selectedChat.data._id);
                }}
              >
                Delete
              </button>
            </>
          )}

          <button
            className="cursor-pointer"
            onClick={() => setSelectedChat(null)}
          >
            <X />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
