import React, { useState, useRef, useEffect } from 'react';
import { getCompletion } from '../services/openaiService';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import './Chat.css';

const Chat = () => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!prompt.trim()) return;
    
    // Add user message immediately
    const userMessage = {
      type: 'user',
      content: prompt.trim()
    };
    setMessages(prev => [...prev, userMessage]);
    
    setIsLoading(true);
    setError('');
    setPrompt(''); // Clear input after sending
    
    try {
      const response = await getCompletion(prompt);
      
      // Extract tokens and their probabilities from the completions API response
      const { logprobs } = response.choices[0];
      const { tokens, token_logprobs, top_logprobs } = logprobs;
      
      // Create token objects with probability data
      const processedTokens = tokens.map((token, index) => ({
        token,
        probability: Math.exp(token_logprobs[index]), // Convert log probability to probability
        alternatives: top_logprobs[index] ? Object.entries(top_logprobs[index]).map(([token, logprob]) => ({
          token,
          probability: Math.exp(logprob)
        })) : []
      }));
      
      // Add assistant message
      const assistantMessage = {
        type: 'assistant',
        tokens: processedTokens
      };
      setMessages(prev => [...prev, assistantMessage]);
      
      console.log('Response:', response);
      console.log('Processed tokens:', processedTokens);
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to get response. Please check your API key and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to determine color based on probability
  const getColor = (probability) => {
    if (probability >= 0.5) return 'green';
    if (probability >= 0.2) return 'yellow';
    return 'red';
  };

  // Format probability as percentage
  const formatProbability = (prob) => `${(prob * 100).toFixed(1)}%`;

  const renderTokens = (tokens) => {
    // Group tokens into words
    const words = [];
    let currentWord = [];
    
    tokens.forEach((tObj) => {
      if (tObj.token.startsWith('Ġ') || tObj.token.match(/^[.,!?]/) || currentWord.length === 0) {
        if (currentWord.length > 0) {
          words.push(currentWord);
        }
        currentWord = [tObj];
      } else {
        currentWord.push(tObj);
      }
    });
    if (currentWord.length > 0) {
      words.push(currentWord);
    }

    return words.map((wordTokens, wordIndex) => (
      <span key={wordIndex} className="word">
        {wordTokens.map((tObj, i) => (
          <Tippy
            key={i}
            content={
              <div className="token-tooltip">
                <div><strong>Token:</strong> "{tObj.token}"</div>
                <div><strong>Probability:</strong> {formatProbability(tObj.probability)}</div>
                {tObj.alternatives.length > 0 && (
                  <>
                    <div><strong>Alternatives:</strong></div>
                    <div className="alternatives-bars">
                      {[tObj, ...tObj.alternatives].slice(0, 5).map((alt, j) => (
                        <div key={j} className="alternative-bar">
                          <div className="bar-label">"{alt.token}"</div>
                          <div className="bar-container">
                            <div 
                              className="bar-fill" 
                              style={{width: `${alt.probability * 100}%`}}
                            ></div>
                            <div className="bar-text">{formatProbability(alt.probability)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            }
            placement="top"
            arrow={true}
            duration={200}
          >
            <span
              className="token"
              style={{ 
                backgroundColor: getColor(tObj.probability),
                marginRight: i === wordTokens.length - 1 && !tObj.token.match(/^[.,!?]/) ? '0.25em' : '0',
                marginLeft: '0',
                display: 'inline-block',
                borderRadius: i === 0 ? '3px 0 0 3px' : i === wordTokens.length - 1 ? '0 3px 3px 0' : '0'
              }}
            >
              {tObj.token.startsWith('Ġ') ? tObj.token.slice(1) : tObj.token}
            </span>
          </Tippy>
        ))}
      </span>
    ));
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h1>OpenAI Chat</h1>
        <div className="legend">
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: 'green' }}></span>
            <span>High confidence (≥50%)</span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: 'yellow' }}></span>
            <span>Medium confidence (20-49%)</span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: 'red' }}></span>
            <span>Low confidence (&lt;20%)</span>
          </div>
        </div>
      </div>
      
      <div className="messages-container">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.type}`}>
            <div className="message-header">{message.type === 'user' ? 'You' : 'Assistant'}</div>
            <div className="message-content">
              {message.type === 'user' ? (
                message.content
              ) : (
                renderTokens(message.tokens)
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="message assistant">
            <div className="message-header">Assistant</div>
            <div className="message-content typing">Typing...</div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="input-container">
        <form onSubmit={handleSubmit} className="prompt-form">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Type your message..."
            disabled={isLoading}
            className="prompt-input"
          />
          <button type="submit" disabled={isLoading} className="submit-button">
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;