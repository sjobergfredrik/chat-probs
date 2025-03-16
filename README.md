# Chat Probs

A React-based chat interface that visualizes token probabilities from OpenAI's API responses. This project provides an interactive way to understand how language models make token predictions.

## Features

- Real-time chat interface with OpenAI's API
- Token-level probability visualization using color coding:
  - 🟢 Green: High confidence (≥50%)
  - 🟡 Yellow: Medium confidence (20-49%)
  - 🔴 Red: Low confidence (<20%)
- Interactive tooltips showing:
  - Token probability details
  - Alternative token predictions with probability bars
- Word-level grouping of tokens for better readability
- Responsive design with clean UI

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/sjobergfredrik/chat-probs.git
cd chat-probs
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and add your OpenAI API key:
```
REACT_APP_OPENAI_API_KEY=your_api_key_here
```

4. Start the development server:
```bash
npm start
```

The application will be available at `http://localhost:3000`.

## Usage

1. Enter your message in the input field
2. Press Send or hit Enter
3. The model's response will appear with colored tokens indicating confidence levels
4. Hover over any token to see detailed probability information and alternatives

## Technical Details

- Built with React
- Uses OpenAI's API with logprobs parameter
- Implements token grouping for better word visualization
- Features interactive tooltips with probability distributions

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.