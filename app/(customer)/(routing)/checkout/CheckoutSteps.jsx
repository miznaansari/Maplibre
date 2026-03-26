export default function CheckoutSteps({ step }) {

  const Step = ({ number, label }) => (
    <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-3 text-center sm:text-left">

      {/* CIRCLE */}
      <div
        className={`h-7 w-7 sm:h-8 sm:w-8 flex items-center justify-center rounded-full text-xs sm:text-sm font-semibold
        ${
          step >= number
            ? "bg-cyan-400 text-black"
            : "bg-white/10 text-gray-400"
        }`}
      >
        {number}
      </div>

      {/* LABEL */}
      <span
        className={`text-[11px] sm:text-sm whitespace-nowrap
        ${
          step >= number
            ? "text-cyan-400"
            : "text-gray-500"
        }`}
      >
        {label}
      </span>

    </div>
  );

  return (
    <div className="flex items-center justify-between sm:justify-center gap-2 sm:gap-8 w-full">

      <Step number={1} label="Address" />

      {/* LINE */}
      <div className="flex-1 sm:w-16 h-[1px] bg-white/10" />

      <Step number={2} label="Review" />

      {/* LINE */}
      <div className="flex-1 sm:w-16 h-[1px] bg-white/10" />

      <Step number={3} label="Payment" />

    </div>
  );
}