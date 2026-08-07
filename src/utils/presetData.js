/**
 * Presets weak prompts for instant demonstration of Collaborative Prompting
 */

export const PRESET_PROMPTS = [
  {
    id: 'code-fix',
    category: 'Software Engineering',
    badge: 'Weak / Vague',
    icon: 'Code',
    title: 'Fix my code',
    prompt: 'help me fix my code error',
    mockRawResponse: `It looks like you have an error in your code. Please share the code snippet and the exact error message so I can help you fix it!`,
    mockEnhancedResponse: `### 🛠 Executive Summary
As a Senior Software Engineer, I will systematically diagnose and resolve your code error. 

### 📋 Diagnostic Checklist
1. **Error Type Identification**: Specify if it is a Syntax Error, Runtime Crash, or Logic Failure.
2. **Environment Context**: Confirm your language version (e.g. Node 18, Python 3.11).
3. **Minimal Reproducible Example**: Provide the smallest code block triggering the issue.

### 💡 Standard Debugging Steps
\`\`\`javascript
// Step 1: Wrap in try-catch to log callstack
try {
  executeTask();
} catch (error) {
  console.error("Diagnostic Trace:", error.stack);
}
\`\`\`

### 🎯 Next Action Steps
- Reply with your current code snippet and the exact console stack trace for instant refactored code.`
  },
  {
    id: 'workout-plan',
    category: 'Health & Fitness',
    badge: 'Weak / Vague',
    icon: 'Dumbbell',
    title: 'Make a workout plan',
    prompt: 'make a workout plan for me',
    mockRawResponse: `Here is a basic workout plan: Monday: Chest, Tuesday: Back, Wednesday: Legs, Thursday: Shoulders, Friday: Arms. Rest on weekends.`,
    mockEnhancedResponse: `### 🏋️ Executive Summary
As a Certified Fitness & Exercise Science Specialist, here is a structured 4-week Progressive Overload Training Split designed for maximum safety and strength gains.

### 📊 Program Breakdown (Push / Pull / Legs Split)

| Day | Muscle Focus | Core Exercises | Sets x Reps | Rest |
| :--- | :--- | :--- | :--- | :--- |
| **Day 1** | Push (Chest/Shoulders/Triceps) | Barbell Bench Press, Overhead Press, Dips | 4 x 8-10 | 90s |
| **Day 2** | Pull (Back/Biceps) | Barbell Deadlifts, Lat Pulldowns, Incline Dumbbell Curls | 4 x 8-10 | 90s |
| **Day 3** | Active Recovery / Cardio | Zone 2 Jogging or Swimming | 30 mins | N/A |
| **Day 4** | Legs & Lower Body | Romanian Deadlifts, Barbell Squats, Calf Raises | 4 x 10-12 | 120s |

### ⚡ Critical Execution Rules & Constraints
- **Warmup**: Perform 5-10 minutes of dynamic stretching prior to working sets.
- **Hydration**: Consume 3L of water daily + 25g-30g protein per main meal.

### 🎯 Next Action Steps
Track your working weights weekly and increase load by 2.5% once all target reps are cleanly achieved.`
  },
  {
    id: 'business-email',
    category: 'Communication',
    badge: 'Weak / Vague',
    icon: 'Mail',
    title: 'Email my manager',
    prompt: 'write an email to my boss asking for a raise',
    mockRawResponse: `Hi Boss, I have been working hard lately and would like to ask for a raise. Let me know if we can discuss this. Thanks!`,
    mockEnhancedResponse: `### 📩 Executive Summary
As an Executive Business Communication Strategist, here is a persuasive, metrics-backed salary adjustment proposal formatted for executive review.

---

**Subject**: Compensation Review Request - Q3 Impact & Value Addition Summary

**Dear [Manager's Name],**

I hope you are having a productive week.

Over the past [12 months], I have been focused on driving key deliverables for [Project/Team Name], including:
1. **Revenue / Efficiency Impact**: Successfully delivered [Key Project], increasing output by [X%].
2. **Expanded Scope**: Took ownership of [New Responsibility], managing [Client/Team Deliverable].
3. **Operational Leadership**: Mentored [X] team members and streamlined workflow processes.

Given these contributions and aligned with current market benchmarks for [Job Title], I would appreciate the opportunity to schedule a brief 20-minute meeting next week to discuss reviewing my current base compensation.

I have attached a brief impact brief for your reference prior to our call. Thank you for your leadership and continuous support!

Best regards,  
**[Your Name]**  
[Your Title]

---

### 🔑 Key Strengths of this Refined Version
- **Data-Driven**: Highlights specific deliverables rather than vague hard work.
- **Professional Persona**: Preserves executive respect while standing firm on value delivered.`
  },
  {
    id: 'ai-explain',
    category: 'Education',
    badge: 'Weak / Vague',
    icon: 'Brain',
    title: 'Explain Quantum Computing',
    prompt: 'explain quantum computing simply',
    mockRawResponse: `Quantum computing uses qubits instead of bits. Qubits can be 0 and 1 at the same time because of superposition. Entanglement makes them connected.`,
    mockEnhancedResponse: `### ⚛️ Executive Summary
As a Master Educator and Pedagogical Specialist, here is an intuitive breakdown of Quantum Computing using real-world analogies, without math jargon.

### 🪙 Bit vs. Qubit Analogy
- **Classical Bit (Regular Computer)**: Think of a coin lying flat on a table. It is strictly **Heads (1)** or **Tails (0)**.
- **Qubit (Quantum Computer)**: Think of a coin **spinning rapidly** on the table. While spinning, it is a blend of both Heads and Tails simultaneously until it stops. This property is called **Superposition**.

### 🌐 Key Quantum Principles Explained Simply

| Concept | Simple Analogy | Why it Matters |
| :--- | :--- | :--- |
| **Superposition** | Spinning coin (0 & 1 at once) | Lets computers evaluate millions of possibilities concurrently. |
| **Entanglement** | Magic twin dice (roll one, instantly know the other) | Allows instant synchronization across qubits for exponential speedups. |

### 🚀 Real-World Applications
1. **Drug Discovery**: Simulating complex molecular structures in seconds instead of decades.
2. **Logistics Optimization**: Calculating global supply routes simultaneously.

### 🎯 Summary
Quantum computers aren't just faster regular computers—they solve entirely different categories of complex problems by manipulating quantum mechanics.`
  }
];
