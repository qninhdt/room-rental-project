import prisma from "../lib/prisma.js";
import bcrypt from "bcrypt";

export const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.status(200).json(users);
  } catch (err) {
    console.log(err);
    res.state(500).json({ message: "failee to get users" });
  }
};

export const getUser = async (req, res) => {
  const id = req.params.id;
  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    res.status(200).json(user);
  } catch (err) {
    console.log(err);
    res.state(500).json({ message: "failed to get user" });
  }
};

export const updateUser = async (req, res) => {
  const id = req.params.id;
  const tokenUserId = req.userId;
  const { password, avatar, ...inputs } = req.body;

  if (id !== tokenUserId) {
    return res.status(403).json({ message: "Not Authorized" });
  }

  let updatedPassword = null;
  try {
    if (password) {
      updatedPassword = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...inputs,
        ...(updatedPassword && { password: updatedPassword }),
        ...(avatar && { avatar }),
      },
    });
    //const { password: userPassword, ...rest } = updatedUser;

    res.status(200).json(updatedUser);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "failed to update users" });
  }
};

export const deleteUser = async (req, res) => {
  const id = req.params.id;
  const tokenUserId = req.userId;

  if (id !== tokenUserId) {
    return res.status(403).json({ message: "Not Authorized" });
  }

  try {
    await prisma.user.delete({
      where: { id },
    });
    res.status(200).json({ message: "User deleted" });
  } catch (err) {
    console.log(err);
    res.state(500).json({ message: "failee to delete user" });
  }
};

export const savePost = async (req, res) => {
  const postId = req.body.postId;
  const tokenUserId = req.userId;

  try {
    const savedPost = await prisma.savedPost.findUnique({
      where: {
        userId_postId: {
          userId: tokenUserId,
          postId,
        },
      },
    });

    if (savedPost) {
      await prisma.savedPost.delete({
        where: {
          id: savedPost.id,
        },
      });
      res.status(200).json({ message: "Post removed from saved list" });
    } else {
      await prisma.savedPost.create({
        data: {
          userId: tokenUserId,
          postId,
        },
      });
      res.status(200).json({ message: "Post saved" });
    }
  } catch (err) {
    console.log(err);
    res.state(500).json({ message: "failed to save" });
  }
};

export const profilePosts = async (req, res) => {
  const tokenUserId = req.userId;
  try {
    const userPosts = await prisma.post.findMany({
      where: { userId: tokenUserId },
    });

    const saved = await prisma.savedPost.findMany({
      where: { userId: tokenUserId },
      include: {
        post: true,
      },
    });

    const savedPosts = saved.map((item) => item.post);
    res.status(200).json({ userPosts, savedPosts });
  } catch (err) {
    console.log(err);
    res.state(500).json({ message: "failed to get profile posts" });
  }
};

export const getNotificationNumber = async (req, res) => {
  const tokenUserId = req.userId;
  try {
    const number = await prisma.chat.count({
      where: {
        userIDs: {
          hasSome: [tokenUserId],
        },
        NOT: {
          seenBy: {
            hasSome: [tokenUserId],
          },
        },
      },
    });
    res.status(200).json(number);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to get profile posts!" });
  }
};

// export const addNewChat = async (req, res) => {
//   const { currentUserId, userId } = req.body;

//   try {
//     const userIDsArray = [currentUserId, userId];

//     // Kiểm tra nếu đã tồn tại cuộc trò chuyện giữa hai user
//     const existingChat = await prisma.chat.findFirst({
//       where: {
//         userIDs: {
//           hasEvery: userIDsArray,
//         },
//       },
//     });

//     if (existingChat) {
//       // Nếu đã có cuộc trò chuyện, trả về thông tin
//       return res.status(200).json({
//         message: "Existing chat found",
//         chatId: existingChat.id,
//         chat: existingChat,
//       });
//     }

//     // Nếu chưa có, tạo cuộc trò chuyện mới
//     const newChat = await prisma.chat.create({
//       data: {
//         userIDs: userIDsArray,
//         users: {
//           connect: userIDsArray.map((id) => ({ id })),
//         },
//       },
//       include: {
//         users: {
//           select: {
//             id: true,
//             username: true,
//             avatar: true,
//           },
//         },
//       },
//     });

//     return res.status(201).json({
//       message: "New chat created",
//       chatId: newChat.id,
//       chat: newChat,
//     });
//   } catch (err) {
//     console.error("Error creating new chat:", err);
//     return res
//       .status(500)
//       .json({ message: "Failed to create chat", error: err.message });
//   }
// };
