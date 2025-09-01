import { NextApiRequest, NextApiResponse } from "next";

let clients = [];

export default async function handler(req, res) {
  if (req.method === "GET") {
    // SSE 連線
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    clients.push(res);

    req.on("close", () => {
      clients = clients.filter(c => c !== res);
    });
  } else if (req.method === "POST") {
    // Toggl Webhook 傳來資料
    const body = req.body;
    // 推送給所有前端 SSE
    const data = JSON.stringify(body);
    clients.forEach(client => client.write(`data: ${data}\n\n`));
    res.status(200).end("OK");
  } else {
    res.setHeader('Allow', ['GET','POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
