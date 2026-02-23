export type MomentumVariable = 'p' | 'm' | 'v' | 'J' | 'F' | 'dt' | 'vi' | 'vf';

export const MOMENTUM_VARIABLE_LABELS: Record<string, string> = {
    p: 'Momentum (kg·m/s)',
    m: 'Mass (kg)',
    v: 'Velocity (m/s)',
    J: 'Impulse (N·s)',
    F: 'Force (N)',
    dt: 'Time Interval (s)',
    vi: 'Initial Velocity (m/s)',
    vf: 'Final Velocity (m/s)',
};

export const MOMENTUM_EQUATIONS = [
    {
        id: 'p1',
        name: 'Linear Momentum',
        latex: 'p = m v',
        variables: ['p', 'm', 'v'],
        solve: (values: any, target: MomentumVariable) => {
            const m = parseFloat(values.m);
            const v = parseFloat(values.v);
            const p = parseFloat(values.p);

            if (target === 'p') return m * v;
            if (target === 'm') return p / v;
            if (target === 'v') return p / m;
            return 0;
        }
    },
    {
        id: 'j1',
        name: 'Impulse (Force-Time)',
        latex: 'J = F \\Delta t',
        variables: ['J', 'F', 'dt'],
        solve: (values: any, target: MomentumVariable) => {
            const F = parseFloat(values.F);
            const dt = parseFloat(values.dt);
            const J = parseFloat(values.J);

            if (target === 'J') return F * dt;
            if (target === 'F') return J / dt;
            if (target === 'dt') return J / F;
            return 0;
        }
    },
    {
        id: 'j2',
        name: 'Impulse-Momentum Theorem',
        latex: 'J = m(v_f - v_i)',
        variables: ['J', 'm', 'vi', 'vf'],
        solve: (values: any, target: MomentumVariable) => {
            const m = parseFloat(values.m);
            const vi = parseFloat(values.vi);
            const vf = parseFloat(values.vf);
            const J = parseFloat(values.J);

            if (target === 'J') return m * (vf - vi);
            if (target === 'm') return J / (vf - vi);
            if (target === 'vf') return (J / m) + vi;
            if (target === 'vi') return vf - (J / m);
            return 0;
        }
    }
];
