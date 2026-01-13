// import { useState } from "react";
// import api from "../api/axios";
// import { useNavigate } from "react-router-dom";

// const CreateGig = () => {
//   const [form, setForm] = useState({ title: "", description: "", budget: "" });
//   const navigate = useNavigate();

//   const submit = async (e) => {
//     e.preventDefault();
//     await api.post("/gigs", form);
//     navigate("/");
//   };

//   return (
//     <form onSubmit={submit} style={{ padding: 20 }}>
//       <h2>Create Gig</h2>

//       <input placeholder="Title" onChange={e => setForm({ ...form, title: e.target.value })} /><br /><br />
//       <textarea placeholder="Description" onChange={e => setForm({ ...form, description: e.target.value })} /><br /><br />
//       <input placeholder="Budget" onChange={e => setForm({ ...form, budget: e.target.value })} /><br /><br />

//       <button>Create</button>
//     </form>
//   );
// };

// export default CreateGig;






import { useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

const CreateGig = () => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    budget: "",
  });

  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    await api.post("/gigs", {
      ...form,
      budget: Number(form.budget), // ensure number is sent
    });
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900">Post a New Gig</h1>
          <p className="mt-3 text-lg text-gray-600">
            Describe your project and attract the best freelancers
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <form onSubmit={submit} className="p-6 sm:p-8 lg:p-10 space-y-8">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Gig Title <span className="text-red-500">*</span>
              </label>
              <input
                id="title"
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Build a responsive landing page in React"
                className="block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-colors"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Full Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                rows={8}
                required
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Provide detailed requirements, tech stack preferences, timeline expectations, deliverables, etc."
                className="block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm resize-none transition-colors"
              />
              <p className="mt-2 text-sm text-gray-500">
                The more details you provide, the better proposals you'll receive.
              </p>
            </div>

            {/* Budget */}
            <div>
              <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-2">
                Budget (₹ INR) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">₹</span>
                </div>
                <input
                  id="budget"
                  type="number"
                  min="1"
                  required
                  value={form.budget}
                  onChange={(e) => setForm({ ...form, budget: e.target.value })}
                  placeholder="25000"
                  className="block w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-colors"
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                This is your total project budget (fixed price).
              </p>
            </div>

            {/* Submit Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                Publish Gig
              </button>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="w-full sm:w-auto px-8 py-3 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateGig;