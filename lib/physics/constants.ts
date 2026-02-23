/**
 * Physical Constants Library
 */

export interface PhysicalConstant {
    name: string;
    symbol: string;
    value: number;
    unit: string;
    latex: string;
    description: string;
}

export const PHYSICAL_CONSTANTS: PhysicalConstant[] = [
    {
        name: "Acceleration due to Gravity",
        symbol: "g",
        value: 9.80665,
        unit: "m/s²",
        latex: "g",
        description: "Standard acceleration due to Earth's gravity at sea level."
    },
    {
        name: "Universal Gravitational Constant",
        symbol: "G",
        value: 6.67430e-11,
        unit: "m³·kg⁻¹·s⁻²",
        latex: "G",
        description: "Constant in Newton's law of universal gravitation."
    },
    {
        name: "Speed of Light",
        symbol: "c",
        value: 299792458,
        unit: "m/s",
        latex: "c",
        description: "Exact speed of light in a vacuum."
    },
    {
        name: "Planck Constant",
        symbol: "h",
        value: 6.62607015e-34,
        unit: "J·s",
        latex: "h",
        description: "Relates the energy of a photon to its frequency."
    },
    {
        name: "Boltzmann Constant",
        symbol: "k_B",
        value: 1.380649e-23,
        unit: "J/K",
        latex: "k_B",
        description: "Relates thermal energy to temperature."
    },
    {
        name: "Ideal Gas Constant",
        symbol: "R",
        value: 8.314462618,
        unit: "J/(mol·K)",
        latex: "R",
        description: "The molar gas constant in the ideal gas law."
    },
    {
        name: "Elementary Charge",
        symbol: "e",
        value: 1.602176634e-19,
        unit: "C",
        latex: "e",
        description: "Magnitude of electric charge carried by a single electron."
    },
    {
        name: "Electron Mass",
        symbol: "m_e",
        value: 9.1093837e-31,
        unit: "kg",
        latex: "m_e",
        description: "Rest mass of an electron."
    },
    {
        name: "Proton Mass",
        symbol: "m_p",
        value: 1.6726219e-27,
        unit: "kg",
        latex: "m_p",
        description: "Rest mass of a proton."
    },
    {
        name: "Avogadro Constant",
        symbol: "N_A",
        value: 6.02214076e23,
        unit: "mol⁻¹",
        latex: "N_A",
        description: "Number of constituent particles in one mole of substance."
    },
    {
        name: "Permittivity of Free Space",
        symbol: "ε₀",
        value: 8.8541878128e-12,
        unit: "F/m",
        latex: "\\epsilon_0",
        description: "Physical constant describing how an electric field affects a vacuum."
    },
    {
        name: "Permeability of Free Space",
        symbol: "μ₀",
        value: 1.25663706212e-6,
        unit: "N/A²",
        latex: "\\mu_0",
        description: "Physical constant representing the magnetic permeability of a vacuum."
    }
];
