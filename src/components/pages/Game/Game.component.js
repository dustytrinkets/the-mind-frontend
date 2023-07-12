import React, { useCallback, useState } from 'react';
import { useLocation } from "react-router-dom";

import './Game.component.css';
import { useEffect } from "react";

import { roomsAPI, gamesAPI } from '../../../api';

const Game = () => {
  const params = useLocation();
  console.log('params: ', params)
  const { gameId, roomId, roomCode, userId, roomUsers, numbers, userName } = params?.state;
  // const [numbers, setNumbers] = useState([])

  const updateStatuses = useCallback(async () => {
    await roomsAPI.updateRoomStatus(roomId, 'playing')
    await gamesAPI.updateGameStatus(gameId, 'active')
  })

  useEffect(() => {
    updateStatuses()
  }, [updateStatuses])

  // // TODO: get random numbers from backend
  // const getRandomNumbers = useCallback(async () => {
  //   const randomNumbers = await gamesAPI.getRandomNumbers(gameId)
  //   setRandomNumbers(randomNumbers)
  // })


  return (
    <div className="Screen">
      <div>gameId #{gameId}</div>
      <div>roomCode #{roomCode}</div>
      <div>roomId #{roomId}</div>
      <div>userId #{userId}</div>
      <div>userName #{userName}</div>
      <div>roomUsers {roomUsers}</div>
      <div>numbers #{numbers}</div>
      <h1>
        The Mind
      </h1>
    </div>
  );
}

export default Game;
