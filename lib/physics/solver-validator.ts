/**
 * Sophisticated solver validation and recovery system
 * Handles variable mismatches, missing values, and intelligent fallbacks
 */

export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    suggestions: string[];
    normalizedValues?: Record<string, number>;
    suggestedCategory?: string;
    suggestedEquationId?: string;
}

export interface VariableMapping {
    from: string;
    to: string;
    category: string;
}

// Comprehensive variable mapping rules
const VARIABLE_MAPPINGS: VariableMapping[] = [
    // Momentum <-> Kinematics velocity mappings
    { from: 'v0', to: 'vi', category: 'momentum' },
    { from: 'v', to: 'vf', category: 'momentum' },
    { from: 'v1', to: 'vi', category: 'momentum' },
    { from: 'v2', to: 'vf', category: 'momentum' },
    { from: 'vi', to: 'v0', category: 'kinematics' },
    { from: 'vf', to: 'v', category: 'kinematics' },

    // Distance <-> Position mappings
    { from: 'd', to: 'x', category: 'kinematics' },
    { from: 'x', to: 'd', category: 'energy' },

    // Time interval mappings
    { from: 't', to: 'dt', category: 'momentum' },
    { from: 'dt', to: 't', category: 'kinematics' },
];

// Category-specific required variables for each equation
const EQUATION_REQUIREMENTS: Record<string, { variables: string[], category: string }> = {
    // Kinematics
    'v1': { variables: ['v0', 'a', 't'], category: 'kinematics' },
    'x1': { variables: ['x0', 'v0', 't', 'a'], category: 'kinematics' },
    'v2': { variables: ['v0', 'a', 'x', 'x0'], category: 'kinematics' },
    'x2': { variables: ['x0', 'v', 'v0', 't'], category: 'kinematics' },

    // Dynamics
    'f1': { variables: ['m', 'a'], category: 'dynamics' },
    'w1': { variables: ['m'], category: 'dynamics' },
    'ff1': { variables: ['mu', 'N'], category: 'dynamics' },

    // Energy
    'work1': { variables: ['F', 'd'], category: 'energy' },
    'ke1': { variables: ['m', 'v'], category: 'energy' },
    'pe1': { variables: ['m', 'h'], category: 'energy' },
    'power1': { variables: ['W', 't'], category: 'energy' },

    // Momentum
    'p1': { variables: ['m', 'v'], category: 'momentum' },
    'j1': { variables: ['F', 'dt'], category: 'momentum' },
    'j2': { variables: ['m', 'vi', 'vf'], category: 'momentum' },

    // Thermodynamics
    'pv1': { variables: ['P', 'V', 'n', 'T'], category: 'thermodynamics' },
    'q1': { variables: ['Q', 'm', 'c', 'dT'], category: 'thermodynamics' },
    'q2': { variables: ['Q', 'm', 'L'], category: 'thermodynamics' },
    'k1': { variables: ['Kavg', 'T'], category: 'thermodynamics' },

    // Rotational
    'rot_tau1': { variables: ['tau', 'I', 'alpha'], category: 'rotational' },
    'rot_L1': { variables: ['L', 'I', 'omega'], category: 'rotational' },
    'rot_ke1': { variables: ['Krot', 'I', 'omega'], category: 'rotational' },
    'rot_kin1': { variables: ['omega', 'omega0', 'alpha', 't'], category: 'rotational' },

    // Waves
    'wave_v1': { variables: ['v', 'f', 'lambda'], category: 'waves' },
    'wave_p1': { variables: ['T', 'f'], category: 'waves' },
    'wave_s1': { variables: ['v', 'Tension', 'mu'], category: 'waves' },
    'wave_a1': { variables: ['omega', 'f'], category: 'waves' },

    // Advanced
    'lag_1': { variables: ['L', 'T', 'V'], category: 'advanced' },
    'ham_1': { variables: ['H', 'T', 'V'], category: 'advanced' },
    'energy_1': { variables: ['E', 'T', 'V'], category: 'advanced' },
};

/**
 * Normalize variable names based on category
 */
export function normalizeVariables(
    values: Record<string, number>,
    category: string
): Record<string, number> {
    const normalized = { ...values };

    // Apply category-specific mappings
    VARIABLE_MAPPINGS
        .filter(mapping => mapping.category === category)
        .forEach(mapping => {
            if (normalized[mapping.from] !== undefined && normalized[mapping.to] === undefined) {
                normalized[mapping.to] = normalized[mapping.from];
            }
        });

    return normalized;
}

/**
 * Validate if values are sufficient for solving
 */
export function validateSolverInputs(
    values: Record<string, number>,
    equationId: string,
    solveFor: string,
    category: string
): ValidationResult {
    const result: ValidationResult = {
        isValid: true,
        errors: [],
        warnings: [],
        suggestions: [],
    };

    // Get equation requirements
    const requirements = EQUATION_REQUIREMENTS[equationId];
    if (!requirements) {
        result.errors.push(`Unknown equation: ${equationId}`);
        result.isValid = false;
        return result;
    }

    // Normalize variables first
    const normalizedValues = normalizeVariables(values, category);
    result.normalizedValues = normalizedValues;

    // Check if category matches
    if (requirements.category !== category) {
        result.warnings.push(
            `Equation ${equationId} belongs to ${requirements.category}, but category is set to ${category}`
        );
        result.suggestedCategory = requirements.category;
    }

    // Check for required variables (excluding the solve target)
    const requiredVars = requirements.variables.filter(v => v !== solveFor);
    const missingVars: string[] = [];
    const presentVars: string[] = [];

    requiredVars.forEach(varName => {
        const value = normalizedValues[varName];
        if (value === undefined || value === null || isNaN(value)) {
            missingVars.push(varName);
        } else {
            presentVars.push(varName);
        }
    });

    // Report missing variables
    if (missingVars.length > 0) {
        result.errors.push(`Missing required variables: ${missingVars.join(', ')}`);
        result.suggestions.push(
            `Please provide values for: ${missingVars.map(v => `'${v}'`).join(', ')}`
        );
        result.isValid = false;
    }

    // Check for division by zero scenarios
    Object.entries(normalizedValues).forEach(([key, value]) => {
        if (value === 0 && presentVars.includes(key)) {
            result.warnings.push(`Variable '${key}' is zero, which may cause division errors`);
        }
    });

    return result;
}

/**
 * Attempt to infer the correct category and equation based on variables and solveFor
 */
export function inferEquation(
    values: Record<string, number>,
    solveFor: string
): { category: string; equationId: string; confidence: number } | null {
    const availableVars = Object.keys(values).filter(
        k => values[k] !== undefined && values[k] !== null && !isNaN(values[k])
    );

    let bestMatch: { category: string; equationId: string; confidence: number } | null = null;
    let highestScore = 0;

    // Score each equation based on variable overlap
    Object.entries(EQUATION_REQUIREMENTS).forEach(([eqId, req]) => {
        const requiredVars = req.variables.filter(v => v !== solveFor);
        const normalizedForCategory = normalizeVariables(values, req.category);
        const normalizedAvailableVars = Object.keys(normalizedForCategory).filter(
            k => normalizedForCategory[k] !== undefined && !isNaN(normalizedForCategory[k])
        );

        // Calculate overlap score
        const overlap = requiredVars.filter(v => normalizedAvailableVars.includes(v)).length;
        const score = overlap / requiredVars.length;

        // Check if this equation can solve for the target
        const canSolveTarget = req.variables.includes(solveFor);

        if (canSolveTarget && score > highestScore && score >= 0.8) {
            highestScore = score;
            bestMatch = {
                category: req.category,
                equationId: eqId,
                confidence: score,
            };
        }
    });

    return bestMatch;
}

/**
 * Generate helpful diagnostic message for users
 */
export function generateDiagnosticMessage(validation: ValidationResult): string {
    if (validation.isValid) {
        return 'All inputs are valid.';
    }

    const parts: string[] = [];

    if (validation.errors.length > 0) {
        parts.push('**Issues found:**');
        validation.errors.forEach(err => parts.push(`• ${err}`));
    }

    if (validation.suggestions.length > 0) {
        parts.push('\n**Suggestions:**');
        validation.suggestions.forEach(sug => parts.push(`• ${sug}`));
    }

    if (validation.warnings.length > 0) {
        parts.push('\n**Warnings:**');
        validation.warnings.forEach(warn => parts.push(`• ${warn}`));
    }

    return parts.join('\n');
}
