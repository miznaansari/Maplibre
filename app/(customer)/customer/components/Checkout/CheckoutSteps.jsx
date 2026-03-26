export default function CheckoutSteps({ currentStep = 2 }) {
    const steps = [
        { id: 1, label: "Shopping Cart" },
        { id: 2, label: "Checkout" },
        { id: 3, label: "Order Complete" },
    ];

    return (
        <div className="flex w-full justify-center">
            <div className="w-full max-w-5xl flex flex-col m-auto justify-center   mx-auto px-4 py-6">
                <div className="flex items-center justify-between ">
                    {steps.map((step, index) => {
                        const isCompleted = step.id < currentStep;
                        const isActive = step.id === currentStep;
                        const isLast = index === steps.length - 1;

                        return (
                            <div key={step.id} className="flex-1 flex items-center">
                                {/* Node + Label */}
                                <div className="flex flex-col items-center">
                                    {/* Circle */}
                                    <div
                                        className={`z-10 flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold
                    ${isCompleted || isActive
                                                ? "bg-blue-500 text-white"
                                                : "bg-gray-200 text-gray-500"
                                            }
                  `}
                                    >
                                        {step.id}
                                    </div>

                                    {/* Label */}
                                    <span
                                        className={`mt-2 text-sm text-center
                    ${isCompleted || isActive
                                                ? "text-gray-900"
                                                : "text-gray-400"
                                            }
                  `}
                                    >
                                        {step.label}
                                    </span>
                                </div>

                                {/* Connector Line */}
                                {!isLast && (
                                    <div className="flex-1 h-0.5 mx-2 mt-[-22px] mb-6">
                                        <div
                                            className={`h-full
                      ${step.id < currentStep
                                                    ? "bg-blue-500"
                                                    : "bg-gray-200"
                                                }
                    `}
                                        />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div></div>
    );
}
