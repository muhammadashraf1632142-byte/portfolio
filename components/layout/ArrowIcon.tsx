type ArrowIconProps = {
  direction?: "up-right" | "down";
  className?: string;
};

export function ArrowIcon({ direction = "up-right", className }: ArrowIconProps) {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d={direction === "down" ? "M12 4v16m-7-7 7 7 7-7" : "M5 19 19 5M5 5h14v14"}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
    </svg>
  );
}
