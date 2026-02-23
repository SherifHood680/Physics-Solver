# Sophisticated Error Handling System

## Overview

This physics solver now implements a **multi-layered, intelligent error handling system** that gracefully recovers from AI parsing issues and provides helpful user feedback.

## Architecture

### 1. **Validation Layer** (`lib/physics/solver-validator.ts`)

The validation system provides:

- **Variable Normalization**: Automatically maps variables between different physics domains
  - Momentum ↔ Kinematics: `vi/vf` ↔ `v0/v`
  - Distance ↔ Position: `d` ↔ `x`
  - Time intervals: `t` ↔ `dt`

- **Input Validation**: Checks if all required variables are present for the selected equation

- **Intelligent Inference**: When validation fails, attempts to infer the correct equation based on:
  - Available variables
  - Target variable to solve for
  - Variable overlap scoring (80%+ confidence threshold)

- **Diagnostic Messages**: Generates human-readable error messages with:
  - Missing variables
  - Suggestions for fixes
  - Warnings about potential issues

### 2. **Recovery Mechanisms**

The system attempts recovery in this order:

1. **Normalization**: Convert variables to match the category's naming convention
2. **Validation**: Check if inputs are sufficient
3. **Inference**: If validation fails, try to find a better matching equation
4. **Re-normalization**: Apply normalization for the inferred category
5. **Re-validation**: Verify the inferred equation can solve the problem

### 3. **User Feedback**

Instead of cryptic error messages or crashes, users now see:

- **Visual Alerts** (`components/solution/ValidationAlert.tsx`):
  - Red alerts for errors
  - Blue alerts for suggestions
  - Yellow alerts for warnings
  - Green alerts for success with warnings

- **Actionable Buttons**:
  - "Complete in Manual Form" - Pre-fills known values and lets users add missing ones
  - Clear explanations of what went wrong and how to fix it

## Example Flow

### Scenario: Baseball Impulse Problem

**User Input**: "A 0.5kg baseball is moving at 30m/s. A batter hits it, changing its velocity to -40m/s. What was the total impulse applied to the ball?"

**AI Parsing**:
```json
{
  "category": "momentum",
  "equationId": "j2",
  "values": { "m": 0.5, "v0": 30, "v": -40 },
  "solveFor": "J"
}
```

**Problem**: AI used `v0` and `v` (kinematics notation) instead of `vi` and `vf` (momentum notation)

**System Response**:

1. **Normalization**: 
   - Detects category is "momentum"
   - Maps `v0` → `vi` (30)
   - Maps `v` → `vf` (-40)

2. **Validation**:
   - Checks equation `j2` requires: `m`, `vi`, `vf`
   - All present after normalization ✓

3. **Solving**:
   - Calculates: `J = m(vf - vi) = 0.5(-40 - 30) = -35 N·s`
   - Success! ✓

### Scenario: Missing Variable

**User Input**: "A ball is thrown upward with initial velocity 20m/s. What is its final velocity?"

**AI Parsing**:
```json
{
  "category": "kinematics",
  "equationId": "v1",
  "values": { "v0": 20 },
  "solveFor": "v"
}
```

**Problem**: Missing `a` (acceleration) and `t` (time)

**System Response**:

1. **Validation**: 
   - Equation `v1` requires: `v0`, `a`, `t`
   - Missing: `a`, `t` ✗

2. **Inference**:
   - Attempts to find alternative equations
   - No equation can solve for `v` with only `v0` available
   - Confidence too low ✗

3. **User Feedback**:
   - Shows **ValidationAlert** with:
     - Error: "Missing required variables: a, t"
     - Suggestion: "Please provide values for: 'a', 't'"
     - Button: "Complete in Manual Form"
   - Switches to Manual Form tab
   - Pre-fills `v0 = 20`
   - User can add missing values

## Benefits

### For Users:
- **No more crashes** - Graceful error handling
- **Clear guidance** - Know exactly what's missing
- **Quick fixes** - One-click to manual form with pre-filled values
- **Learning tool** - Understand what variables are needed for each equation

### For Developers:
- **Centralized validation** - Single source of truth
- **Extensible** - Easy to add new variable mappings
- **Debuggable** - Comprehensive console logging
- **Maintainable** - Separated concerns (validation, UI, solving)

## Configuration

### Adding New Variable Mappings

Edit `lib/physics/solver-validator.ts`:

```typescript
const VARIABLE_MAPPINGS: VariableMapping[] = [
  // Add your mapping
  { from: 'sourceVar', to: 'targetVar', category: 'physics_category' },
  // ...
];
```

### Adding New Equation Requirements

```typescript
const EQUATION_REQUIREMENTS: Record<string, { variables: string[], category: string }> = {
  'your_equation_id': { 
    variables: ['var1', 'var2', 'var3'], 
    category: 'your_category' 
  },
  // ...
};
```

## Testing

To test the error handling:

1. **Test normalization**: Use kinematics variables in momentum problems
2. **Test inference**: Provide variables that match multiple equations
3. **Test missing values**: Omit required variables
4. **Test edge cases**: Division by zero, negative square roots, etc.

## Future Enhancements

- [ ] Suggest default values (e.g., g = 9.81 m/s²)
- [ ] Multi-step problem solving
- [ ] Unit conversion and validation
- [ ] Interactive variable selection in UI
- [ ] AI re-prompting with error context
