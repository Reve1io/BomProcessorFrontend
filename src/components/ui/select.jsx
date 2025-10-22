import React from 'react';

export function Select({ children, onValueChange }) {
    return <select onChange={e => onValueChange?.(e.target.value)}>{children}</select>;
}

export function SelectTrigger({ children }) {
    return <>{children}</>;
}

export function SelectContent({ children }) {
    return <>{children}</>;
}

export function SelectItem({ value, children }) {
    return <option value={value}>{children}</option>;
}

export function SelectValue({ placeholder }) {
    return <>{placeholder}</>;
}
