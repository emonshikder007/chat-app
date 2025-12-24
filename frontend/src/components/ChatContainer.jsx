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

  // 1. Fetch messages when a chat is selected
  useEffect(() => {
    if (!selectedChat?.data?._id) return;

    const fetchMessages = async () => {
      // Ensure we pass the ID and Type correctly
      await getMessages(selectedChat.data._id, selectedChat.type);
      subscribeToMessages();
    };

    fetchMessages();

    // Cleanup subscription on unmount or chat switch
    return () => unsubscribeFromMessages();
  }, [selectedChat?.data?._id, selectedChat?.type, getMessages, subscribeToMessages, unsubscribeFromMessages]);

  // 2. Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // RENDER LOGIC
  
  // Case A: Loading State
  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto h-full">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  // Case B: No Chat Selected (Initial State)
  if (!selectedChat) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full bg-base-100 text-zinc-400 space-y-4">
        <div className="bg-base-200 p-6 rounded-full animate-bounce">
           <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        </div>
        <p className="text-lg font-medium">Select a chat to start messaging</p>
      </div>
    );
  }

  // Case C: Chat Interface
  return (
    <div className="flex-1 flex flex-col overflow-auto h-full">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {(Array.isArray(messages) ? messages : []).map((message) => (
          <div
            key={message._id}
            className={`chat ${
              message.senderId === authUser._id ? "chat-end" : "chat-start"
            }`}
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

            {selectedChat.type === "group" && message.senderId !== authUser._id && (
               <div className="chat-header mb-1 ml-1 text-xs font-bold opacity-70">
                 {message.senderName || "Member"}
               </div>
            )}

            <div className="chat-header mb-1">
              <time className="text-xs opacity-50 ml-1">
                {formatMessageTime(message.createdAt)}
              </time>
            </div>

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
          </div>
        ))}
        {/* Dummy div for auto-scroll target */}
        <div ref={messageEndRef} />
      </div>

      <MessageInput />
    </div>
  );
};

export default ChatContainer;