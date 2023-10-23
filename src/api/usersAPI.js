import axios from 'axios';
import env from "react-dotenv";

export const createUser = async (name) => {
  try {
      if (!name) {
        throw new Error('Name is required');
      }
      console.debug('Creating User')
      const { data: user } = await axios.post(`${env.API_URL}/users`, { name: name });
      console.debug('Created User')
      return user;
  } catch (error) {
      throw Error(error.message)
  }
}