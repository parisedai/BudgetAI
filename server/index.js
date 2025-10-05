require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const OpenAI = require('openai');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize OpenAI (with fallback for development)
let openai = null;
const MOCK_MODE = !process.env.OPENAI_API_KEY;

if (!MOCK_MODE) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  console.log('✅ OpenAI API initialized');
} else {
  console.log('⚠️  Running in MOCK MODE - OpenAI API key not found');
  console.log('   Set OPENAI_API_KEY environment variable for full functionality');
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Route to serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Route to generate budget plan
app.post('/api/generate-budget', async (req, res) => {
  try {
    const { income, city, financialGoal } = req.body;

    // Validate input
    if (!income || !city || !financialGoal) {
      return res.status(400).json({ 
        error: 'Please provide income, city, and financial goal' 
      });
    }

    // Validate income is a positive number
    const incomeNumber = parseFloat(income);
    if (isNaN(incomeNumber) || incomeNumber <= 0) {
      return res.status(400).json({ 
        error: 'Income must be a positive number' 
      });
    }

    let budgetPlan;

    if (MOCK_MODE) {
      // Generate a mock budget plan for development/testing
      budgetPlan = generateMockBudgetPlan(incomeNumber, city, financialGoal);
    } else {
      // Create prompt for OpenAI
      const prompt = `Create a detailed monthly budget plan for someone with the following details:
- Monthly Income: $${incomeNumber}
- City: ${city}
- Financial Goal: ${financialGoal}

Please provide a comprehensive budget breakdown including:
1. Essential expenses (rent, utilities, groceries, transportation)
2. Savings allocation toward their financial goal
3. Discretionary spending
4. Emergency fund allocation
5. Specific recommendations based on their city and goal

Format the response as a clear, actionable monthly budget plan with dollar amounts and percentages.`;

      // Call OpenAI API
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a professional financial advisor who creates personalized budget plans. Provide practical, realistic advice tailored to the user's location and goals."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      });

      budgetPlan = completion.choices[0].message.content;
    }

    res.json({
      success: true,
      budgetPlan: budgetPlan,
      userInputs: {
        income: incomeNumber,
        city: city,
        financialGoal: financialGoal
      },
      mockMode: MOCK_MODE
    });

  } catch (error) {
    console.error('Error generating budget:', error);
    
    if (error.code === 'insufficient_quota' || error.status === 429) {
      return res.status(429).json({ 
        error: 'OpenAI API quota exceeded. Please try again later.' 
      });
    }
    
    if (error.code === 'invalid_api_key' || error.status === 401) {
      return res.status(401).json({ 
        error: 'Invalid OpenAI API key. Please check your configuration.' 
      });
    }

    res.status(500).json({ 
      error: 'Failed to generate budget plan. Please try again.' 
    });
  }
});

// Function to generate mock budget plan for development
function generateMockBudgetPlan(income, city, financialGoal) {
  const housingPercent = city.toLowerCase().includes('new york') || city.toLowerCase().includes('san francisco') ? 35 : 30;
  const housing = Math.round(income * (housingPercent / 100));
  const utilities = Math.round(income * 0.08);
  const groceries = Math.round(income * 0.12);
  const transportation = Math.round(income * 0.10);
  const savings = Math.round(income * 0.20);
  const emergency = Math.round(income * 0.05);
  const entertainment = Math.round(income * 0.08);
  const remaining = income - (housing + utilities + groceries + transportation + savings + emergency + entertainment);

  return `# Monthly Budget Plan for ${city}

**Monthly Income:** $${income.toLocaleString()}

## Essential Expenses (${Math.round((housing + utilities + groceries + transportation) / income * 100)}% of income)

**Housing & Rent:** $${housing.toLocaleString()} (${housingPercent}%)
- This allocation is adjusted for ${city}'s cost of living

**Utilities:** $${utilities.toLocaleString()} (8%)
- Electricity, gas, water, internet, phone

**Groceries:** $${groceries.toLocaleString()} (12%)
- Weekly grocery budget: $${Math.round(groceries / 4)}

**Transportation:** $${transportation.toLocaleString()} (10%)
- Gas, car payment, insurance, or public transit

## Savings & Goals (25% of income)

**Goal-Specific Savings:** $${savings.toLocaleString()} (20%)
- Dedicated to: ${financialGoal}
- Annual savings toward goal: $${(savings * 12).toLocaleString()}

**Emergency Fund:** $${emergency.toLocaleString()} (5%)
- Build to 3-6 months of expenses

## Discretionary Spending

**Entertainment & Personal:** $${entertainment.toLocaleString()} (8%)
- Dining out, subscriptions, hobbies

**Flexible/Buffer:** $${remaining.toLocaleString()} (${Math.round(remaining / income * 100)}%)
- Additional savings, debt payments, or miscellaneous expenses

## Recommendations for ${city}

1. **Housing:** Your housing cost of $${housing.toLocaleString()} is appropriate for ${city}
2. **Goal Progress:** At $${savings.toLocaleString()}/month, you'll save $${(savings * 12).toLocaleString()} annually toward "${financialGoal}"
3. **Emergency Fund:** Aim to build $${Math.round((housing + utilities + groceries + transportation) * 6).toLocaleString()} for 6 months of expenses

*Note: This is a demo budget plan. For real financial advice, provide your OpenAI API key.*`;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`BudgetAI server running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} to use the application`);
});