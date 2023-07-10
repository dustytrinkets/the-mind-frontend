import { useParams, useLocation } from "react-router-dom";

import './Game.component.css';

const Game = () => {
  const params = useLocation();
  const { gameId, roomId, roomCode, userId, userName } = params?.state;

  console.log('-------->params', params)

  return (
    <div className="Screen">
      <div>gameId #{gameId}</div>
      <div>roomCode #{roomCode}</div>
      <div>roomId #{roomId}</div>
      <div>userId #{userId}</div>
      <div>userName #{userName}</div>
      <h1>
        The Mind
      </h1>
    </div>
  );
}

export default Game;
