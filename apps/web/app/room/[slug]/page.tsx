import axios from "axios";
import { BACKEND_HTTP_URL } from "../../config";
import { ChatRoom2 } from "../../../components/ChatRoom";

export default async function ChatRoom1({
    params,
}: {
    params: {
        slug: string;
    };
}) {
    const slug = (await params).slug;
    const roomDetails = await getRoom(slug);
    console.log("roomDetails --> ", roomDetails);

    return (
        <div
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh",
                width: "100vw",
            }}>
            <div>
                {roomDetails ? (
                    <>
                        <p> this is the room id page -- {slug}</p>
                        <p> this is your room details -- {roomDetails} </p>
                        <ChatRoom2 id={roomDetails} />
                    </>
                ) : (
                    <>
                        <p> this is the room id page -- {slug}</p>
                        <div>Incorrect Room Name </div>
                    </>
                )}
            </div>
        </div>
    );
}

async function getRoom(slug: string) {
    try {
        const url = `${BACKEND_HTTP_URL}/room/${slug}`;
        const response = await axios.get(url);
        // console.log(response.data);
        // console.log(
        //     "This is the getRoom Function Call --> ",
        //     response.data.room.id
        // );
        return response.data.room.id;
    } catch (error) {
        return null;
    }
}
