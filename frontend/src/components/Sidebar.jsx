import React, { useEffect, useState, useMemo } from 'react';
import { useChatStore } from '../store/useChatStore';
import SidebarSkeleton from './skeleton/SidebarSkeleton';
import { Users, UsersRound } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

const Sidebar = () => {
  const {
    getUsers,
    users = [], // Default to empty array to prevent map errors
    groups = [],
    getGroups,
    selectedChat,
    setSelectedChat,
    isUsersLoading,
  } = useChatStore();

  const { onlineUsers = [] } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);

  // Use useEffect safely
  useEffect(() => {
    getUsers();
    getGroups();
  }, [getUsers, getGroups]);

  // Memoize filtered users for performance
  const filteredUsers = useMemo(() => {
    const list = Array.isArray(users) ? users : [];
    return showOnlineOnly
      ? list.filter(user => onlineUsers.includes(user._id))
      : list;
  }, [users, showOnlineOnly, onlineUsers]);

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
      
      {/* HEADER */}
      <div className="border-b border-base-300 w-full p-5 shrink-0">
        <div className="flex items-center gap-2">
          <Users className="w-6 h-6" />
          <span className="font-medium hidden lg:block">Contacts</span>
        </div>

        <div className="mt-3 hidden lg:flex items-center gap-2">
          <label className="cursor-pointer flex items-center gap-2">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="checkbox checkbox-sm"
            />
            <span className="text-sm">Show online only</span>
          </label>
          <span className="text-xs text-zinc-500">
            ({Math.max(0, onlineUsers.length - 1)} online)
          </span>
        </div>
      </div>

      {/* SCROLLABLE CONTENT */}
      <div className="overflow-y-auto w-full">
        
        {/* USERS SECTION */}
        <div className="py-3">
          <p className="hidden lg:block px-4 text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wider">
            Users
          </p>
          {filteredUsers.map((user) => (
            <button
              key={user._id}
              onClick={() => setSelectedChat({ type: "private", data: user })}
              className={`
                w-full p-3 flex items-center gap-3 hover:bg-base-300 transition-colors
                ${selectedChat?.type === "private" && selectedChat?.data?._id === user._id ? "bg-base-300 ring-1 ring-base-300" : ""}
              `}
            >
              <div className="relative mx-auto lg:mx-0">
                <img
                  src={user.profilePic || "/avatar.png"}
                  alt={user.fullName}
                  className="size-12 object-cover rounded-full border border-base-300"
                />
                {onlineUsers.includes(user._id) && (
                  <span className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full ring-2 ring-base-100" />
                )}
              </div>

              <div className="hidden lg:block text-left min-w-0 flex-1">
                <div className="font-medium truncate">{user.fullName}</div>
                <div className="text-sm text-zinc-400">
                  {onlineUsers.includes(user._id) ? "Online" : "Offline"}
                </div>
              </div>
            </button>
          ))}
          {filteredUsers.length === 0 && (
            <div className="text-center text-zinc-500 py-4 text-sm italic">No users found</div>
          )}
        </div>

        {/* GROUPS SECTION */}
        <div className="border-t border-base-300 py-3">
          <p className="hidden lg:block px-4 text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wider">
            Groups
          </p>
          {(Array.isArray(groups) ? groups : []).map((group) => (
            <button
              key={group._id}
              onClick={() => setSelectedChat({ type: "group", data: group })}
              className={`
                w-full p-3 flex items-center gap-3 hover:bg-base-300 transition-colors
                ${selectedChat?.type === "group" && selectedChat?.data?._id === group._id ? "bg-base-300 ring-1 ring-base-300" : ""}
              `}
            >
              <div className="mx-auto lg:mx-0 size-12 flex items-center justify-center bg-sky-100 dark:bg-sky-900/30 rounded-full">
                <UsersRound className="size-6 text-sky-500" />
              </div>

              <div className="hidden lg:block text-left min-w-0 flex-1">
                <div className="font-medium truncate">{group.name}</div>
                <div className="text-sm text-zinc-400">
                  {group.members?.length || 0} members
                </div>
              </div>
            </button>
          ))}
          {groups.length === 0 && (
            <div className="text-center text-zinc-500 py-4 text-sm italic">No groups found</div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;