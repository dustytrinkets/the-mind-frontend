import { io } from 'socket.io-client';
import env from "react-dotenv";

const URL = env.SOCKET_URL || 'http://localhost:8001';

export const socketComponent = io(URL)