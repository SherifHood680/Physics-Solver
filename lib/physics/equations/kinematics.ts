import { evaluate } from 'mathjs';

export type Variable = 'v' | 'v0' | 'a' | 't' | 'x' | 'x0';

export interface KinematicEquation {
    id: string;
    name: string;
    latex: string;
    variables: Variable[];
    solve: (values: Record<string, number>, target: Variable) => number;
}

export const KINEMATIC_EQUATIONS: KinematicEquation[] = [
    {
        id: 'v1',
        name: 'Velocity-Time',
        latex: 'v = v_0 + at',
        variables: ['v', 'v0', 'a', 't'],
        solve: (values, target) => {
            const { v, v0, a, t } = values;
            switch (target) {
                case 'v': return (v0 || 0) + (a || 0) * (t || 0);
                case 'v0': return (v || 0) - (a || 0) * (t || 0);
                case 'a': return ((v || 0) - (v0 || 0)) / (t || 0);
                case 't': return ((v || 0) - (v0 || 0)) / (a || 0);
                default: throw new Error(`Cannot solve for ${target} in ${'v = v_0 + at'}`);
            }
        }
    },
    {
        id: 'x1',
        name: 'Displacement-Time',
        latex: 'x = x_0 + v_0t + \\frac{1}{2}at^2',
        variables: ['x', 'x0', 'v0', 't', 'a'],
        solve: (values, target) => {
            const { x, x0, v0, t, a } = values;
            switch (target) {
                case 'x': return (x0 || 0) + (v0 || 0) * (t || 0) + 0.5 * (a || 0) * (t || 0) ** 2;
                case 'x0': return (x || 0) - ((v0 || 0) * (t || 0) + 0.5 * (a || 0) * (t || 0) ** 2);
                case 'v0': return ((x || 0) - (x0 || 0) - 0.5 * (a || 0) * (t || 0) ** 2) / (t || 0);
                case 'a': return 2 * ((x || 0) - (x0 || 0) - (v0 || 0) * (t || 0)) / ((t || 0) ** 2);
                // t requires quadratic formula, simpler to handle separately or assume t > 0
                default: throw new Error(`Complex solving for ${target} not yet implemented for this equation`);
            }
        }
    },
    {
        id: 'v2',
        name: 'Velocity-Displacement',
        latex: 'v^2 = v_0^2 + 2a(x - x_0)',
        variables: ['v', 'v0', 'a', 'x', 'x0'],
        solve: (values, target) => {
            const { v, v0, a, x, x0 } = values;
            switch (target) {
                case 'v': return Math.sqrt((v0 || 0) ** 2 + 2 * (a || 0) * ((x || 0) - (x0 || 0)));
                case 'v0': return Math.sqrt((v || 0) ** 2 - 2 * (a || 0) * ((x || 0) - (x0 || 0)));
                case 'a': return ((v || 0) ** 2 - (v0 || 0) ** 2) / (2 * ((x || 0) - (x0 || 0)));
                case 'x': return ((v || 0) ** 2 - (v0 || 0) ** 2) / (2 * (a || 0)) + (x0 || 0);
                case 'x0': return (x || 0) - ((v || 0) ** 2 - (v0 || 0) ** 2) / (2 * (a || 0));
                default: throw new Error(`Cannot solve for ${target}`);
            }
        }
    },
    {
        id: 'x2',
        name: 'Average Velocity',
        latex: 'x = x_0 + \\frac{1}{2}(v + v_0)t',
        variables: ['x', 'x0', 'v', 'v0', 't'],
        solve: (values, target) => {
            const { x, x0, v, v0, t } = values;
            switch (target) {
                case 'x': return (x0 || 0) + 0.5 * ((v || 0) + (v0 || 0)) * (t || 0);
                case 't': return 2 * ((x || 0) - (x0 || 0)) / ((v || 0) + (v0 || 0));
                // ... extend as needed
                default: throw new Error(`Cannot solve for ${target}`);
            }
        }
    }
];

export const VARIABLE_LABELS: Record<Variable, string> = {
    v: 'Final Velocity (m/s)',
    v0: 'Initial Velocity (m/s)',
    a: 'Acceleration (m/s²)',
    t: 'Time (s)',
    x: 'Final Position (m)',
    x0: 'Initial Position (m)'
};
