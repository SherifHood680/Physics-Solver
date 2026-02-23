export type DynamicsVariable = 'F' | 'm' | 'a' | 'W' | 'g' | 'mu' | 'N' | 'f';

export interface DynamicsEquation {
    id: string;
    name: string;
    latex: string;
    variables: DynamicsVariable[];
    solve: (values: Record<string, number>, target: DynamicsVariable) => number;
}

export const DYNAMICS_EQUATIONS: DynamicsEquation[] = [
    {
        id: 'f1',
        name: "Newton's Second Law",
        latex: 'F = ma',
        variables: ['F', 'm', 'a'],
        solve: (values, target) => {
            const { F, m, a } = values;
            switch (target) {
                case 'F': return (m || 0) * (a || 0);
                case 'm': return (F || 0) / (a || 1);
                case 'a': return (F || 0) / (m || 1);
                default: throw new Error(`Cannot solve for ${target}`);
            }
        }
    },
    {
        id: 'w1',
        name: 'Weight',
        latex: 'W = mg',
        variables: ['W', 'm', 'g'],
        solve: (values, target) => {
            const { W, m, g } = values;
            const G = g || 9.81;
            switch (target) {
                case 'W': return (m || 0) * G;
                case 'm': return (W || 0) / G;
                case 'g': return (W || 0) / (m || 1);
                default: throw new Error(`Cannot solve for ${target}`);
            }
        }
    },
    {
        id: 'ff1',
        name: 'Friction Force',
        latex: 'f = \\mu N',
        variables: ['f', 'mu', 'N', 'm'],
        solve: (values, target) => {
            const mu = values.mu || 0;
            let N = values.N;

            // Helpful substitution: If N is missing but mass is provided, assume N = mg
            if (N === undefined && values.m !== undefined) {
                N = values.m * (values.g || 9.81);
            }

            const nVal = N || 0;
            const fVal = values.f || 0;

            switch (target) {
                case 'f': return mu * nVal;
                case 'mu': return fVal / (nVal || 1);
                case 'N': return fVal / (mu || 1);
                default: throw new Error(`Cannot solve for ${target}`);
            }
        }
    }
];

export const DYNAMICS_VARIABLE_LABELS: Record<string, string> = {
    F: 'Net Force (N)',
    m: 'Mass (kg)',
    a: 'Acceleration (m/s²)',
    W: 'Weight (N)',
    g: 'Gravity (m/s²)',
    mu: 'Coefficient of Friction (μ)',
    N: 'Normal Force (N)',
    f: 'Friction Force (N)'
};
