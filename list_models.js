const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function list() {
  try {
    const models = await genAI
      .getGenerativeModel({ model: "gemini-1.5-flash" })
      .listModels();
    // Note: listModels is actually on the genAI object or similar depending on the SDK version
    // In newer SDKs it's:
    // const results = await genAI.listModels();
    console.log(JSON.stringify(models, null, 2));
  } catch (e) {
    // If listModels fails, let's try direct enumeration if we can find the method
    console.error(e);
  }
}
// list();
