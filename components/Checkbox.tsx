
import React from 'react';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
    id: string;
    label: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({ id, label, ...props }) => {
    return (
        <div className="flex items-center">
            <input
                id={id}
                name={id}
                type="checkbox"
                {...props}
                className="h-4 w-4 rounded bg-hud-bg-secondary border-hud-border text-hud-accent focus:ring-hud-accent"
            />
            <label htmlFor={id} className="ml-2 block text-sm text-hud-text">
                {label}
            </label>
        </div>
    );
};
