import { X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

const ChatHeader = () => {
  const { selectedChat, setSelectedChat } = useChatStore();
  const { onlineUsers } = useAuthStore();

  if (!selectedChat) return null;

  const isPrivate = selectedChat.type === "private";
  const data = selectedChat.data;

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

        <button
          className="cursor-pointer"
          onClick={() => setSelectedChat(null)}
        >
          <X />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
