import { useParams } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";

const GigDetails = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);

  const [gig, setGig] = useState(null);
  const [bids, setBids] = useState([]);
  const [price, setPrice] = useState("");
  const [message, setMessage] = useState("");

  // Fetch gig details
  useEffect(() => {
    api
      .get(`/gigs/${id}`)
      .then(res => setGig(res.data))
      .catch(() => alert("Gig not found"));
  }, [id]);

  // Fetch bids ONLY if client & owner
  useEffect(() => {
    if (user?.role === "client" && gig?.ownerId === user.id) {
      api
        .get(`/bids/${id}`)
        .then(res => setBids(res.data))
        .catch(() => {});
    }
  }, [user, gig, id]);

  const placeBid = async () => {
    if (!price || !message) {
      alert("Please enter price and message");
      return;
    }

    try {
      await api.post("/bids", {
        gigId: id,
        price: Number(price),
        message
      });

      alert("Bid placed successfully");
      setPrice("");
      setMessage("");
    } catch (err) {
      alert(err.response?.data?.message || "Bid failed");
    }
  };

  const hire = async (bidId) => {
    try {
      await api.patch(`/bids/${bidId}/hire`);
      alert("Freelancer hired successfully");

      // Update UI instantly
      setGig(prev => ({
        ...prev,
        status: "assigned"
      }));
    } catch (err) {
      alert("Hiring failed");
    }
  };

  if (!gig) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse text-gray-400 text-xl">Loading gig details...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pt-8 lg:pt-12">

        {/* Gig Header */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                {gig.title}
              </h1>
              <div className="flex items-center gap-4 text-sm">
                <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 font-medium">
                  Budget: ₹{Number(gig.budget).toLocaleString()}
                </span>
                <span className={`px-3 py-1 rounded-full font-medium ${
                  gig.status === "open"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-amber-100 text-amber-700"
                }`}>
                  {gig.status === "open" ? "Open for Bids" : "Assigned"}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
            <p className="text-gray-700 whitespace-pre-line leading-relaxed">
              {gig.description}
            </p>
          </div>
        </div>

        {/* Freelancer: Place Bid Section */}
        {user?.role === "freelancer" && gig.status === "open" && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sm:p-8 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Submit Your Bid</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Proposed Price (₹)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-gray-500">₹</span>
                  </div>
                  <input
                    type="number"
                    min="1"
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    placeholder="e.g. 18000"
                    className="block w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Why should the client hire you?
                </label>
                <textarea
                  rows={5}
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Highlight your relevant experience, approach to this project, estimated timeline, etc..."
                  className="block w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-colors resize-none"
                />
              </div>

              <button
                onClick={placeBid}
                className="w-full sm:w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Place Bid
              </button>
            </div>
          </div>
        )}

        {/* Freelancer: Hired Confirmation */}
        {user?.role === "freelancer" &&
          gig.status === "assigned" &&
          gig.hiredFreelancerId === user.id && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center mb-8">
              <div className="text-2xl mb-2">🎉</div>
              <h3 className="text-xl font-semibold text-emerald-800 mb-2">
                Congratulations!
              </h3>
              <p className="text-emerald-700">
                You have been hired for this gig.
              </p>
            </div>
          )}

        {/* Client (Owner): Bids Section */}
        {user?.role === "client" && gig.ownerId === user.id && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sm:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Received Bids</h2>

            {bids.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg">No bids received yet</p>
                <p className="mt-2">Share your gig link with talented freelancers</p>
              </div>
            ) : (
              <div className="space-y-6">
                {bids.map(bid => (
                  <div
                    key={bid._id}
                    className="border border-gray-200 rounded-lg p-6 hover:border-indigo-200 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {bid.freelancerId?.name || "Freelancer"}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Proposed: ₹{Number(bid.price).toLocaleString()}
                        </p>
                      </div>

                      {gig.status === "open" && (
                        <button
                          onClick={() => hire(bid._id)}
                          className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 whitespace-nowrap"
                        >
                          Hire Freelancer
                        </button>
                      )}

                      {gig.status !== "open" && (
                        <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">
                          Gig Assigned
                        </span>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-sm text-gray-700 whitespace-pre-line">
                        {bid.message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GigDetails;