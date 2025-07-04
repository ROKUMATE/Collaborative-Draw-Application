import axios from "axios";
import { BACKEND_HTTP_URL } from "../app/config";
import { ChatRoomClient } from "./ChatRoomClient";

async function GetChats(id: string) {
    const url = `${BACKEND_HTTP_URL}/chat/${id}`;
    const response = await axios.get(url);
    return response.data.body.message.chatMessages;
}

export async function ChatRoom2({ id }: { id: string }) {
    const messages = await GetChats(id);
    return <ChatRoomClient id={id} message={messages}></ChatRoomClient>;
}
