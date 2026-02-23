export type WaveVariable = 'f' | 'lambda' | 'T' | 'v' | 'A' | 'mu' | 'Tension' | 'k' | 'omega';

export const WAVE_VARIABLE_LABELS: Record<string, string> = {
    f: 'Frequency (Hz)',
    lambda: 'Wavelength (m)',
    T: 'Period (s)',
    v: 'Wave Speed (m/s)',
    A: 'Amplitude (m)',
    mu: 'Linear Mass Density (kg/m)',
    Tension: 'Tension Force (N)',
    k: 'Wave Number (rad/m)',
    omega: 'Angular Frequency (rad/s)',
};

export const WAVE_EQUATIONS = [
    {
        id: 'wave_v1',
        name: 'Wave Speed',
        latex: 'v = f \\lambda',
        variables: ['v', 'f', 'lambda'],
        solve: (values: any, target: WaveVariable) => {
            const v = parseFloat(values.v);
            const f = parseFloat(values.f);
            const lambda = parseFloat(values.lambda);

            if (target === 'v') return f * lambda;
            if (target === 'f') return v / lambda;
            if (target === 'lambda') return v / f;
            return 0;
        }
    },
    {
        id: 'wave_p1',
        name: 'Period and Frequency',
        latex: 'T = \\frac{1}{f}',
        variables: ['T', 'f'],
        solve: (values: any, target: WaveVariable) => {
            const T = parseFloat(values.T);
            const f = parseFloat(values.f);

            if (target === 'T') return 1 / f;
            if (target === 'f') return 1 / T;
            return 0;
        }
    },
    {
        id: 'wave_s1',
        name: 'Wave Speed on a String',
        latex: 'v = \\sqrt{\\frac{F_T}{\\mu}}',
        variables: ['v', 'Tension', 'mu'],
        solve: (values: any, target: WaveVariable) => {
            const v = parseFloat(values.v);
            const Tension = parseFloat(values.Tension);
            const mu = parseFloat(values.mu);

            if (target === 'v') return Math.sqrt(Tension / mu);
            if (target === 'Tension') return Math.pow(v, 2) * mu;
            if (target === 'mu') return Tension / Math.pow(v, 2);
            return 0;
        }
    },
    {
        id: 'wave_a1',
        name: 'Angular Frequency',
        latex: '\\omega = 2 \\pi f',
        variables: ['omega', 'f'],
        solve: (values: any, target: WaveVariable) => {
            const omega = parseFloat(values.omega);
            const f = parseFloat(values.f);

            if (target === 'omega') return 2 * Math.PI * f;
            if (target === 'f') return omega / (2 * Math.PI);
            return 0;
        }
    }
];
