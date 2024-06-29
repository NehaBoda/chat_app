import { createContext, useContext, useMemo } from 'react';
import io from 'socket.io-client';
import { server } from './constants/config';

// Create a Socket Context
const SocketContext = createContext();

// Function to get the socket from context
const getSocket = () => {
    return useContext(SocketContext);
}


// SocketProvider component
const SocketProvider = ({ children }) => {
    const socket = useMemo(() => {
        // Create the socket instance
       return (io(server, { withCredentials: true })
    );
    }, []);

    return (
        // Provide the socket instance to children
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
}

export { getSocket, SocketProvider };
