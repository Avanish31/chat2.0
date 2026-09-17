export function CircularProgress({ progress, onCancel }) {
    const radius = 18;
    const circumference = 2 * Math.PI * radius;

    const isLoading = progress === 0;

    const offset = circumference - progress * circumference;

    return (
        <svg width="45" height="45" viewBox="0 0 45 45">

            {/* Background */}
            <circle
                cx="22.5"
                cy="22.5"
                r={radius}
                fill="none"
                stroke="#ddd"
                strokeWidth="4"
            />

            {isLoading ? (
                <g
                    style={{
                        transformOrigin: "22.5px 22.5px",
                        animation: "spin 1s linear infinite",
                    }}
                >
                    <circle
                        cx="22.5"
                        cy="22.5"
                        r={radius}
                        fill="none"
                        stroke="blue"
                        strokeWidth="4"
                        strokeDasharray={`${circumference * 0.25} ${circumference}`}
                        strokeLinecap="round"
                        transform="rotate(-90 22.5 22.5)"
                    />
                </g>
            ) : (
                <circle
                    cx="22.5"
                    cy="22.5"
                    r={radius}
                    fill="none"
                    stroke="blue"
                    strokeWidth="4"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    transform="rotate(-90 22.5 22.5)"
                />
            )}

            {/* Cancel */}
            <text
                x="22.5"
                y="22.5"
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="18"
                fill="black"
                style={{ cursor: "pointer" }}
                onClick={onCancel}
            >
                ×
            </text>
        </svg>
    );
}