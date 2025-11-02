import React, { useState, useEffect, useRef } from 'react';
import { Message, Role } from '../types';
import { getMessagesForCase, addMessageToCase } from '../services/messagingService';
import { PaperAirplaneIcon } from './icons';

interface MessagingProps {
  caseId: string;
  currentUserRole: Role;
}

const Messaging: React.FC<MessagingProps> = ({ caseId, currentUserRole }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Function to fetch and update messages if they have changed
    const refreshMessages = () => {
        const currentMessages = getMessagesForCase(caseId);
        setMessages(prevMessages => {
            // To avoid unnecessary re-renders, only update state if the message data has actually changed.
            // Comparing stringified versions is a straightforward way to check for deep inequality.
            if (JSON.stringify(currentMessages) !== JSON.stringify(prevMessages)) {
                return currentMessages;
            }
            return prevMessages;
        });
    };

    refreshMessages(); // Initial load

    // Poll for new messages every 3 seconds to simulate a live chat
    const intervalId = setInterval(refreshMessages, 3000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [caseId]);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;

    const message: Message = {
      sender: currentUserRole,
      text: newMessage,
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = addMessageToCase(caseId, message);
    setMessages(updatedMessages);
    setNewMessage('');
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md">
      <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4 border-b border-slate-200 dark:border-slate-700 pb-3">
        Secure Case Messaging
      </h3>
      <div className="h-64 overflow-y-auto pr-2 space-y-4 mb-4 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg">
        {messages.length > 0 ? (
          messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.sender === currentUserRole ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-xl ${
                  msg.sender === currentUserRole
                    ? 'bg-teal-500 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100'
                }`}>
                <p className="text-sm">{msg.text}</p>
                <p className={`text-xs mt-1 ${
                    msg.sender === currentUserRole ? 'text-teal-100' : 'text-slate-400 dark:text-slate-500'
                } text-right`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-slate-500 dark:text-slate-400 text-sm">No messages yet. Start the conversation.</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm text-slate-800 dark:text-slate-100"
        />
        <button
          type="submit"
          className="inline-flex items-center justify-center p-2 border border-transparent rounded-full shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-slate-400"
          disabled={!newMessage.trim()}
        >
          <PaperAirplaneIcon className="h-5 w-5" />
        </button>
      </form>
    </div>
  );
};

export default Messaging;