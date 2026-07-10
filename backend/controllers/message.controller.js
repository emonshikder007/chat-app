import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import Group from "../models/groupMessage.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.log("Error in getUsersForSidebar:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });
    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl;

    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      chatType: "private",
      text,
      image: imageUrl,
    });

    await newMessage.save();



    const receiverSocketId = getReceiverSocketId(receiverId);

    console.log("Receiver Socket:", receiverSocketId);

    if (receiverSocketId) {
      console.log("EMITTING...");
      io.to(receiverSocketId).emit("newMessage", newMessage);
    } else {
      console.log("SOCKET NOT FOUND");
    }


    res.status(201).json(newMessage);
  } catch (error) {

    res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const sendGroupMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { groupId } = req.params;
    const senderId = req.user._id;

    const newMessage = await Message.create({
      senderId,
      groupId,
      chatType: "group",
      text,
      image,
    });

    const group = await Group.findById(groupId);

    group.members.forEach((memberId) => {
      const socketId = getReceiverSocketId(memberId.toString());
      if (socketId) {
        io.to(socketId).emit("newGroupMessage", newMessage);
      }
    });

    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};


export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        error: "Message not found",
      });
    }

    // Only sender can delete the message
    if (message.senderId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: "Unauthorized",
      });
    }

    // Delete from database
    await Message.findByIdAndDelete(messageId);

    // =========================
    // REAL-TIME DELETE
    // =========================
    if (message.chatType === "private") {

      // Receiver
      const receiverSocketId = getReceiverSocketId(
        message.receiverId.toString()
      );

      if (receiverSocketId) {
        io.to(receiverSocketId).emit("messageDeleted", {
          messageId,
        });
      }

      // Sender
      const senderSocketId = getReceiverSocketId(
        message.senderId.toString()
      );

      if (senderSocketId) {
        io.to(senderSocketId).emit("messageDeleted", {
          messageId,
        });
      }
    }

    res.status(200).json({
      success: true,
      messageId,
    });

  } catch (error) {
    console.log("Delete Message Error:", error);

    res.status(500).json({
      error: "Internal server error",
    });
  }
};