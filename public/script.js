document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const budgetForm = document.getElementById('budgetForm');
    const inputSection = document.getElementById('inputSection');
    const resultsSection = document.getElementById('resultsSection');
    const errorMessage = document.getElementById('errorMessage');
    const generateBtn = document.getElementById('generateBtn');
    const newBudgetBtn = document.getElementById('newBudgetBtn');
    const btnText = document.getElementById('btnText');
    const btnSpinner = document.getElementById('btnSpinner');
    const userSummary = document.getElementById('userSummary');
    const budgetPlan = document.getElementById('budgetPlan');

    // Form submission handler
    budgetForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Clear previous errors
        hideError();
        
        // Get form data
        const formData = new FormData(budgetForm);
        const income = formData.get('income');
        const city = formData.get('city');
        const financialGoal = formData.get('financialGoal');
        
        // Validate inputs
        if (!income || !city || !financialGoal) {
            showError('Please fill in all fields.');
            return;
        }
        
        if (parseFloat(income) <= 0) {
            showError('Income must be a positive number.');
            return;
        }
        
        // Show loading state
        setLoadingState(true);
        
        try {
            // Send request to backend
            const response = await fetch('/api/generate-budget', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    income: parseFloat(income),
                    city: city.trim(),
                    financialGoal: financialGoal.trim()
                })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to generate budget plan');
            }
            
            if (data.success) {
                displayResults(data);
            } else {
                throw new Error('Failed to generate budget plan');
            }
            
        } catch (error) {
            console.error('Error:', error);
            showError(error.message || 'An error occurred while generating your budget plan. Please try again.');
        } finally {
            setLoadingState(false);
        }
    });
    
    // New budget button handler
    newBudgetBtn.addEventListener('click', function() {
        resetForm();
    });
    
    // Helper functions
    function setLoadingState(isLoading) {
        generateBtn.disabled = isLoading;
        if (isLoading) {
            btnText.textContent = 'Generating your budget...';
            btnSpinner.classList.remove('hidden');
        } else {
            btnText.textContent = 'Generate Budget Plan';
            btnSpinner.classList.add('hidden');
        }
    }
    
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.classList.remove('hidden');
        
        // Scroll to error message
        errorMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    function hideError() {
        errorMessage.classList.add('hidden');
    }
    
    function displayResults(data) {
        // Hide input section and show results
        inputSection.classList.add('hidden');
        resultsSection.classList.remove('hidden');
        
        // Display user summary
        const { income, city, financialGoal } = data.userInputs;
        let mockModeNotice = '';
        if (data.mockMode) {
            mockModeNotice = '<div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 10px; border-radius: 5px; margin-bottom: 15px; color: #856404;">📝 <strong>Demo Mode:</strong> This is a sample budget plan. Set up OpenAI API key for AI-generated plans.</div>';
        }
        
        userSummary.innerHTML = `
            ${mockModeNotice}
            <h3>Your Information</h3>
            <div class="summary-item">
                <span class="summary-label">Monthly Income:</span> $${income.toLocaleString()}
            </div>
            <div class="summary-item">
                <span class="summary-label">Location:</span> ${city}
            </div>
            <div class="summary-item">
                <span class="summary-label">Financial Goal:</span> ${financialGoal}
            </div>
        `;
        
        // Display budget plan (convert line breaks to proper HTML)
        const formattedBudgetPlan = data.budgetPlan
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>')
            .replace(/^\s*/, '<p>')
            .replace(/\s*$/, '</p>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/^\* /gm, '• ')
            .replace(/^(\d+\.)/gm, '<strong>$1</strong>')
            .replace(/^# (.*?)$/gm, '<h2>$1</h2>')
            .replace(/^## (.*?)$/gm, '<h3>$1</h3>')
            .replace(/^### (.*?)$/gm, '<h4>$1</h4>');
        
        budgetPlan.innerHTML = formattedBudgetPlan;
        
        // Scroll to results
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    function resetForm() {
        // Clear form
        budgetForm.reset();
        
        // Hide results and show input
        resultsSection.classList.add('hidden');
        inputSection.classList.remove('hidden');
        
        // Hide any errors
        hideError();
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Focus on first input
        document.getElementById('income').focus();
    }
    
    // Add input formatting for income field
    const incomeInput = document.getElementById('income');
    incomeInput.addEventListener('input', function(e) {
        // Remove any non-numeric characters except decimal point
        let value = e.target.value.replace(/[^0-9.]/g, '');
        
        // Ensure only one decimal point
        const parts = value.split('.');
        if (parts.length > 2) {
            value = parts[0] + '.' + parts.slice(1).join('');
        }
        
        e.target.value = value;
    });
    
    // Auto-capitalize city input
    const cityInput = document.getElementById('city');
    cityInput.addEventListener('input', function(e) {
        // Capitalize first letter of each word
        e.target.value = e.target.value.replace(/\b\w/g, l => l.toUpperCase());
    });
    
    // Character counter for financial goal
    const financialGoalInput = document.getElementById('financialGoal');
    const maxLength = 500;
    
    // Add character counter
    const counterDiv = document.createElement('div');
    counterDiv.style.textAlign = 'right';
    counterDiv.style.fontSize = '12px';
    counterDiv.style.color = '#666';
    counterDiv.style.marginTop = '5px';
    financialGoalInput.parentNode.appendChild(counterDiv);
    
    function updateCharacterCounter() {
        const remaining = maxLength - financialGoalInput.value.length;
        counterDiv.textContent = `${remaining} characters remaining`;
        if (remaining < 50) {
            counterDiv.style.color = '#d9534f';
        } else {
            counterDiv.style.color = '#666';
        }
    }
    
    financialGoalInput.addEventListener('input', updateCharacterCounter);
    financialGoalInput.maxLength = maxLength;
    updateCharacterCounter();
});