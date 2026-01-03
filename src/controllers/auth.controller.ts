import type { Request, Response } from "express";
import * as AuthService from "../services/auth.service";

export const signup = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "email and password required" });

    const user = await AuthService.signup(email, password);
    res.json({ id: user.id, email: user.email });
  } catch (err: any) {
    res.status(400).json({ error: err.message || "Signup failed" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "email and password required" });

    const { token, user } = await AuthService.login(email, password);
    res.json({ token, user: { id: user.id, email: user.email } });
  } catch (err: any) {
    res.status(400).json({ error: err.message || "Login failed" });
  }
};
