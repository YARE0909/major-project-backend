import QRCode from "qrcode";

/**
 * Generates a dark-theme-friendly QR code (data URL)
 */
export const generateTravelPass = async (
  travelPassId: string,
  journeyId: string
) => {
  const payload = {
    travelPassId,
    journeyId,
    issuedAt: new Date().toISOString(),
  };

  const dataStr = JSON.stringify(payload);

  const qrDataUrl = await QRCode.toDataURL(dataStr, {
    errorCorrectionLevel: "M",
    margin: 1,
    scale: 6,
    color: {
      dark: "#FFFFFF",      // QR dots (white)
      light: "#00000000",   // transparent background
    },
  });

  return qrDataUrl;
};
