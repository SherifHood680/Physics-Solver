export type EnergyVariable = 'W' | 'F' | 'd' | 'theta' | 'K' | 'm' | 'v' | 'U' | 'g' | 'h' | 'P' | 't';

export const ENERGY_VARIABLE_LABELS: Record<string, string> = {
    W: 'Work (J)',
    F: 'Force (N)',
    d: 'Displacement (m)',
    theta: 'Angle (degrees)',
    K: 'Kinetic Energy (J)',
    m: 'Mass (kg)',
    v: 'Velocity (m/s)',
    U: 'Potential Energy (J)',
    g: 'Gravity (m/s²)',
    h: 'Height (m)',
    P: 'Power (W)',
    t: 'Time (s)',
};

export const ENERGY_EQUATIONS = [
    {
        id: 'work1',
        name: 'Work-Force-Distance',
        latex: 'W = F d \\cos(\\theta)',
        variables: ['W', 'F', 'd', 'theta'],
        solve: (values: any, target: EnergyVariable) => {
            const F = values.F ?? 0;
            const d = values.d ?? 0;
            const thetaDeg = values.theta ?? 0;
            const thetaRad = (thetaDeg * Math.PI) / 180;
            const W = values.W ?? 0;

            if (target === 'W') return F * d * Math.cos(thetaRad);
            if (target === 'F') return W / (d * Math.cos(thetaRad));
            if (target === 'd') return W / (F * Math.cos(thetaRad));
            if (target === 'theta') return (Math.acos(W / (F * d)) * 180) / Math.PI;
            return 0;
        },
    },
    {
        id: 'ke1',
        name: 'Kinetic Energy',
        latex: 'K = \\frac{1}{2}mv^2',
        variables: ['K', 'm', 'v'],
        solve: (values: any, target: EnergyVariable) => {
            const m = values.m ?? 0;
            const v = values.v ?? 0;
            const K = values.K ?? 0;

            if (target === 'K') return 0.5 * m * Math.pow(v, 2);
            if (target === 'm') return (2 * K) / Math.pow(v, 2);
            if (target === 'v') return Math.sqrt((2 * K) / m);
            return 0;
        },
    },
    {
        id: 'pe1',
        name: 'Potential Energy',
        latex: 'U = mgh',
        variables: ['U', 'm', 'g', 'h'],
        solve: (values: any, target: EnergyVariable) => {
            const m = values.m ?? 0;
            const g = values.g ?? 9.81;
            const h = values.h ?? 0;
            const U = values.U ?? 0;

            if (target === 'U') return m * g * h;
            if (target === 'm') return U / (g * h);
            if (target === 'g') return U / (m * h);
            if (target === 'h') return U / (m * g);
            return 0;
        },
    },
    {
        id: 'power1',
        name: 'Power',
        latex: 'P = \\frac{W}{t}',
        variables: ['P', 'W', 't'],
        solve: (values: any, target: EnergyVariable) => {
            const W = values.W ?? 0;
            const t = values.t ?? 1;
            const P = values.P ?? 0;

            if (target === 'P') return W / t;
            if (target === 'W') return P * t;
            if (target === 't') return W / P;
            return 0;
        },
    },
];
