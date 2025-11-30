import { GoogleGenerativeAI } from '@google/generative-ai';

// Basic runtime checks for keys
if (!process.env.GEMINI_API_KEY) {
  console.warn('Warning: GEMINI_API_KEY is not set in environment. Gemini requests will fail.');
} else {
  console.log('GEMINI_API_KEY loaded (length:', String(process.env.GEMINI_API_KEY).length, ')');
}

// Initialize the AI with your API key from the .env file
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * @desc    Send a prompt to the AI agent
 * @route   POST /api/agent/ask
 * @access  Private
 */
const askAgent = async (req, res) => {
  const { prompt } = req.body; // The user's question from the frontend

  if (!prompt) {
    return res.status(400).json({ message: 'Prompt cannot be empty' });
  }

  try {
    // For text-only input, use the gemini-pro model
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Send the AI's answer back to the user's app
    res.status(200).json({ reply: text });

  } catch (error) {
    // Log as much information as possible to help debug auth issues
    console.error('Error communicating with Gemini API:');
    try {
      console.error('error.message:', error.message);
      console.error('error.code:', error.code);
      console.error('error.stack:', error.stack);
      // Some SDKs return a response object with details
      if (error.response) {
        console.error('error.response.status:', error.response.status);
        console.error('error.response.data:', JSON.stringify(error.response.data));
      }
    } catch (logErr) {
      console.error('Failed to fully log SDK error:', logErr);
    }

    // Return a more detailed message in development so the client can show it
    const clientMessage = (error?.response?.data?.message) || error?.message || 'Failed to get a response from the AI agent';
    res.status(500).json({ message: 'AI agent error', detail: clientMessage });
  }
};

// Dev-only: verify the Gemini API key by making a minimal call and returning the SDK response or error details
const verifyKey = async (req, res) => {
  if (!process.env.GEMINI_API_KEY) {
    return res.status(400).json({ ok: false, message: 'GEMINI_API_KEY not set' });
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    // small prompt to exercise auth only
    const result = await model.generateContent('Hello from verification test. Reply with short OK.');
    const response = await result.response;
    const text = response.text();
    return res.status(200).json({ ok: true, reply: text });
  } catch (error) {
    console.error('verifyKey: error while calling Gemini SDK');
    try {
      console.error('error.message:', error.message);
      if (error.response) {
        console.error('error.response.status:', error.response.status);
        console.error('error.response.data:', JSON.stringify(error.response.data));
      }
    } catch (logErr) {
      console.error('Failed to fully log SDK error:', logErr);
    }
    const clientMessage = (error?.response?.data?.message) || error?.message || 'Unknown SDK error';
    return res.status(500).json({ ok: false, message: 'verifyKey failed', detail: clientMessage });
  }
};

export { askAgent, verifyKey };