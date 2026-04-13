import ee from "@google/earthengine";

const privateKey = JSON.parse(
  Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT, "base64").toString("utf-8"),
);

export const initEarthEngine = () => {
  return new Promise((resolve, reject) => {
    ee.data.authenticateViaPrivateKey(
      privateKey,
      () => {
        ee.initialize(null, null, resolve, reject);
      },
      reject,
    );
  });
};
