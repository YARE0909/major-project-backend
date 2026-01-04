import { bookTicketsAndGeneratePasses } from "../../services/ticket/ticket.service";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { Response } from "express";
import { confirmPaymentService, createPaymentService } from "../../services/payment/payment.service";

export const startPaymentController = async (req: AuthRequest, res: Response) => {
  const { journeyId } = req.body;
  const payment = await createPaymentService(journeyId);
  res.json(payment);
};

export const confirmPaymentController = async (req: AuthRequest, res: Response) => {
  const { paymentId } = req.body;

  const result = await confirmPaymentService(paymentId);
  if (!result.success) {
    return res.status(400).json({ error: "Payment failed" });
  }

  // 🎟️ Ticket creation happens HERE
  await bookTicketsAndGeneratePasses(result.journeyId);

  res.json({
    success: true,
    journeyId: result.journeyId,
  });
};
