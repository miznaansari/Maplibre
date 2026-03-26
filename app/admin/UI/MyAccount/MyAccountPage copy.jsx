export default function MyAccountPage() {
  return (
    <div className="min-h-screen bg-[#f4f8fb]">
      {/* ======= HEADER ======= */}
    
      {/* ======= CONTENT ======= */}
      <div className="max-w-6xl mx-auto px-4 py-12 grid md:grid-cols-2 gap-10">
        {/* ================= LOGIN ================= */}
        <div className="bg-white p-8 shadow-sm">
          <h2 className="text-lg font-semibold mb-6">Login</h2>

          <form className="space-y-4">
            <div>
              <label className="text-sm font-medium">
                Username or email address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full mt-1 border px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-sm font-medium">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                className="w-full mt-1 border px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* CAPTCHA PLACEHOLDER */}
            {/* <div className="border p-3 flex items-center gap-3 text-sm">
              <span className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">
                ✓
              </span>
              Success!
            </div> */}

            <button className="w-full bg-[#0b5fa5] text-white py-2 text-sm font-medium hover:bg-[#094f8a] transition">
              Log in
            </button>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" />
                Remember me
              </label>
              <a href="#" className="text-blue-600 hover:underline">
                Lost your password?
              </a>
            </div>
          </form>
        </div>

        {/* ================= REGISTER ================= */}
        <div className="bg-white p-8 shadow-sm">
          <h2 className="text-lg font-semibold mb-6">Register</h2>

          <form className="space-y-4">
            <div>
              <label className="text-sm font-medium">
                Email address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                className="w-full mt-1 border px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <p className="text-xs text-gray-600">
              A link to set a new password will be sent to your email address.
            </p>

            {/* CAPTCHA PLACEHOLDER */}
            {/* <div className="border p-3 flex items-center gap-3 text-sm">
              <span className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">
                ✓
              </span>
              Success!
            </div> */}

            <p className="text-xs text-gray-600">
              Your personal data will be used to support your experience
              throughout this website, to manage access to your account, and
              for other purposes described in our{" "}
              <span className="text-blue-600 cursor-pointer">
                privacy policy
              </span>
              .
            </p>

            <button className="w-full bg-[#0b5fa5] text-white py-2 text-sm font-medium hover:bg-[#094f8a] transition">
              Register
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
