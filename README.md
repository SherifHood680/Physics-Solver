# Physics Solver

Physics Solver is a powerful, AI-driven physics engine built with Next.js. It helps students and professionals solve physics problems by providing both a manual equation-based form and a natural language AI parser.

## 🚀 Features

- **AI-Powered Interpretation**: Describe your physics problem in plain English, and the AI will extract the known values, identify the correct equation, and solve it for you.
- **Comprehensive Equation Library**:
  - **Kinematics**: Velocity, acceleration, displacement, and time.
  - **Dynamics**: Newton's laws, friction, and weight.
  - **Energy**: Work, kinetic energy, potential energy, and power.
  - **Momentum**: Momentum, impulse, and collisions.
  - **Thermodynamics**: Ideal gas law, heat transfer, and kinetic theory.
  - **Rotational Motion**: Torque, angular momentum, and rotational kinetic energy.
  - **Waves**: Wave speed, frequency, period, and tension.
  - **Advanced Physics**: Lagrangian and Hamiltonian mechanics.
- **Step-by-Step Solutions**: Don't just get the answer; see how it was calculated with LaTeX-rendered mathematical steps.
- **Constants Library**: Built-in access to common physical constants like $g$, $R$, and $k_B$.
- **Personal History**: Save your solved problems and review them later (requires Supabase login).

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/) & [Lucide Icons](https://lucide.dev/)
- **Mathematics**: [KaTeX](https://katex.org/) & [math.js](https://mathjs.org/)
- **Backend / Auth**: [Supabase](https://supabase.com/)
- **AI Integration**: [Groq](https://groq.com/) / [Google Generative AI](https://ai.google.dev/) / [OpenAI](https://openai.com/)

## 🏁 Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project
- API keys for Groq, Google Generative AI, or OpenAI

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/Physics_Solver.git
   cd Physics_Solver
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Copy `.env.example` to `.env.local` and fill in your keys:
   ```bash
   cp .env.example .env.local
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
