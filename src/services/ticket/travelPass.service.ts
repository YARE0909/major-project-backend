import QRCode from "qrcode";

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
      dark: "#FFFFFF",
      light: "#00000000",
    },
  });

  return qrDataUrl;
};
