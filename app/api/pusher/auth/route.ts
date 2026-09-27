import { NextRequest, NextResponse } from "next/server";
import { pusherServer } from "@/lib/pusherServer";
import { v4 as uuid } from "uuid";

export async function POST(req: NextRequest) {
  const body = await req.formData();
  const socketId = body.get("socket_id") as string;
  const channelName = body.get("channel_name") as string;

  const authResponse = pusherServer.authorizeChannel(socketId, channelName, {
    user_id: uuid(),
    user_info: {},
  });

  return NextResponse.json(authResponse);
}
