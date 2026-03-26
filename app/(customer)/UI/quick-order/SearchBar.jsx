import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

export default function SearchBar() {
    return (
        <div className="w-full flex justify-center">
            <div className="w-full max-w-5xl px-4 py-4">
                <div className="relative">
                    {/* Icon */}
                    <MagnifyingGlassIcon
                        className="absolute left-4 top-1/2 h-5 ml-3 w-5 -translate-y-1/2 text-gray-400"
                    />

                    {/* Input */}
                    <input
                        type="text"
                        placeholder="Search for Products"
                        className="
              w-full
              pl-10
              rounded
              border
              border-gray-200
              bg-white
              py-3
              pl-12
              pr-4
              text-sm
              text-gray-700
              placeholder-gray-400
              outline-none
              focus:border-blue-500
              focus:ring-1
              focus:ring-blue-500
            "
                    />
                </div>
            </div>
        </div>
    );
}
