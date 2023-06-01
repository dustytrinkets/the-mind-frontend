import './Room.component.css';
import { useParams } from "react-router-dom";

const Room = () => {
    const { id: roomId } = useParams();

    return (
        <div className="Screen">
            <h1>
                The Mind
            </h1>
            roomId: {roomId}
        </div>
    );
}

export default Room;
