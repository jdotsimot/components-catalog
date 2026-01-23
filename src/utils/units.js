/**
 * Pad a number to consistent decimal places based on unit system
 * IN: 4 decimal places (e.g., 1.0000, 2.1271)
 * MM: 2 decimal places (e.g., 25.40, 54.03)
 */
export const padNumber = (value, unit) => {
    if (value === undefined || value === null || value === '') return null;

    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return value;

    const decimals = unit === 'mm' ? 2 : 4;
    return num.toFixed(decimals);
};

export const convertValue = (value, targetUnit) => {
    if (value === undefined || value === null) return null;

    // Clean up string input if necessary (remove "OD", "ID", etc)
    const numericVal = typeof value === 'string'
        ? parseFloat(value.replace(/[^\d.-]/g, ''))
        : value;

    if (isNaN(numericVal)) return value; // Return original if not a number

    // Heuristic: Assume input < 15 is typically inches, > 15 is typically mm for these components
    // OR we rely on catalog metadata. For now, we assume catalog data is NATIVE.
    // We need to know the SOURCE unit to convert accurately.
    // This is tricky without explicit metadata in every field.

    // STRATEGY: The App passes the formatted string.
    // But for raw numbers:
    // If target is MM and value is small (likely inch), multiply.
    // If target is IN and value is large (likely mm), divide.

    // BETTER: Let the Component handle the logic based on specific field knowledge.
    // This utility simply does the math.

    if (targetUnit === 'mm') {
        return (numericVal * 25.4).toFixed(2); // 2 decimal places for mm
    } else {
        return (numericVal / 25.4).toFixed(4); // 4 decimal places for inch precision
    }
};

/**
 * Convert and format a dimension value between unit systems
 * Always returns consistently padded output (4 decimals for IN, 2 for MM)
 */
export const formatDimension = (val, sourceUnit, targetUnit) => {
    if (val === undefined || val === null || val === '') return null;

    const num = parseFloat(val);
    if (isNaN(num)) return val;

    const decimals = targetUnit === 'mm' ? 2 : 4;

    if (sourceUnit === targetUnit) {
        return num.toFixed(decimals);
    }

    if (sourceUnit === 'in' && targetUnit === 'mm') {
        return (num * 25.4).toFixed(decimals);
    }
    if (sourceUnit === 'mm' && targetUnit === 'in') {
        return (num / 25.4).toFixed(decimals);
    }
    return num.toFixed(decimals);
};
