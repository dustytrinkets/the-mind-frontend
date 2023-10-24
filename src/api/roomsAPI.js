import axios from 'axios';
import env from "react-dotenv";

export const createRoom = async (userId) => {
  try {
      console.debug('Creating Room')
      const { data: room } = await axios.post(`${env.API_URL}/rooms`, { creator: userId });
      console.debug('Created Room. Code:', room.code)
      return room;
  } catch (error) {
      throw Error(error.message)
  }
}

export const getRoomByCode = async (roomCode) => {
  try {
    if (!roomCode) {
      throw new Error('Room code is required');
    }
    console.debug('Getting Room', roomCode)
    const { data: room } = await axios.get(`${env.API_URL}/rooms/code/${roomCode}`);
    if (!room) {
      console.debug('Room not found')
      throw new Error('Room not found');
    }
    console.debug('Found room', room)
    return room;
  } catch (error) {
      throw Error(error.message)
  }
}

export const getRoomCreator = async (roomId) => {
  try {
      console.debug('Getting Room Creator', roomId)
      const { data: room } = await axios.get(`${env.API_URL}/rooms/creator/${roomId}`);
      if (!room) {
        console.debug('Room not found')
        throw new Error('Room not found');
      }
      console.debug('Found room creator', room)
      return room;
  } catch (error) {
      throw Error(error.message)
  }
}

export const updateRoomStatus = async (roomId, status) => {
  try {
      console.debug('Updating Room Status', roomId, status)
      const { data: room } = await axios.patch(`${env.API_URL}/rooms/${roomId}`, { status });
      if (!room) {
        console.debug('Room not found')
        throw new Error('Room not found');
      }
      console.debug('Updated room status', room)
      return room;
  } catch (error) {
      throw Error(error.message)
  }
}