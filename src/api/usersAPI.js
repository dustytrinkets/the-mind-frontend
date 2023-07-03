import axios from 'axios';
import env from "react-dotenv";

export const createUser = async (name) => {
  try {
    console.log('name', name)
      if (!name) {
        console.log('nonameeeee')
        throw new Error('Name is required');
      }
      console.log('Creating User')
      const { data: user } = await axios.post(`${env.API_URL}/users`, { name: name });
      console.log('Created User')
      return user;
  } catch (error) {
      throw Error(error.message)
  }
}