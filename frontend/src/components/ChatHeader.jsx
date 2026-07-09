import { X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

const formatLastSeen = (date) => {
  if (!date) return "Offline";

  const lastSeen = new Date(date);
  const now = new Date();


  if (isNaN(lastSeen.getTime())) return "Offline";

  const diffMs = now - lastSeen;
  const diffSec = Math.floor(diffMs / 1000);


  if (diffSec < 0) return "Online";


  if (diffSec < 10) {
    return "Last seen just now";
  }


  if (diffSec < 60) {
    return `Last seen ${diffSec} seconds ago`;
  }

 
  const diffMin = Math.floor(diffSec / 60);

  if (diffMin === 1) {
    return "Last seen 1 minute ago";
  }

  if (diffMin < 60) {
    return `Last seen ${diffMin} minutes ago`;
  }

  const time = lastSeen.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });


  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const messageDay = new Date(
    lastSeen.getFullYear(),
    lastSeen.getMonth(),
    lastSeen.getDate()
  );

  const dayDiff = Math.round(
    (today - messageDay) / (1000 * 60 * 60 * 24)
  );


  if (dayDiff === 0) {
    return `Last seen today at ${time}`;
  }


  if (dayDiff === 1) {
    return `Last seen yesterday at ${time}`;
  }


  if (dayDiff < 7) {
    const weekday = lastSeen.toLocaleDateString([], {
      weekday: "long",
    });

    return `Last seen ${weekday} at ${time}`;
  }


  if (lastSeen.getFullYear() === now.getFullYear()) {
    return `Last seen ${lastSeen.toLocaleDateString([], {
      day: "numeric",
      month: "long",
    })} at ${time}`;
  }


  return `Last seen ${lastSeen.toLocaleDateString([], {
    day: "numeric",
    month: "long",
    year: "numeric",
  })} at ${time}`;
};

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
                {onlineUsers.includes(data._id)
                  ? " Online"
                  : formatLastSeen(data.lastSeen)}
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

              {
                selectedChat.type === "group" &&
                selectedChat.data.admin !== authUser._id && (
                  <button
                    onClick={() =>
                      leaveGroup(selectedChat.data._id)
                    }
                  >
                    Leave Group
                  </button>
                )
              }
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
