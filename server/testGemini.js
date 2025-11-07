import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("AIzaSyCbqNAJmzVezzUUvvojqfMH6qYvOxryb08");

async function run() {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-05-20" });
  const result = await model.generateContent("Xin chào, Gemini! hôm nay hà nội mưa không");
  console.log(result.response.text());
}

run().catch(console.error);
