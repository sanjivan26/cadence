interface LoadingScreenProps {
    message?: string;
}

function LoadingScreen({
    message = "Loading...",
}: LoadingScreenProps) {
    return (
        <>
            <style>{`
        .loading-screen {
          min-height: 100vh;
          width: 100%;

          display: flex;
          align-items: center;
          justify-content: center;

          background: #09090b;
          color: #f4f4f5;
        }

        .loading-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;

          text-align: center;
        }

        .loading-wave {
          height: 48px;

          display: flex;
          align-items: center;
          justify-content: center;

          gap: 7px;

          margin-bottom: 24px;
        }

        .loading-wave span {
          width: 7px;
          height: 12px;

          border-radius: 999px;

          background: #8b5cf6;

          transform-origin: center;

          animation: cadence-wave 2.5s ease-in-out infinite;
        }

        .loading-wave span:nth-child(1) {
          animation-delay: -1.80s;
        }

        .loading-wave span:nth-child(2) {
          animation-delay: -1.50s;
        }

        .loading-wave span:nth-child(3) {
          animation-delay: -1.20s;
        }

        .loading-wave span:nth-child(4) {
          animation-delay: -0.90s;
        }

        .loading-wave span:nth-child(5) {
          animation-delay: -0.60s;
        }

        .loading-wave span:nth-child(6) {
          animation-delay: -0.30s;
        }

        .loading-wave span:nth-child(7) {
          animation-delay: 0s;
        }

        @keyframes cadence-wave {
          0%,
          100% {
            height: 10px;
            opacity: 0.45;
          }

          25% {
            height: 24px;
            opacity: 0.70;
          }

          50% {
            height: 44px;
            opacity: 1;
          }

          75% {
            height: 24px;
            opacity: 0.70;
          }
        }

        .loading-message {
          margin: 0;

          color: #a1a1aa;

          font-size: 13px;
          line-height: 1.5;
        }
      `}</style>

            <div className="loading-screen">
                <div className="loading-content">

                    <div
                        className="loading-wave"
                        aria-hidden="true"
                    >
                        <span />
                        <span />
                        <span />
                        <span />
                        <span />
                        <span />
                        <span />
                    </div>

                    <p className="loading-message">
                        {message}
                    </p>

                </div>
            </div>
        </>
    );
}

export default LoadingScreen;