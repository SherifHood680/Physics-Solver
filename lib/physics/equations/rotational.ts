export type RotationalVariable = 'theta' | 'omega' | 'alpha' | 'tau' | 'I' | 'L' | 'Krot' | 'r' | 'F' | 't' | 'omega0';

export const ROTATIONAL_VARIABLE_LABELS: Record<string, string> = {
    theta: 'Angular Displacement (rad)',
    omega: 'Angular Velocity (rad/s)',
    omega0: 'Initial Angular Velocity (rad/s)',
    alpha: 'Angular Acceleration (rad/s²)',
    tau: 'Torque (N·m)',
    I: 'Moment of Inertia (kg·m²)',
    L: 'Angular Momentum (kg·m²/s)',
    Krot: 'Rotational Kinetic Energy (J)',
    r: 'Radius (m)',
    F: 'Applied Force (N)',
    t: 'Time (s)',
};

export const ROTATIONAL_EQUATIONS = [
    {
        id: 'rot_tau1',
        name: 'Torque (Inertia)',
        latex: '\\tau = I \\alpha',
        variables: ['tau', 'I', 'alpha'],
        solve: (values: any, target: RotationalVariable) => {
            const I = parseFloat(values.I);
            const alpha = parseFloat(values.alpha);
            const tau = parseFloat(values.tau);

            if (target === 'tau') return I * alpha;
            if (target === 'I') return tau / alpha;
            if (target === 'alpha') return tau / I;
            return 0;
        }
    },
    {
        id: 'rot_L1',
        name: 'Angular Momentum',
        latex: 'L = I \\omega',
        variables: ['L', 'I', 'omega'],
        solve: (values: any, target: RotationalVariable) => {
            const I = parseFloat(values.I);
            const omega = parseFloat(values.omega);
            const L = parseFloat(values.L);

            if (target === 'L') return I * omega;
            if (target === 'I') return L / omega;
            if (target === 'omega') return L / I;
            return 0;
        }
    },
    {
        id: 'rot_ke1',
        name: 'Rotational Kinetic Energy',
        latex: 'K_{rot} = \\frac{1}{2} I \\omega^2',
        variables: ['Krot', 'I', 'omega'],
        solve: (values: any, target: RotationalVariable) => {
            const I = parseFloat(values.I);
            const omega = parseFloat(values.omega);
            const Krot = parseFloat(values.Krot);

            if (target === 'Krot') return 0.5 * I * Math.pow(omega, 2);
            if (target === 'I') return (2 * Krot) / Math.pow(omega, 2);
            if (target === 'omega') return Math.sqrt((2 * Krot) / I);
            return 0;
        }
    },
    {
        id: 'rot_kin1',
        name: 'Angular Velocity (Kinematics)',
        latex: '\\omega = \\omega_0 + \\alpha t',
        variables: ['omega', 'omega0', 'alpha', 't'],
        solve: (values: any, target: RotationalVariable) => {
            const omega0 = parseFloat(values.omega0);
            const alpha = parseFloat(values.alpha);
            const t = parseFloat(values.t);
            const omega = parseFloat(values.omega);

            if (target === 'omega') return omega0 + alpha * t;
            if (target === 'omega0') return omega - alpha * t;
            if (target === 'alpha') return (omega - omega0) / t;
            if (target === 't') return (omega - omega0) / alpha;
            return 0;
        }
    }
];
