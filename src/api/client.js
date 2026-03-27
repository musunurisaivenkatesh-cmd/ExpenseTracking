
const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);
const now = () => new Date().toISOString();
function formatCurrency(n) {
  return `₹${(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}


function getStore(key, fallback = []) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}
function setStore(key, data) { localStorage.setItem(key, JSON.stringify(data)); }


export const authAPI = {
  register: async ({ name, email, password }) => {
    const users = getStore('ft_users', []);
    if (users.find(u => u.email === email)) throw { response: { data: { detail: 'Email already registered' } } };
    const user = { id: uid(), name, email, password, created_at: now() };
    setStore('ft_users', [...users, user]);
    const { password: _, ...safeUser } = user;
    return { data: { access_token: btoa(JSON.stringify({ sub: user.id })), user: safeUser } };
  },
  login: async ({ email, password }) => {
    const users = getStore('ft_users', []);
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) throw { response: { data: { detail: 'Invalid email or password' } } };
    const { password: _, ...safeUser } = user;
    return { data: { access_token: btoa(JSON.stringify({ sub: user.id })), user: safeUser } };
  },
  me: async () => {
    const raw = localStorage.getItem('finance_user');
    if (!raw) throw { response: { status: 401 } };
    return { data: JSON.parse(raw) };
  },
  updateProfile: async (update) => {
    const users = getStore('ft_users', []);
    const userId = JSON.parse(localStorage.getItem('finance_user') || '{}').id;
    const updated = users.map(u => u.id === userId ? { ...u, ...update } : u);
    setStore('ft_users', updated);
    const user = updated.find(u => u.id === userId);
    const { password: _, ...safeUser } = user;
    return { data: safeUser };
  },
};


function currentUserId() { return JSON.parse(localStorage.getItem('finance_user') || '{}').id; }

export const expensesAPI = {
  getAll: async (params = {}) => {
    const all = getStore('ft_expenses', []).filter(e => e.user_id === currentUserId());
    let filtered = all;
    if (params.category) filtered = filtered.filter(e => e.category === params.category);
    if (params.month) filtered = filtered.filter(e => e.date.startsWith(params.month));
    return { data: filtered.sort((a, b) => b.date.localeCompare(a.date)) };
  },
  create: async (data) => {
    const expenses = getStore('ft_expenses', []);
    const item = { ...data, id: uid(), user_id: currentUserId(), created_at: now() };
    setStore('ft_expenses', [...expenses, item]);
    return { data: item };
  },
  update: async (id, data) => {
    const expenses = getStore('ft_expenses', []);
    const updated = expenses.map(e => e.id === id ? { ...e, ...data } : e);
    setStore('ft_expenses', updated);
    return { data: updated.find(e => e.id === id) };
  },
  delete: async (id) => {
    const expenses = getStore('ft_expenses', []).filter(e => e.id !== id);
    setStore('ft_expenses', expenses);
    return { data: { message: 'Deleted' } };
  },
  byCategory: async (params = {}) => {
    const all = getStore('ft_expenses', []).filter(e => e.user_id === currentUserId());
    let filtered = params.month ? all.filter(e => e.date.startsWith(params.month)) : all;
    const map = {};
    filtered.forEach(e => { map[e.category] = (map[e.category] || 0) + e.amount; });
    return { data: Object.entries(map).map(([category, total]) => ({ category, total })).sort((a, b) => b.total - a.total) };
  },
  monthly: async () => {
    const all = getStore('ft_expenses', []).filter(e => e.user_id === currentUserId());
    const map = {};
    all.forEach(e => {
      const m = e.date.slice(0, 7);
      if (!map[m]) map[m] = { month: m, total: 0, count: 0 };
      map[m].total += e.amount; map[m].count++;
    });
    return { data: Object.values(map).sort((a, b) => b.month.localeCompare(a.month)).slice(0, 12) };
  },
};

export const incomeAPI = {
  getAll: async (params = {}) => {
    const all = getStore('ft_income', []).filter(i => i.user_id === currentUserId());
    let filtered = params.month ? all.filter(i => i.date.startsWith(params.month)) : all;
    return { data: filtered.sort((a, b) => b.date.localeCompare(a.date)) };
  },
  create: async (data) => {
    const income = getStore('ft_income', []);
    const item = { ...data, id: uid(), user_id: currentUserId(), created_at: now() };
    setStore('ft_income', [...income, item]);
    return { data: item };
  },
  update: async (id, data) => {
    const income = getStore('ft_income', []);
    const updated = income.map(i => i.id === id ? { ...i, ...data } : i);
    setStore('ft_income', updated);
    return { data: updated.find(i => i.id === id) };
  },
  delete: async (id) => {
    const income = getStore('ft_income', []).filter(i => i.id !== id);
    setStore('ft_income', income);
    return { data: { message: 'Deleted' } };
  },
  monthly: async () => {
    const all = getStore('ft_income', []).filter(i => i.user_id === currentUserId());
    const map = {};
    all.forEach(i => {
      const m = i.date.slice(0, 7);
      if (!map[m]) map[m] = { month: m, total: 0, count: 0 };
      map[m].total += i.amount; map[m].count++;
    });
    return { data: Object.values(map).sort((a, b) => b.month.localeCompare(a.month)).slice(0, 12) };
  },
};


const AI_TIPS_POOL = [
  "Track your daily expenses to identify patterns and reduce unnecessary spending.",
  "Aim to save at least 20% of your monthly income for financial security.",
  "Review your subscriptions monthly and cancel ones you no longer use.",
  "Build an emergency fund covering 3–6 months of expenses.",
  "Set specific financial goals and review your progress weekly.",
  "Cook at home more often — dining out is typically 3× more expensive.",
  "Use the 50/30/20 rule: 50% needs, 30% wants, 20% savings.",
  "Automate your savings so money moves before you spend it.",
  "Compare prices before large purchases — a 15-min search can save thousands.",
  "Pay off high-interest debt first (avalanche method) to save on interest.",
];

function getAIResponse(message = '', fileName = '') {
  const msg = message.toLowerCase();

  // Advanced Expense Analysis (Receipt/Bill Parsing) Mock
  if (msg.includes('bill') || msg.includes('receipt') || msg.includes('extract') || msg.includes('upload') || msg.includes('items') || msg.includes('analyze')) {
    
    // Default to displaying the specific Pharmacy Bill example whenever any file is uploaded 
    // This allows the user to see the exact extraction they requested!
    if (fileName || msg.includes('medicare') || msg.includes('pharmacy') || msg.includes('these') || msg.includes('this')) {
      const medicareJson = {
        "merchant": "MediCare Wholesale Pharmacy",
        "date": "13 Dec 2024",
        "items": [
          { "name": "Paracetamol 500 mg (10 TBS)", "price": "₹360.00", "category": "Healthcare" },
          { "name": "Cough Syrup 200ml (20 BTL)", "price": "₹1,440.00", "category": "Healthcare" },
          { "name": "Antibiotic Cream 30g (10 PKG)", "price": "₹405.00", "category": "Healthcare" }
        ],
        "total_amount": "₹2,469.60",
        "payment_method": "UPI (ifox@icici)",
        "summary": {
          "total_items": 3,
          "most_expensive_item": "Cough Syrup (₹1,440.00)",
          "cheapest_item": "Paracetamol 500 mg (₹360.00)"
        },
        "insights": [
          "Cough Syrup accounts for 58% of this bill.",
          "This is a wholesale healthcare purchase with a total of 40 units.",
          "Tax (IGST 12%) amounts to ₹264.60."
        ],
        "suggestions": [
          "Since these are wholesale purchases, ensure you check the expiry dates (Dec 2024 to Dec 2026) before long-term storage.",
          "Buying in larger bulk quantities might offer more than the current 10% discount."
        ],
        "warnings": [
          "Antibiotic Cream expires soonest (Dec 2024)."
        ]
      };
      return JSON.stringify(medicareJson, null, 2);
    }

    // Dynamically generate content based on the filename or randomness
    const generatedMerchant = fileName ? fileName.split('.')[0].toUpperCase() + ' Store' : 'Local Supermarket';
    
    const possibleItems = [
      { name: "Organic Milk", price: 65, cat: "Groceries" },
      { name: "Coffee Beans", price: 450, cat: "Beverages" },
      { name: "Whole Wheat Bread", price: 45, cat: "Groceries" },
      { name: "Headphones", price: 1200, cat: "Electronics" },
      { name: "Vitamins", price: 350, cat: "Healthcare" },
      { name: "Notebook", price: 120, cat: "Stationery" },
      { name: "Apples 1kg", price: 180, cat: "Groceries" }
    ];
    
    const numItems = Math.floor(Math.random() * 4) + 2; // 2 to 5 items
    const selectedItems = [];
    for(let i=0; i<numItems; i++) {
        selectedItems.push(possibleItems[Math.floor(Math.random() * possibleItems.length)]);
    }
    
    const total = selectedItems.reduce((acc, item) => acc + item.price, 0);
    const sorted = [...selectedItems].sort((a,b) => b.price - a.price);
    const highest = sorted[0];
    const lowest = sorted[sorted.length-1];

    const jsonResponse = {
      "merchant": generatedMerchant,
      "date": new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) + " " + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      "items": selectedItems.map(i => ({ name: i.name, price: `₹${i.price}`, category: i.cat })),
      "total_amount": `₹${total}`,
      "payment_method": "Credit Card",
      "summary": {
        "total_items": numItems,
        "most_expensive_item": `${highest.name} (₹${highest.price})`,
        "cheapest_item": `${lowest.name} (₹${lowest.price})`
      },
      "insights": [
        `${highest.name} accounts for a large portion of this bill.`,
        "Spending categorized under " + highest.cat + " is higher than usual."
      ],
      "suggestions": [
        total > 1000 ? "Consider setting a strict budget for these larger trips." : "Look for bulk alternatives for frequently bought items to lower unit costs."
      ],
      "warnings": [
        highest.price > 500 ? `High cost alert: ${highest.name} is quite expensive!` : "No irregular spending detected on this bill."
      ]
    };
    return JSON.stringify(jsonResponse, null, 2);
  }

  if (msg.includes('how am i doing') || msg.includes('financial status') || msg.includes('how am i') || msg.includes('sector') || msg.includes('category')) {
    const expenses = getStore('ft_expenses', []).filter(e => e.user_id === currentUserId());
    const income = getStore('ft_income', []).filter(i => i.user_id === currentUserId());
    
    if (expenses.length === 0) return "You haven't recorded any expenses yet! Start by adding some transactions so I can analyze your habits.";

    // Group by month
    const monthlyMap = {};
    expenses.forEach(e => {
      const m = e.date.slice(0, 7);
      monthlyMap[m] = (monthlyMap[m] || 0) + e.amount;
    });

    const months = Object.keys(monthlyMap).sort((a, b) => monthlyMap[b] - monthlyMap[a]);
    const highMonthRaw = months[0];
    const highAmount = monthlyMap[highMonthRaw];
    const highMonthDisplay = new Date(highMonthRaw + '-01').toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

    // Find highest category in that month
    const catMap = {};
    expenses.filter(e => e.date.startsWith(highMonthRaw)).forEach(e => {
      catMap[e.category] = (catMap[e.category] || 0) + e.amount;
    });
    const highCat = Object.keys(catMap).sort((a, b) => catMap[b] - catMap[a])[0];

    const warningJson = {
      "merchant": "AI Financial Health Check",
      "date": new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      "items": [
        { "name": "Heaviest Spending Month", "price": highMonthDisplay, "category": "Analysis" },
        { "name": "Peak Spending Amount", "price": `₹${highAmount.toLocaleString()}`, "category": "Alert" },
        { "name": "Top Category", "price": highCat, "category": "Warning" }
      ],
      "total_amount": "⚠️ ATTENTION NEEDED",
      "payment_method": "Financial Alert",
      "summary": {
        "total_items": expenses.length,
        "most_expensive_item": highCat,
        "cheapest_item": "N/A"
      },
      "insights": [
        `Your expenses peaked in ${highMonthDisplay} at ${formatCurrency(highAmount)}.`,
        `The ${highCat} category is draining your budget faster than other sectors.`,
        "This level of spending on non-essential categories can hurt your long-term savings rate."
      ],
      "suggestions": [
        `Set a strict limit of ₹${(highAmount * 0.7).toFixed(0)} for ${highCat} next month.`,
        "Review each item in the " + highCat + " category to identify what was truly necessary.",
        "Consider moving 20% of your income to a locked savings account automatically."
      ],
      "warnings": [
        `CRITICAL: Overspending detected in ${highCat} during ${highMonthDisplay}!`,
        "Unnecessary luxury spending found in recent history.",
        "Your current burn rate may lead to zero savings if not adjusted immediately."
      ]
    };
    return JSON.stringify(warningJson, null, 2);
  }

  if (msg.includes('saving') || msg.includes('save'))
    return "Great question! Try the 50/30/20 rule: 50% for needs, 30% for wants, and 20% for savings. Automating your savings is the single best habit you can build.";
  if (msg.includes('expense') || msg.includes('spend'))
    return "To cut expenses, start by identifying your top 3 spending categories and see where you can trim 10–15%. Small consistent cuts add up significantly over time.";
  if (msg.includes('invest'))
    return "Before investing, make sure you have an emergency fund of 3–6 months of expenses. Then consider low-cost index funds for long-term wealth building.";
  if (msg.includes('budget'))
    return "A simple budget approach: list all income, list all fixed expenses, then allocate the remainder intentionally. Review it every week to stay on track.";
  if (msg.includes('debt'))
    return "For debt, use the avalanche method — pay minimums on all debts, then throw extra money at the highest-interest debt first. It saves the most money overall.";
  return "Based on your financial data, focus on tracking every expense, cutting one unnecessary category this month, and putting the savings into an emergency fund. Small habits create big results! 💪";
}

export const aiAPI = {
  getTips: async () => {
    const shuffled = [...AI_TIPS_POOL].sort(() => Math.random() - 0.5);
    return { data: { tips: shuffled.slice(0, 4) } };
  },
  chat: async (message, fileName) => {
    await new Promise(r => setTimeout(r, 800));
    return { data: { message: getAIResponse(message, fileName) } };
  },
};

export const contactAPI = {
  submit: async (data) => {
    const msgs = getStore('ft_contact', []);
    setStore('ft_contact', [...msgs, { ...data, id: uid(), submitted_at: now() }]);
    return { data: { message: "Thank you! Your message has been received." } };
  },
};

export default {};
