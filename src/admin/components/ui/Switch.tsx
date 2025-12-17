import { motion } from 'framer-motion';

interface SwitchProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
    label?: string;
}

export function Switch({ checked, onChange, disabled = false, label }: SwitchProps) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            disabled={disabled}
            onClick={() => !disabled && onChange(!checked)}
            className={`
                relative inline-flex h-[31px] w-[51px] shrink-0 cursor-pointer rounded-full
                transition-colors duration-200 ease-in-out
                focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
                ${checked ? 'bg-blue-500' : 'bg-neutral-300 dark:bg-neutral-600'}
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
        >
            <span className="sr-only">{label || 'Toggle'}</span>
            <motion.span
                layout
                transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 30
                }}
                className={`
                    pointer-events-none inline-block h-[27px] w-[27px] transform rounded-full
                    bg-white shadow-lg ring-0 transition duration-200 ease-in-out
                    ${checked ? 'translate-x-5' : 'translate-x-0.5'}
                `}
                style={{ marginTop: '2px' }}
            />
        </button>
    );
}
