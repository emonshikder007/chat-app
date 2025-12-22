import React, { useRef, useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import MessageInput from "./MessageInput";
import ChatHeader from "./ChatHeader";
import MessageSkeleton from "./skeleton/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedChat,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();

  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  // ===== Fetch messages & subscribe =====
  useEffect(() => {
    if (!selectedChat) return;

    getMessages(selectedChat.data._id, selectedChat.type);
    subscribeToMessages(selectedChat.data._id, selectedChat.type);

    return () => unsubscribeFromMessages();
  }, [selectedChat]);

  // ===== Auto scroll to bottom =====
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ===== Loading state =====
  if (isMessagesLoading)
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );

  // ===== No chat selected =====
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
        {(Array.isArray(messages) ? messages : []).map((message, index) => (
          <div
            key={message._id}
            className={`chat ${
              message.senderId === authUser._id ? "chat-end" : "chat-start"
            }`}
          >
            {/* Profile Image */}
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

            {/* Group sender name */}
            {selectedChat.type === "group" &&
              message.senderId !== authUser._id && (
                <div className="text-xs text-zinc-400 ml-2">
                  {message.senderName}
                </div>
              )}

            {/* Message time */}
            <div className="chat-header mb-1">
              <time className="text-x5 opacity-50 ml-1">
                {formatMessageTime(message.createdAt)}
              </time>
            </div>

            {/* Message content */}
            <div className="chat-bubble flex flex-col">
              {message.image && (
                <img
                  src={message.image}
                  alt="Attachment"
                  className="sm:max-w-[200px] rounded-md mb-2"
                />
              )}
              {message.text && <p>{message.text}</p>}
            </div>

            {/* Scroll to bottom ref only on last message */}
            {index === messages.length - 1 && <div ref={messageEndRef} />}
          </div>
        ))}
      </div>

      <MessageInput />
    </div>
  );
};

export default ChatContainer;
