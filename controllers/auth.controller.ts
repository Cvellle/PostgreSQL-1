import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sql } from "../config/db";

interface AuthRequest extends Request {
  user?: { id: string; email: string };
  file?: Express.Multer.File;
}

const getRolesArray = (rolesObj: any) => {
  return rolesObj ? Object.values(rolesObj).filter(Boolean) : [];
};

export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email e password sono obbligatori." });
  }

  try {
    const users = await sql`
      SELECT * FROM users WHERE email = ${email}
    `;

    if (users.length === 0) return res.sendStatus(401);

    const user = users[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) return res.sendStatus(401);

    const roles = getRolesArray(user.roles);

    const accessToken = jwt.sign(
      { UserInfo: { email: user.email, roles } },
      process.env.ACCESS_TOKEN_SECRET!,
      { expiresIn: "15m" },
    );

    const refreshToken = jwt.sign(
      { email: user.email },
      process.env.REFRESH_TOKEN_SECRET!,
      { expiresIn: "1d" },
    );

    await sql`
      UPDATE users SET refresh_token = ${refreshToken} WHERE id = ${user.id}
    `;

    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.json({ roles, accessToken });
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
};

export const registerUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "Dati mancanti." });

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const [user] = await sql`
      INSERT INTO users (email, password)
      VALUES (${email}, ${hashedPassword})
      RETURNING id, email, roles
    `;

    res.status(201).json(user);
  } catch (error: any) {
    if (error.code === "23505") {
      return res.status(409).json({ message: "Email già registrata." });
    }
    res.status(500).json({ message: "Errore durante la registrazione" });
  }
};

export const getCurrentUser = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) return res.sendStatus(401);

  try {
    const [user] = await sql`
      SELECT id, email, roles, profile_image FROM users WHERE id = ${userId}
    `;

    if (!user) return res.status(404).json({ message: "Utente non trovato" });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Errore del server" });
  }
};

export const handleRefreshToken = async (req: Request, res: Response) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(401);

  const refreshToken = cookies.jwt;

  try {
    const [user] = await sql`
      SELECT * FROM users WHERE refresh_token = ${refreshToken}
    `;

    if (!user) return res.sendStatus(403);

    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET!,
      (err: any, decoded: any) => {
        if (err || decoded.email !== user.email) return res.sendStatus(403);

        const roles = getRolesArray(user.roles);
        const accessToken = jwt.sign(
          { UserInfo: { email: user.email, roles } },
          process.env.ACCESS_TOKEN_SECRET!,
          { expiresIn: "15m" },
        );

        res.json({ roles, accessToken });
      },
    );
  } catch (err) {
    res.sendStatus(500);
  }
};

export const handleLogout = async (req: Request, res: Response) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(204);

  const refreshToken = cookies.jwt;

  try {
    await sql`
      UPDATE users SET refresh_token = NULL WHERE refresh_token = ${refreshToken}
    `;

    res.clearCookie("jwt", { httpOnly: true, sameSite: "none", secure: true });
    res.sendStatus(204);
  } catch (err) {
    res.sendStatus(500);
  }
};

export const uploadProfile = async (req: AuthRequest, res: Response) => {
  const file = req.file;
  const userId = req.user?.id;

  if (!file || !userId) {
    return res.status(400).json({ message: "File non caricato" });
  }

  const profileImageData = {
    filename: file.filename,
    path: file.path,
    mimetype: file.mimetype,
  };

  try {
    await sql`
      UPDATE users SET profile_image = ${sql.json(profileImageData)} WHERE id = ${userId}
    `;

    res.status(200).json({
      message: "Foto profilo aggiornata",
      profileImage: profileImageData,
    });
  } catch (err) {
    res.status(500).json({ message: "Errore caricamento" });
  }
};
