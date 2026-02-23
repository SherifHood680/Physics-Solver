export type AdvancedVariable = 'L' | 'H' | 'T' | 'V' | 'q' | 'qdot' | 'p' | 'E';

export const ADVANCED_VARIABLE_LABELS: Record<string, string> = {
    L: 'Lagrangian (J)',
    H: 'Hamiltonian (J)',
    T: 'Kinetic Energy (J)',
    V: 'Potential Energy (J)',
    q: 'Generalized Coordinate',
    qdot: 'Generalized Velocity',
    p: 'Generalized Momentum (kg·m/s)',
    E: 'Total Energy (J)',
};

export const ADVANCED_EQUATIONS = [
    {
        id: 'lag_1',
        name: 'Lagrangian',
        latex: 'L = T - V',
        variables: ['L', 'T', 'V'],
        solve: (values: any, target: AdvancedVariable) => {
            const L = parseFloat(values.L);
            const T = parseFloat(values.T);
            const V = parseFloat(values.V);

            if (target === 'L') return T - V;
            if (target === 'T') return L + V;
            if (target === 'V') return T - L;
            return 0;
        }
    },
    {
        id: 'ham_1',
        name: 'Hamiltonian (Conservative)',
        latex: 'H = T + V',
        variables: ['H', 'T', 'V'],
        solve: (values: any, target: AdvancedVariable) => {
            const H = parseFloat(values.H);
            const T = parseFloat(values.T);
            const V = parseFloat(values.V);

            if (target === 'H') return T + V;
            if (target === 'T') return H - V;
            if (target === 'V') return H - T;
            return 0;
        }
    },
    {
        id: 'energy_1',
        name: 'Total Mechanical Energy',
        latex: 'E = T + V',
        variables: ['E', 'T', 'V'],
        solve: (values: any, target: AdvancedVariable) => {
            const E = parseFloat(values.E);
            const T = parseFloat(values.T);
            const V = parseFloat(values.V);

            if (target === 'E') return T + V;
            if (target === 'T') return E - V;
            if (target === 'V') return E - T;
            return 0;
        }
    }
];
