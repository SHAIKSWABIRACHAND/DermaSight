import { Message } from '../types';

const MESSAGES_STORAGE_KEY = 'dermasight-messages';

type MessageStore = {
  [caseId: string]: Message[];
};

const getAllMessages = (): MessageStore => {
  try {
    const storedMessages = localStorage.getItem(MESSAGES_STORAGE_KEY);
    return storedMessages ? JSON.parse(storedMessages) : {};
  } catch (error) {
    console.error("Failed to parse messages from localStorage", error);
    return {};
  }
};

const saveAllMessages = (messages: MessageStore) => {
  try {
    localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(messages));
  } catch (error) {
    console.error("Failed to save messages to localStorage", error);
  }
};

export const getMessagesForCase = (caseId: string): Message[] => {
  const allMessages = getAllMessages();
  return allMessages[caseId] || [];
};

export const addMessageToCase = (caseId: string, message: Message): Message[] => {
  const allMessages = getAllMessages();
  const caseMessages = allMessages[caseId] || [];
  const updatedMessages = [...caseMessages, message];
  allMessages[caseId] = updatedMessages;
  saveAllMessages(allMessages);
  return updatedMessages;
};