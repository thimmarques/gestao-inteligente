import React, { useState } from 'react';

interface AvatarProps {
    src?: string | null;
    name?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'custom';
    className?: string;
    onClick?: () => void;
}

export const Avatar: React.FC<AvatarProps> = ({
    src,
    name = '',
    size = 'md',
    className = '',
    onClick
}) => {
    const [imageError, setImageError] = useState(false);

    const getInitials = (fullName: string) => {
        if (!fullName) return '??';
        const names = fullName.trim().split(/\s+/);
        if (names.length === 0) return '??';
        if (names.length === 1) return names[0].substring(0, 2).toUpperCase();
        return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    };

    const sizeClasses = {
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-16 h-16 text-xl',
        xl: 'w-24 h-24 text-3xl',
        '2xl': 'w-32 h-32 text-4xl',
        custom: ''
    };

    const baseClasses = `
    relative rounded-full flex items-center justify-center overflow-hidden 
    font-bold select-none transition-all
    ${sizeClasses[size]} 
    ${className}
  `;

    const fallbackBackgrounds = [
        'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
        'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
        'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
        'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
        'bg-lime-100 text-lime-600 dark:bg-lime-900/30 dark:text-lime-400',
        'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
        'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
        'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400',
        'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400',
        'bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400',
        'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
        'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400',
        'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400',
        'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
        'bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-900/30 dark:text-fuchsia-400',
        'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400',
        'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400',
    ];

    const getHash = (str: string) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        return hash;
    };

    const getBackgroundClass = (name: string) => {
        const hash = getHash(name);
        const index = Math.abs(hash) % fallbackBackgrounds.length;
        return fallbackBackgrounds[index];
    };

    return (
        <div
            className={`${baseClasses} ${(!src || imageError) ? getBackgroundClass(name) : 'bg-slate-100 dark:bg-slate-800'}`}
            onClick={onClick}
        >
            {src && !imageError ? (
                <img
                    src={src}
                    alt={name}
                    className="w-full h-full object-cover object-center"
                    onError={() => setImageError(true)}
                    draggable={false}
                />
            ) : (
                <span>{getInitials(name)}</span>
            )}
        </div>
    );
};
