import prisma from "../lib/prisma.js";

export const getChats = async (req, res) => {
  const tokenUserId = req.userId;
  try {
    const chats = await prisma.chat.findMany({
      where: {
        userIDs: {
          hasSome: [tokenUserId],
        },
      },
    });

    for (const chat of chats) {
      const receiverId = chat.userIDs.find((id) => id !== tokenUserId);
      const receiver = await prisma.user.findUnique({
        where: { id: receiverId },
        select: { id: true, username: true, avatar: true },
      });
      chat.receiver = receiver;
    }
    res.status(200).json(chats);
  } catch (err) {
    console.log(err);
    res.state(500).json({ message: "failed to get chats" });
  }
};

export const getChat = async (req, res) => {
  const tokenUserId = req.userId;

  try {
    const chat = await prisma.chat.findUnique({
      where: {
        id: req.params.id,
        userIDs: {
          hasSome: [tokenUserId],
        },
      },
      include: {
        messages: {
          orderBy: {
            createAt: "asc",
          },
        },
      },
    });

    await prisma.chat.update({
      where: {
        id: req.params.id,
      },
      data: {
        seenBy: {
          push: [tokenUserId],
        },
      },
    }),
      res.status(200).json(chat);
  } catch (err) {
    console.log(err);
    res.state(500).json({ message: "failed to get chat" });
  }
};

// export const addChat = async (req, res) => {
//   const tokenUserId = req.userId;
//   try {
//     const newChat = await prisma.chat.create({
//       data: { userIDs: [tokenUserId, req.body.receiverId] },
//     });
//     res.status(200).json(newChat);
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ message: "failed to add chat" });
//   }
// };

export const addChat = async (req, res) => {
  const receiver = req.body.receiverId;
  const tokenUserId = req.userId; // Lấy ID của người dùng từ token đã xác thực

  if (tokenUserId === receiver) {
    return res.status(400).json({ message: "Cannot chat with yourself" }); // Trả về thông báo lỗi
  }

  try {
    // Tạo đoạn chat mới với tokenUserId và receiverId
    const newChat = await prisma.chat.create({
      data: {
        userIDs: [tokenUserId, receiver], // Gán người dùng hiện tại và người nhận
      },
    });
    res.status(200).json(newChat); // Trả về đoạn chat mới tạo
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to add chat" }); // Sửa thành res.status
  }
};

export const readChat = async (req, res) => {
  const tokenUserId = req.userIDs;
  try {
    const chat = await prisma.update({
      where: {
        id: req.params.id,
        userIDs: {
          hasSome: [tokenUserId],
        },
      },
      data: { seenBy: { push: [tokenUserId] } },
    });
    res.status(200).json(chat);
  } catch (err) {
    console.log(err);
    res.state(500).json({ message: "failed to read chat" });
  }
};
