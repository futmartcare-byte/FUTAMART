export default function ProCrown({ size = "sm" }) {
  const sizes = {
    sm: "text-base",
    md: "text-xl",
    lg: "text-3xl",
  };
  return (
    <span
      className={`inline-block ${sizes[size]} select-none`}
      title="Pro Seller"
      style={{
        filter: "drop-shadow(0 2px 4px rgba(245,158,11,0.8)) drop-shadow(0 0 8px rgba(251,191,36,0.5))",
        transform: "rotate(-5deg)",
        display: "inline-block",
      }}
    >
      👑
    </span>
  );
}
