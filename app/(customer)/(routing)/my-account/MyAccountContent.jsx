export default function MyAccountContent({ title, children }) {
    return (
        <main className="flex-1   rounded ">
            {/* BREADCRUMB */}
            <p className=" text-sm text-gray-600">
                My Account <span className="mx-1 text-[#0172BC]">{">"}</span>
                <span className="font-medium text-[#0172BC]">{title}</span>
            </p>

            {children}
        </main>
    );
}
