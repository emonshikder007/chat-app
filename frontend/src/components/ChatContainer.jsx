import React, { useRef, useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import MessageInput from "./MessageInput";
import MessageMenu from "./MessageMenu";
import ChatHeader from "./ChatHeader";
import ImageViewer from "./ImageViewer";
import MessageSkeleton from "./skeleton/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";

const ChatContainer = () => {
  const messages = useChatStore((s) => s.messages);
  const getMessages = useChatStore((s) => s.getMessages);
  const isMessagesLoading = useChatStore((s) => s.isMessagesLoading);
  const selectedChat = useChatStore((s) => s.selectedChat);
  const subscribeToMessages = useChatStore((s) => s.subscribeToMessages);
  const unsubscribeFromMessages = useChatStore(
    (s) => s.unsubscribeFromMessages
  );
  const deleteMessage = useChatStore(
    (s) => s.deleteMessage
  );
  const editMessage = useChatStore(
    (s) => s.editMessage
  );

  console.log("STORE CHECK ", {
    getMessages,
    subscribeToMessages,
    unsubscribeFromMessages,
  });

  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const pressTimer = useRef(null);
  const [editText, setEditText] = useState("");

  useEffect(() => {
    if (!selectedChat?.data?._id) return;

    getMessages(selectedChat.data._id, selectedChat.type);
    subscribeToMessages();

    return () => {
      unsubscribeFromMessages();
    };
  }, [selectedChat?.data?._id]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const startLongPress = (message) => {
    if (message.senderId !== authUser._id) return;

    pressTimer.current = setTimeout(() => {
      setSelectedMessage(message);
      setMenuOpen(true);
    }, 600);
  };

  const cancelLongPress = () => {
    clearTimeout(pressTimer.current);
  };

  const handleCopy = async () => {
    if (!selectedMessage?.text) return;

    await navigator.clipboard.writeText(selectedMessage.text);

    toast.success("Message copied!");

    setMenuOpen(false);
    setSelectedMessage(null);
  };

  if (isMessagesLoading)
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );

  if (!selectedChat)
    return (
      <div className="flex-1 flex items-center justify-center text-zinc-400">
        Select a chat to start messaging
      </div>
    );

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {(Array.isArray(messages) ? messages : []).map((message) => (
          <div
            key={message._id}
            className={`chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"
              }`}
            ref={messageEndRef}
          >
            <div className="chat-image avatar">
              <div className="size-10 rounded-full border">
                <img
                  src={
                    message.senderId === authUser._id
                      ? authUser.profilePic || "/avatar.png"
                      : selectedChat.type === "private"
                        ? selectedChat.data.profilePic || "/avatar.png"
                        : "/avatar.png"
                  }
                  alt="Profile Pic"
                />
              </div>
            </div>

            {selectedChat.type === "group" &&
              message.senderId !== authUser._id && (
                <div className="text-xs text-zinc-400 ml-2">
                  {message.senderName}
                </div>
              )}

            <div className="chat-header mb-1">
              <time className="text-x5 opacity-50 ml-1">
                {formatMessageTime(message.createdAt)}
              </time>
            </div>

            <div
              className="chat-bubble flex flex-col"
              onTouchStart={() => startLongPress(message)}
              onTouchEnd={cancelLongPress}
              onTouchMove={cancelLongPress}
              onMouseDown={() => startLongPress(message)}
              onMouseUp={cancelLongPress}
              onMouseLeave={cancelLongPress}
            >
              {message.image && (
                <img
                  src={message.image}
                  alt="Attachment"
                  onClick={() => setSelectedImage(message.image)}
                  className="
                             sm:max-w-[220px]
                             max-w-[180px]
                             rounded-xl
                             mb-2
                             cursor-pointer
                             hover:opacity-90
                             transition
                             duration-200
                          "
                />
              )}
              {message.text && <p>{message.text}</p>}
            </div>
          </div>
        ))}
      </div>

      <ImageViewer
        image={selectedImage}
        onClose={() => setSelectedImage(null)}
      />

      <MessageMenu
        open={menuOpen}
        onClose={() => {
          setMenuOpen(false);
          setSelectedMessage(null);
        }}
        onEdit={() => {
          if (!selectedMessage) return;

          setEditText(selectedMessage.text);

          setMenuOpen(false);

          document.getElementById("edit_modal").showModal();
        }}
        onDelete={() => {
          if (!selectedMessage) return;

          setMenuOpen(false);

          document.getElementById("delete_modal").showModal();
        }}

        onCopy={handleCopy}
      />

      <dialog id="edit_modal" className="modal">
        <div className="modal-box">

          <h3 className="font-bold text-lg flex items-center gap-2">
            ✏️ Edit Message
          </h3>

          <input
            autoFocus
            type="text"
            className="input input-bordered w-full mt-5"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onKeyDown={async (e) => {
              if (e.key === "Enter") {
                await editMessage(selectedMessage._id, editText);

                document.getElementById("edit_modal").close();

                setSelectedMessage(null);
                setEditText("");
              }
            }}
          />

          <div className="modal-action">

            <button
              className="btn"
              onClick={() => {
                document.getElementById("edit_modal").close();
                setSelectedMessage(null);
                setEditText("");
              }}
            >
              Cancel
            </button>

            <button
              className="btn btn-primary"
              onClick={async () => {
                await editMessage(selectedMessage._id, editText);

                document.getElementById("edit_modal").close();

                setSelectedMessage(null);
                setEditText("");
              }}
            >
              Save Changes
            </button>

          </div>

        </div>
      </dialog>

      <dialog id="delete_modal" className="modal">
        <div className="modal-box">

          <h3 className="font-bold text-lg">
            Delete Message?
          </h3>

          <p className="py-3 text-sm opacity-70">
            This action cannot be undone.
          </p>

          <div className="modal-action">

            <button
              className="btn"
              onClick={() =>
                document.getElementById("delete_modal").close()
              }
            >
              Cancel
            </button>

            <button
              className="btn btn-error"
              onClick={async () => {
                await deleteMessage(selectedMessage._id);

                document.getElementById("delete_modal").close();

                setMenuOpen(false);
                setSelectedMessage(null);
              }}
            >
              Delete
            </button>

          </div>

        </div>
      </dialog>

      <MessageInput />
    </div>
  );
};

export default ChatContainer;
