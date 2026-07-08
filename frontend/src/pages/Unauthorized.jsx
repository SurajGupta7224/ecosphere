const Unauthorized = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] text-slate-300">
      <div className="text-center p-8 bg-slate-800 rounded-xl shadow-xl border border-slate-700 max-w-md w-full">
        <h1 className="text-4xl font-bold text-red-500 mb-4">403</h1>
        <h2 className="text-2xl font-semibold text-white mb-2">Access Denied</h2>
        <p className="text-slate-400 mb-6">
          You do not have permission to view this page. Please contact your administrator if you believe this is a mistake.
        </p>
        <button 
          onClick={() => window.history.back()}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          Go Back
        </button>
      </div>
    </div>
  );
};

export default Unauthorized;
