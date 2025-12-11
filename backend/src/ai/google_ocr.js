// backend/src/ai/google_ocr.js
const vision = require("@google-cloud/vision");
const path = require("path");
const { GOOGLE_OCR_KEY_PATH } = require("../config/env");

let client = null;

function initClient() {
  if (!client) {
    client = new vision.ImageAnnotatorClient({
      keyFilename: path.resolve(GOOGLE_OCR_KEY_PATH)
    });
  }
  return client;
}

module.exports = {
  async readImage(filePath) {
    const c = initClient();
    const [result] = await c.textDetection(filePath);

    return {
      text: result.fullTextAnnotation?.text || "",
      blocks: result.textAnnotations || []
    };
  }
};
