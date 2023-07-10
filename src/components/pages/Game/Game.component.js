import React, { useCallback } from 'react';
import { useLocation } from "react-router-dom";

import './Game.component.css';
import { useEffect } from "react";

import { roomsAPI, gamesAPI } from '../../../api';

const Game = () => {
  const params = useLocation();
  const { gameId, roomId, roomCode, userId, userName } = params?.state;

  const initGame = useCallback(async () => {
    await roomsAPI.updateRoomStatus(roomId, 'playing')
    await gamesAPI.updateGameStatus(gameId, 'active')
  })

  //change game status to active and room to playing
  useEffect(() => {
    initGame()
  }, [initGame])


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
