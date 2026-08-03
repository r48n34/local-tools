import classes from "../../../pages/tools/LuckyDraw.module.css";

const COLORS = ["#ff6b6b", "#ffd43b", "#51cf66", "#339af0", "#845ef7", "#f06595"];

function LuckyDrawConfetti() {
    return (
        <div className={classes.confettiLayer} aria-hidden="true">
            {Array.from({ length: 36 }, (_, index) => (
                <i
                    key={index}
                    className={classes.confettiPiece}
                    style={{
                        left: `${(index * 37) % 100}%`,
                        backgroundColor: COLORS[index % COLORS.length],
                        animationDelay: `${(index % 9) * 45}ms`,
                        animationDuration: `${1.8 + (index % 5) * 0.18}s`,
                    }}
                />
            ))}
        </div>
    );
}

export default LuckyDrawConfetti;
