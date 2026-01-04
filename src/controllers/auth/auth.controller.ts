import type { Request, Response } from "express";
import { signupService, loginService } from "../../services/auth/auth.service";

export const signupController = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "email and password required" });

    const user = await signupService(email, password);
    res.json({ id: user.id, email: user.email });
  } catch (err: any) {
    res.status(400).json({ error: err.message || "Signup failed" });
  }
};

export const loginController = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "email and password required" });

    const { token, user } = await loginService(email, password);
    res.json({ token, user: { id: user.id, email: user.email } });
  } catch (err: any) {
    res.status(400).json({ error: err.message || "Login failed" });
  }
};
