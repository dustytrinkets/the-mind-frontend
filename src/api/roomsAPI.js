import axios from 'axios';
import env from "react-dotenv";

export const createRoom = async (userId) => {
  try {
      console.log('Creating Room')
      const { data: room } = await axios.post(`${env.API_URL}/rooms`, { creator: userId });
      console.log('Created Room. Code:', room.code)
      return room;
  } catch (error) {
      throw Error(error.message)
  }
}

export const getRoomByCode = async (roomCode) => {
  try {
      console.log('Getting Room', roomCode)
      const { data: room } = await axios.get(`${env.API_URL}/rooms/code/${roomCode}`);
      if (!room) {
        console.log('Room not found')
        throw new Error('Room not found');
      }
      console.log('Found room', room)
      return room;
  } catch (error) {
      throw Error(error.message)
  }
}

export const getRoomCreator = async (roomId) => {
  try {
      console.log('Getting Room Creator', roomId)
      const { data: room } = await axios.get(`${env.API_URL}/rooms/creator/${roomId}`);
      if (!room) {
        console.log('Room not found')
        throw new Error('Room not found');
      }
      console.log('Found room creator', room)
      return room;
  } catch (error) {
      throw Error(error.message)
  }
}