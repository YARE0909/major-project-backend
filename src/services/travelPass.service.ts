import QRCode from "qrcode";

/**
 * Generates QR data (data URL) for the travel pass and returns the data URL.
 * Also returns the payload structure for the QR if needed.
 */
export const generateTravelPass = async (travelPassId: string, journeyId: string) => {
  const payload = {
    travelPassId,
    journeyId,
    issuedAt: new Date().toISOString()
  };

  const dataStr = JSON.stringify(payload);
  const qrDataUrl = await QRCode.toDataURL(dataStr, { errorCorrectionLevel: "M" });

  // optionally save the qr data into the travelPass record is done by caller
  return qrDataUrl;
};
