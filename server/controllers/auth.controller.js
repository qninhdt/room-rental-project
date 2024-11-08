import prisma from "../lib/prisma.js";
import jwt from "jsonwebtoken";
import bcryct from "bcrypt"; //tạo mã hash

export const register = async (req, res) => {
  const { username, password, email } = req.body;
  console.log(req.body);

  try {
    //HASH PASSWORD
    const hashedPassword = await bcryct.hash(password, 10);

    //CREATE A NEW USER AND SAVE TO DB
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });

    console.log(newUser);

    res.status(201).json({ message: "User created successfully!" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to create user" });
  }
};

export const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    //CHECK IF THE USER EXISTS

    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) return res.status(401).json({ message: "Invalid Credentials!" });

    //CHECK IF THE PASSWORD IS CORRECT
    const isPasswordValid = await bcryct.compare(password, user.password);
    if (!isPasswordValid)
      return res.status(401).json({ message: "Invalid Credentials!" });

    //GENERATE COCKIE TOKEN AND SEND TO THE USER

    // res.setHeader("Set-Cookie", "tes" + "Myvalue").json("sucess"); //Không đọc được cookie
    const age = 1000 * 60 * 60 * 24 * 7;

    const token = jwt.sign(
      {
        id: user.id,
        isAdmin: false,
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: age }
    );

    const { password: userPassword, ...userInfo } = user;

    res
      .cookie("token", token, {
        httpOnly: true,
        //secure:true  //đưa lên môi trường sản phẩm
        maxAge: age,
      })
      .status(200)
      .json(userInfo);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to login!" });
  }
};

export const logout = (req, res) => {
  res.clearCookie("token").status(200).json({ message: "logout succesfull" });
};
