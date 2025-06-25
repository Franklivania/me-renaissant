import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components';
import { Input } from '@/components/form/input';
import { Icon } from '@iconify/react';
import { useProfileStore } from '@/store/useProfileStore';
import { useChatStore } from '@/store/useChatStore';
import { GroqService } from '@/services/groq-service';
import { useSearchParams } from 'react-router-dom';

export default function ChatPage() {
  const [searchParams] = useSearchParams();
  const conversationId = searchParams.get('chat');
  
  const { doppelganger } = useProfileStore();
  const { messages, isLoading, isTyping, loadConversationHistory, addMessage, setTyping } = useChatStore();
  
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load conversation history when component mounts or conversation changes
    loadConversationHistory();
  }, [conversationId, loadConversationHistory]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || !doppelganger || isSending) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setIsSending(true);
    setTyping(true);

    try {
      // Add user message
      await addMessage({
        session_id: '', // Will be set by the service
        persona_id: conversationId || null,
        sender: 'user',
        message: userMessage
      });

      // Generate doppelganger response
      const conversationHistory = messages.map(msg => ({
        sender: msg.sender,
        message: msg.message
      }));

      const doppelgangerResponse = await GroqService.generateDoppelgangerResponse(
        userMessage,
        doppelganger,
        conversationHistory
      );

      // Add doppelganger response
      await addMessage({
        session_id: '', // Will be set by the service
        persona_id: conversationId || null,
        sender: 'doppelganger',
        message: doppelgangerResponse
      });

    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
      setTyping(false);
    }
  };

  if (!doppelganger) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-brown-100">
          <p className="mb-4">Thy doppelganger awaits creation...</p>
          <Button onClick={() => window.location.href = '/onboarding'}>
            Begin the Journey
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-h-screen">
      {/* Chat Header */}
      <div className="flex-shrink-0 p-4 border-b border-brown-100/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brown-100/20 flex items-center justify-center">
            <Icon icon="mdi:account-circle" className="w-6 h-6 text-brown-100" />
          </div>
          <div>
            <h3 className="text-brown-100 font-im text-lg">{doppelganger.name}</h3>
            <p className="text-brown-100/60 text-sm">{doppelganger.title}</p>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.length === 0 && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-8"
            >
              <div className="mb-4">
                <Icon icon="mdi:chat-outline" className="w-16 h-16 text-brown-100/40 mx-auto" />
              </div>
              <h3 className="text-brown-100 font-im text-xl mb-2">
                Greetings, kindred soul!
              </h3>
              <p className="text-brown-100/70 max-w-md mx-auto">
                I am {doppelganger.name}, thy Renaissance mirror. What wisdom or wonder 
                shall we explore together across the centuries?
              </p>
            </motion.div>
          )}

          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] ${message.sender === 'user' ? 'order-2' : 'order-1'}`}>
                <div
                  className={`p-3 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-brown-100 text-brown-800 rounded-br-sm'
                      : 'bg-brown-100/10 text-brown-100 rounded-bl-sm border border-brown-100/20'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.message}</p>
                </div>
                <p className="text-xs text-brown-100/40 mt-1 px-2">
                  {new Date(message.created_at).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            </motion.div>
          ))}

          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="bg-brown-100/10 text-brown-100 p-3 rounded-lg rounded-bl-sm border border-brown-100/20">
                <div className="flex space-x-1">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                    className="w-2 h-2 bg-brown-100/60 rounded-full"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                    className="w-2 h-2 bg-brown-100/60 rounded-full"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                    className="w-2 h-2 bg-brown-100/60 rounded-full"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="flex-shrink-0 p-4 border-t border-brown-100/20">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <div className="flex-1">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Share thy thoughts with thy Renaissance mirror..."
              disabled={isSending}
              className="bg-brown-100/5 border-brown-100/20 focus:border-brown-100/40"
            />
          </div>
          <Button
            type="submit"
            disabled={!inputMessage.trim() || isSending}
            loading={isSending}
            className="px-4"
          >
            <Icon icon="mdi:send" className="w-5 h-5" />
          </Button>
        </form>
      </div>
    </div>
  );
}