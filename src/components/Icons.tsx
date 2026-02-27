interface IconProps {
    size?: number;
    className?: string;
    color?: string;
}

const defaultProps = { size: 18, className: "", color: "currentColor" };

export function IconTrending({ size, className, color }: IconProps = defaultProps) {
    const s = size ?? 18;
    return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color ?? "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
        </svg>
    );
}

export function IconRecent({ size, className, color }: IconProps = defaultProps) {
    const s = size ?? 18;
    return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color ?? "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
        </svg>
    );
}

export function IconGem({ size, className, color }: IconProps = defaultProps) {
    const s = size ?? 18;
    return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color ?? "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M6 3h12l4 6-10 13L2 9z" /><path d="M11 3l3 6-2 13" /><path d="M13 3l-3 6 2 13" /><path d="M2 9h20" />
        </svg>
    );
}

export function IconChat({ size, className, color }: IconProps = defaultProps) {
    const s = size ?? 18;
    return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color ?? "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
    );
}

export function IconMapPin({ size, className, color }: IconProps = defaultProps) {
    const s = size ?? 18;
    return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color ?? "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
        </svg>
    );
}

export function IconClock({ size, className, color }: IconProps = defaultProps) {
    const s = size ?? 18;
    return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color ?? "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
        </svg>
    );
}

export function IconCheck({ size, className, color }: IconProps = defaultProps) {
    const s = size ?? 18;
    return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color ?? "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
        </svg>
    );
}

export function IconStar({ size, className, color }: IconProps = defaultProps) {
    const s = size ?? 18;
    return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill={color ?? "currentColor"} stroke={color ?? "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
    );
}

export function IconStarOutline({ size, className, color }: IconProps = defaultProps) {
    const s = size ?? 18;
    return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color ?? "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
    );
}

export function IconUp({ size, className, color }: IconProps = defaultProps) {
    const s = size ?? 18;
    return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color ?? "currentColor"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <polyline points="18 15 12 9 6 15" />
        </svg>
    );
}

export function IconDown({ size, className, color }: IconProps = defaultProps) {
    const s = size ?? 18;
    return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color ?? "currentColor"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <polyline points="6 9 12 15 18 9" />
        </svg>
    );
}

export function IconWarning({ size, className, color }: IconProps = defaultProps) {
    const s = size ?? 18;
    return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color ?? "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
    );
}

export function IconCompass({ size, className, color }: IconProps = defaultProps) {
    const s = size ?? 18;
    return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color ?? "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <circle cx="12" cy="12" r="10" /><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
        </svg>
    );
}

export function IconGlobe({ size, className, color }: IconProps = defaultProps) {
    const s = size ?? 18;
    return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color ?? "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
    );
}
