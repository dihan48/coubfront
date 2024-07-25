// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { registerUser } from "@/helpers/db";
import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== "POST") {
    return res.status(405).json({
      status: Status.Error,
      error: "Method not allowed",
    });
  }

  if (!req.body) {
    return res.status(400).json({
      status: Status.Error,
      error: "No body",
    });
  }

  if (!req.body.login || !req.body.password) {
    return res.status(400).json({
      status: Status.Error,
      error: "No login or password",
    });
  }

  if (req.body.login.length < 3 || req.body.password.length < 3) {
    return res.status(400).json({
      status: Status.Error,
      error: "Login or password too short",
    });
  }

  if (req.body.login.length > 32 || req.body.password.length > 32) {
    return res.status(400).json({
      status: Status.Error,
      error: "Login or password too long",
    });
  }

  if (!/^[a-zA-Z0-9_]+$/.test(req.body.login)) {
    return res.status(400).json({
      status: Status.Error,
      error: "Login contains invalid characters",
    });
  }

  if (!/^[a-zA-Z0-9_]+$/.test(req.body.password)) {
    return res.status(400).json({
      status: Status.Error,
      error: "Password contains invalid characters",
    });
  }

  if (req.body.login === req.body.password) {
    return res.status(400).json({
      status: Status.Error,
      error: "Login and password must be different",
    });
  }

  const { login, password } = req.body;

  const passwordHash = await bcrypt.hashSync(password, 10);

  try {
    const user = await registerUser(login, passwordHash);
    if (user) {
      res.status(200).json({
        status: Status.Success,
        token: jwt.sign({ id: user.id }, "secret"),
      });
    } else {
      res.status(400).json({
        status: Status.Error,
        error: "unknown error",
      });
    }
  } catch (error) {
    if (error instanceof Error && error.message === "UniqueConstraintError") {
      res.status(400).json({
        status: Status.Error,
        error: "Login already exists",
      });
      return;
    }

    console.log(error);
    res.status(500).json({
      status: Status.Error,
      error: "Internal server error",
    });
  }
}

enum Status {
  Success = "success",
  Error = "error",
}

type Data = {
  status: Status;
  token?: string;
  error?: string;
};
