export type UnitCategory = 'length' | 'time' | 'mass' | 'velocity' | 'acceleration';

const CONVERSIONS: Record<string, number> = {
    // Length (Base: meters)
    'm': 1,
    'km': 1000,
    'cm': 0.01,
    'mm': 0.001,
    'ft': 0.3048,
    'in': 0.0254,
    'mi': 1609.34,

    // Time (Base: seconds)
    's': 1,
    'min': 60,
    'h': 3600,
    'ms': 0.001,

    // Velocity (Base: m/s)
    'm/s': 1,
    'km/h': 1 / 3.6,
    'mph': 0.44704,
    'ft/s': 0.3048,

    // Acceleration (Base: m/s²)
    'm/s2': 1,
    'm/s^2': 1,
    'ft/s2': 0.3048,
    'g': 9.80665,
};

export function convertValue(value: number, fromUnit: string, toUnit: string): number {
    const fromFactor = CONVERSIONS[fromUnit];
    const toFactor = CONVERSIONS[toUnit];

    if (!fromFactor || !toFactor) {
        console.warn(`Unit conversion not supported: ${fromUnit} to ${toUnit}`);
        return value;
    }

    // Convert to base, then to target
    const baseValue = value * fromFactor;
    return baseValue / toFactor;
}

export function standardizeUnits(values: Record<string, number>, unitMap: Record<string, string>): Record<string, number> {
    const standardized: Record<string, number> = {};

    for (const [key, val] of Object.entries(values)) {
        const unit = unitMap[key];
        if (unit) {
            // Find base unit for category
            // This is a simplified version, ideally we'd have a mapping of variables to categories
            let targetUnit = 'm/s'; // default
            if (key === 't') targetUnit = 's';
            if (key === 'a') targetUnit = 'm/s2';
            if (key === 'x' || key === 'x0') targetUnit = 'm';

            standardized[key] = convertValue(val, unit, targetUnit);
        } else {
            standardized[key] = val;
        }
    }

    return standardized;
}
