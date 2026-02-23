export type ThermoVariable = 'P' | 'V' | 'n' | 'T' | 'Q' | 'm' | 'c' | 'dT' | 'L' | 'Kavg';

export const THERMO_VARIABLE_LABELS: Record<string, string> = {
    P: 'Pressure (Pa)',
    V: 'Volume (m³)',
    n: 'Amount (moles)',
    T: 'Temperature (K)',
    Q: 'Heat Energy (J)',
    m: 'Mass (kg)',
    c: 'Specific Heat (J/kg·K)',
    dT: 'Temp Change (ΔT) (K)',
    L: 'Latent Heat (J/kg)',
    Kavg: 'Avg Kinetic Energy (J)',
};

const R = 8.314; // Ideal gas constant
const k = 1.38e-23; // Boltzmann constant

export const THERMO_EQUATIONS = [
    {
        id: 'pv1',
        name: 'Ideal Gas Law',
        latex: 'P V = n R T',
        variables: ['P', 'V', 'n', 'T'],
        solve: (values: any, target: ThermoVariable) => {
            const P = parseFloat(values.P);
            const V = parseFloat(values.V);
            const n = parseFloat(values.n);
            const T = parseFloat(values.T);

            if (target === 'P') return (n * R * T) / V;
            if (target === 'V') return (n * R * T) / P;
            if (target === 'n') return (P * V) / (R * T);
            if (target === 'T') return (P * V) / (n * R);
            return 0;
        }
    },
    {
        id: 'q1',
        name: 'Specific Heat',
        latex: 'Q = m c \\Delta T',
        variables: ['Q', 'm', 'c', 'dT'],
        solve: (values: any, target: ThermoVariable) => {
            const Q = parseFloat(values.Q);
            const m = parseFloat(values.m);
            const c = parseFloat(values.c);
            const dT = parseFloat(values.dT);

            if (target === 'Q') return m * c * dT;
            if (target === 'm') return Q / (c * dT);
            if (target === 'c') return Q / (m * dT);
            if (target === 'dT') return Q / (m * c);
            return 0;
        }
    },
    {
        id: 'q2',
        name: 'Latent Heat',
        latex: 'Q = m L',
        variables: ['Q', 'm', 'L'],
        solve: (values: any, target: ThermoVariable) => {
            const Q = parseFloat(values.Q);
            const m = parseFloat(values.m);
            const L = parseFloat(values.L);

            if (target === 'Q') return m * L;
            if (target === 'm') return Q / L;
            if (target === 'L') return Q / m;
            return 0;
        }
    },
    {
        id: 'k1',
        name: 'Kinetic Theory (Avg K)',
        latex: 'K_{avg} = \\frac{3}{2} k T',
        variables: ['Kavg', 'T'],
        solve: (values: any, target: ThermoVariable) => {
            const T = parseFloat(values.T);
            const Kavg = parseFloat(values.Kavg);

            if (target === 'Kavg') return 1.5 * k * T;
            if (target === 'T') return Kavg / (1.5 * k);
            return 0;
        }
    }
];
