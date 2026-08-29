function PixAlbumIcon() {
    return (
        <svg
            width="64"
            height="64"
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* Top-left */}
            <path
                d="M8 20V8H20"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            {/* Top-right */}
            <path
                d="M44 8H56V20"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            {/* Bottom-left */}
            <path
                d="M8 44V56H20"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            {/* Bottom-right */}
            <path
                d="M56 44V56H44"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            {/* Album */}
            <rect
                x="13"
                y="19"
                width="30"
                height="30"
                rx="3"
                transform="rotate(-10 13 19)"
                fill="none"
                stroke="#A855F7"
                strokeWidth="4"
            />

            <rect
                x="22"
                y="15"
                width="30"
                height="30"
                rx="3"
                transform="rotate(8 22 15)"
                fill="#A855F7"
            />

            {/* Album centre */}
            <circle
                cx="37"
                cy="30"
                r="7"
                fill="#111111"
            />

            <circle
                cx="37"
                cy="30"
                r="2"
                fill="white"
            />
        </svg>
    );
}

export default PixAlbumIcon;