/**
 * Physics Unit Conversion System
 */

export type UnitType = 'length' | 'mass' | 'time' | 'velocity' | 'acceleration' | 'force' | 'energy' | 'momentum' | 'pressure' | 'temperature' | 'angle' | 'dimensionless';

export interface Unit {
    label: string;
    factor: number; // Factor to convert TO the base SI unit (unit * factor = SI)
    symbol: string;
}

export const UNIT_TYPES: Record<UnitType, Unit[]> = {
    length: [
        { label: 'Meters', factor: 1, symbol: 'm' },
        { label: 'Kilometers', factor: 1000, symbol: 'km' },
        { label: 'Centimeters', factor: 0.01, symbol: 'cm' },
        { label: 'Millimeters', factor: 0.001, symbol: 'mm' },
        { label: 'Miles', factor: 1609.34, symbol: 'mi' },
        { label: 'Feet', factor: 0.3048, symbol: 'ft' },
        { label: 'Inches', factor: 0.0254, symbol: 'in' },
    ],
    mass: [
        { label: 'Kilograms', factor: 1, symbol: 'kg' },
        { label: 'Grams', factor: 0.001, symbol: 'g' },
        { label: 'Milligrams', factor: 0.000001, symbol: 'mg' },
        { label: 'Pounds', factor: 0.453592, symbol: 'lb' },
        { label: 'Ounces', factor: 0.0283495, symbol: 'oz' },
    ],
    time: [
        { label: 'Seconds', factor: 1, symbol: 's' },
        { label: 'Minutes', factor: 60, symbol: 'min' },
        { label: 'Hours', factor: 3600, symbol: 'hr' },
        { label: 'Days', factor: 86400, symbol: 'day' },
        { label: 'Milliseconds', factor: 0.001, symbol: 'ms' },
    ],
    velocity: [
        { label: 'm/s', factor: 1, symbol: 'm/s' },
        { label: 'km/h', factor: 1 / 3.6, symbol: 'km/h' },
        { label: 'mi/h (mph)', factor: 0.44704, symbol: 'mph' },
        { label: 'ft/s', factor: 0.3048, symbol: 'ft/s' },
    ],
    acceleration: [
        { label: 'm/s²', factor: 1, symbol: 'm/s²' },
        { label: 'g (gravity)', factor: 9.80665, symbol: 'g' },
        { label: 'ft/s²', factor: 0.3048, symbol: 'ft/s²' },
    ],
    force: [
        { label: 'Newtons', factor: 1, symbol: 'N' },
        { label: 'Pounds-force', factor: 4.44822, symbol: 'lbf' },
        { label: 'Dynes', factor: 1e-5, symbol: 'dyn' },
    ],
    energy: [
        { label: 'Joules', factor: 1, symbol: 'J' },
        { label: 'Kilojoules', factor: 1000, symbol: 'kJ' },
        { label: 'Calories', factor: 4.184, symbol: 'cal' },
        { label: 'Kilocalories', factor: 4184, symbol: 'kcal' },
        { label: 'Watt-hours', factor: 3600, symbol: 'Wh' },
        { label: 'Electron-volts', factor: 1.60218e-19, symbol: 'eV' },
    ],
    momentum: [
        { label: 'kg·m/s', factor: 1, symbol: 'kg·m/s' },
        { label: 'N·s', factor: 1, symbol: 'N·s' },
    ],
    pressure: [
        { label: 'Pascals', factor: 1, symbol: 'Pa' },
        { label: 'Atmospheres', factor: 101325, symbol: 'atm' },
        { label: 'Bar', factor: 100000, symbol: 'bar' },
        { label: 'PSI', factor: 6894.76, symbol: 'psi' },
        { label: 'mmHg (Torr)', factor: 133.322, symbol: 'mmHg' },
    ],
    temperature: [
        { label: 'Kelvin', factor: 1, symbol: 'K' }, // Base unit
        // Celsius and Fahrenheit require affine transformations, handled separately
        { label: 'Celsius', factor: 1, symbol: '°C' },
        { label: 'Fahrenheit', factor: 1, symbol: '°F' },
    ],
    angle: [
        { label: 'Radians', factor: 1, symbol: 'rad' },
        { label: 'Degrees', factor: Math.PI / 180, symbol: '°' },
        { label: 'Revolutions', factor: 2 * Math.PI, symbol: 'rev' },
    ],
    dimensionless: [
        { label: 'None', factor: 1, symbol: '' },
    ],
};

// Mapping physics variables to their unit types
export const VARIABLE_TO_UNIT_TYPE: Record<string, UnitType> = {
    // Kinematics
    v: 'velocity',
    v0: 'velocity',
    vf: 'velocity',
    vi: 'velocity',
    a: 'acceleration',
    t: 'time',
    dt: 'time',
    d: 'length',
    x: 'length',
    x0: 'length',
    h: 'length',

    // Dynamics
    m: 'mass',
    F: 'force',
    W: 'energy', // In energy context
    mu: 'dimensionless',
    N: 'force',
    f: 'force',
    g: 'acceleration',

    // Energy
    KE: 'energy',
    PE: 'energy',
    P: 'pressure', // Or Power? Let's check context
    power: 'energy', // Actually Power is Energy/Time

    // Momentum
    p: 'momentum',
    J: 'momentum',
};

// Power unit type (added separately if needed)
// More specific mappings will be needed as we expand
