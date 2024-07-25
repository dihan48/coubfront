// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { getUser } from "@/helpers/db";
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

  const { login, password } = req.body;

  try {
    const user = await getUser(login);
    const isValid = bcrypt.compareSync(password, user.password);

    if (isValid) {
      res.status(200).json({
        status: Status.Success,
        token: jwt.sign({ id: user.id }, "secret"),
      });
    } else {
      res.status(400).json({
        status: Status.Error,
        error: "",
      });
    }
  } catch (error) {
    res.status(400).json({
      status: Status.Error,
      error: "",
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
