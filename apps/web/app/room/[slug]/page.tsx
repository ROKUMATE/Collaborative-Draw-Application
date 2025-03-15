import axios from 'axios';
import { BACKEND_HTTP_URL } from '../../config';
import { ChatRoom2 } from '../../../components/ChatRoom';

export default async function ChatRoom1({
    params,
}: {
    params: {
        slug: string;
    };
}) {
    const slug = (await params).slug;
    const roomDetails = await getRoom(slug);
    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                width: '100vw',
            }}>
            <div>
                <p> this is the room id page -- {slug}</p>
                <p> this is your room details -- {roomDetails} </p>
                <ChatRoom2 id={roomDetails} />
            </div>
        </div>
    );
}

async function getRoom(slug: string) {
    try {
        const response = await axios.get(`${BACKEND_HTTP_URL}/room/${slug}`);
        return response.data.room.id;
    } catch (error) {
        return null;
    }
}
