# BudgetAI 💰

A full stack application that generates personalized monthly budget plans using OpenAI's AI technology. Simply provide your income, location, and financial goals, and get a detailed budget breakdown tailored to your specific situation.

## Features

- 🤖 **AI-Powered Budget Generation**: Uses OpenAI GPT to create personalized budget plans
- 📊 **Comprehensive Budget Breakdown**: Includes essentials, savings, discretionary spending, and emergency funds
- 🌍 **Location-Aware**: Takes your city into account for cost of living adjustments
- 🎯 **Goal-Oriented**: Tailored recommendations based on your specific financial objectives
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices
- ⚡ **Real-time Processing**: Get your budget plan in seconds

## Technology Stack

- **Backend**: Node.js, Express.js
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **AI Integration**: OpenAI API (GPT-3.5-turbo)
- **Styling**: Custom CSS with gradient design

## Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- OpenAI API key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/parisedai/BudgetAI.git
   cd BudgetAI
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your OpenAI API key:
   ```
   OPENAI_API_KEY=your_actual_openai_api_key_here
   PORT=3000
   ```

4. Start the application:
   ```bash
   npm start
   ```

5. Open your browser and navigate to `http://localhost:3000`

## Development

To run the application in development mode with auto-restart:

```bash
npm run dev
```

## API Documentation

### POST /api/generate-budget

Generates a personalized budget plan based on user inputs.

**Request Body:**
```json
{
  "income": 5000,
  "city": "New York, NY",
  "financialGoal": "Save for a house down payment"
}
```

**Response:**
```json
{
  "success": true,
  "budgetPlan": "Detailed budget plan text...",
  "userInputs": {
    "income": 5000,
    "city": "New York, NY",
    "financialGoal": "Save for a house down payment"
  }
}
```

### GET /api/health

Health check endpoint.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2023-12-07T10:30:00.000Z"
}
```

## Usage

1. **Enter Your Income**: Provide your monthly income in USD
2. **Specify Your Location**: Enter your city and state/country
3. **Define Your Financial Goal**: Describe what you want to achieve (e.g., save for vacation, pay off debt, build emergency fund)
4. **Generate Budget**: Click the button to get your AI-generated budget plan
5. **Review Your Plan**: Get a detailed breakdown with specific dollar amounts and recommendations

## Example Budget Categories

The AI-generated budget plans typically include:

- **Housing** (rent/mortgage, utilities)
- **Transportation** (car payment, gas, public transit)
- **Food** (groceries, dining out)
- **Savings** (goal-specific, emergency fund)
- **Insurance** (health, auto, etc.)
- **Debt Payments** (credit cards, loans)
- **Entertainment** (subscriptions, hobbies)
- **Personal Care** (healthcare, grooming)

## Error Handling

The application includes comprehensive error handling for:

- Invalid input validation
- OpenAI API errors (quota exceeded, invalid key)
- Network connectivity issues
- Server errors

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Disclaimer

This application provides general financial guidance and should not be considered as professional financial advice. Always consult with a qualified financial advisor for important financial decisions.

## Support

If you encounter any issues or have questions, please open an issue on GitHub.