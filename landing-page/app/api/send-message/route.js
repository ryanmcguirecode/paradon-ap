import { NextResponse, NextRequest } from "next/server";

export async function POST(req, res) {
  const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.CHAT_ID;
  const url = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`;

  const body = await req.json();
  const message = body.message;

  const params = {
    chat_id: chatId,
    text: message,
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });
    const data = await response.json();
    console.log("Message sent:", data);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.error("Error sending message.");
  }
}
