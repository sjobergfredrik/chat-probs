const API_KEY = process.env.REACT_APP_OPENAI_API_KEY;

export const getCompletion = async (prompt) => {
  if (!API_KEY) {
    throw new Error('OpenAI API key not found');
  }

  // Add a space at the start if the prompt doesn't have one
  const processedPrompt = prompt.startsWith(' ') ? prompt : ' ' + prompt;

  const response = await fetch('https://api.openai.com/v1/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo-instruct',
      prompt: processedPrompt,
      max_tokens: 150,
      temperature: 0.7,
      logprobs: 5,
      echo: false
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('OpenAI API Error:', error);
    throw new Error(error.error?.message || 'Failed to get completion');
  }

  return response.json();
};