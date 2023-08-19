import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import useWebSocket, { ReadyState } from 'react-use-websocket';

export const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [messageHistory, setMessageHistory] = useState([]);

  const [socketUrl, setSocketUrl] = useState('wss://testnet.binance.vision/stream');
  const { sendMessage, lastMessage, readyState } = useWebSocket(socketUrl);


  useEffect(() => {
    if (lastMessage !== null) {
      setMessageHistory(lastMessage);
    }
  }, [lastMessage, setMessageHistory]);

	const waitConnection = useCallback((callback, interval) => {
    if (stream.readyState === 1) {
      callback();
    } else {
      setTimeout(function () {
        waitConnection(callback, interval);
      }, interval);
    }
  }, [])
	
  const subscribe = useCallback(
    (msg) => {
      sendMessage(JSON.stringify(msg))
    },
    [sendMessage]
  );



  const values = {
    messageHistory,
    subscribe,
  };

  return (
    <SocketContext.Provider value={values}>{children}</SocketContext.Provider>
  );
};
