import axios from 'axios';
import env from "react-dotenv";

export const createRoomUser = async (room, user) => {
  try {
      console.log('Creating Room User', room, user)
      const { data: userRoom } = await axios.post(`${env.API_URL}/room-users`, { room, user });
      console.log('Created Room User')
      return userRoom;
  } catch (error) {
      throw Error(error.message)
  }
}

export const getRoomUsers = async (roomId) => {
  try {
      console.log('Getting Room Users')
      const { data: roomUsers } = await axios.get(`${env.API_URL}/room-users/${roomId}`);
      console.log('Got Room Users', roomUsers)
      return roomUsers;
  } catch (error) {
      throw Error(error.message)
  }
}