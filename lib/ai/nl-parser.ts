import { aiClient, AI_MODEL } from './ai-client';

export async function parsePhysicsProblem(problemText: string) {
  const systemPrompt = `You are a physics problem parsing assistant. 
IMPORTANT: Your response must be a strictly valid JSON object and nothing else. Do not include any markdown formatting like \`\`\`json.

- Available Domains: kinematics, dynamics, energy, momentum, thermodynamics, rotational, waves, advanced

- Target Equations:
    - kinematics: v1, d1, d2, v2, x2
    - dynamics: f1, w1, ff1
    - energy: work1, ke1, pe1, power1
    - momentum: p1, j1, j2
    - thermodynamics: pv1, q1, q2, k1
    - rotational: rot_tau1, rot_L1, rot_ke1, rot_kin1
    - waves: wave_v1, wave_p1, wave_s1, wave_a1
    - advanced: lag_1, ham_1, energy_1

- IMPORTANT VARIABLE NAMING RULES:
    - momentum: ALWAYS use 'vi' for initial velocity, 'vf' for final velocity, and 'dt' for time intervals. DO NOT use 'v0', 'v', or 't'.
    - kinematics: ALWAYS use 'v0' for initial, 'v' for final, 'a' for acceleration, 't' for time, and 'x'/'x0' for positions.
    - dynamics: Use 'm' for mass, 'a' for acceleration, 'F' for force, 'mu' for friction coefficient, 'N' for normal force.
    - energy: Use 'm' for mass, 'v' for velocity, 'h' for height, 'W' for work, 'P' for power, 'd' for distance.

Output JSON Format Example:
{
  "category": "momentum",
  "equationId": "j2",
  "values": { "m": 0.5, "vi": 30, "vf": -40 },
  "solveFor": "J",
  "explanation": "Calculates impulse based on change in momentum."
}
`;

  console.log('--- AI PARSE START ---');

  try {
    const response = await aiClient.chat.completions.create({
      model: AI_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: problemText }
      ],
      response_format: { type: 'json_object' }
    });

    const text = response.choices[0]?.message?.content;
    console.log('Raw Groq Response:', text);

    if (!text) throw new Error('No content in AI response');

    const parsed = JSON.parse(text);
    console.log('Parsed JSON Success');
    return parsed;
  } catch (error: any) {
    console.error('AI PARSE ERROR:', error.message);
    if (error.status) {
      console.error('API Status:', error.status);
      console.error('API Error details:', error.error);
    }
    console.error('Full error object:', error);
    throw error;
  }
}
