// import { useEffect, useState, useContext } from "react";
// import api from "../api/axios";
// import { Link } from "react-router-dom";
// import { AuthContext } from "../context/AuthContext";

// const Home = () => {
//   const { user } = useContext(AuthContext);
//   const [gigs, setGigs] = useState([]);

//   useEffect(() => {
//     api.get("/gigs").then(res => setGigs(res.data));
//   }, []);

//   // CLIENT → MY GIGS
//   const myGigs =
//     user?.role === "client"
//       ? gigs.filter(gig => gig.ownerId === user.id)
//       : [];

//   // FREELANCER → MY JOBS
//   const myJobs =
//     user?.role === "freelancer"
//       ? gigs.filter(
//           gig => gig.status === "assigned" && gig.hiredFreelancerId === user.id
//         )
//       : [];

//   // PUBLIC / FREELANCER → AVAILABLE GIGS
//   const availableGigs = gigs.filter(gig => gig.status === "open");

//   return (
//     <div style={{ padding: 20 }}>
//       {/* CLIENT VIEW */}
//       {user?.role === "client" && (
//         <>
//           <h2>My Gigs</h2>

//           {myGigs.length === 0 && <p>No gigs created yet</p>}

//           {myGigs.map(gig => (
//             <div key={gig._id} style={{ border: "1px solid #ccc", padding: 10, marginTop: 10 }}>
//               <h3>{gig.title}</h3>
//               <p>Budget: ₹{gig.budget}</p>
//               <p>Status: <strong>{gig.status}</strong></p>
//               <Link to={`/gig/${gig._id}`}>View Details</Link>
//             </div>
//           ))}
//         </>
//       )}

//       {/* FREELANCER VIEW */}
//       {user?.role === "freelancer" && (
//         <>
//           <h2>My Jobs</h2>

//           {myJobs.length === 0 && <p>No jobs assigned yet</p>}

//           {myJobs.map(gig => (
//             <div key={gig._id} style={{ border: "1px solid #ccc", padding: 10, marginTop: 10 }}>
//               <h3>{gig.title}</h3>
//               <p>Status: <strong>Hired</strong></p>
//               <Link to={`/gig/${gig._id}`}>View Details</Link>
//             </div>
//           ))}
//         </>
//       )}

//       {/* AVAILABLE GIGS */}
//       <h2 style={{ marginTop: 30 }}>Available Gigs</h2>

//       {availableGigs.length === 0 && <p>No open gigs</p>}

//       {availableGigs.map(gig => (
//         <div key={gig._id} style={{ border: "1px solid #ccc", padding: 10, marginTop: 10 }}>
//           <h3>{gig.title}</h3>
//           <p>Budget: ₹{gig.budget}</p>
//           <Link to={`/gig/${gig._id}`}>View Details</Link>
//         </div>
//       ))}
//     </div>
//   );
// };

// export default Home;





import { useEffect, useState, useContext } from "react";
import api from "../api/axios";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Home = () => {
  const { user } = useContext(AuthContext);
  const [gigs, setGigs] = useState([]);

  useEffect(() => {
    api.get("/gigs").then(res => setGigs(res.data));
  }, []);

  // CLIENT → MY GIGS
  const myGigs =
    user?.role === "client"
      ? gigs.filter(gig => gig.ownerId === user.id)
      : [];

  // FREELANCER → MY JOBS
  const myJobs =
    user?.role === "freelancer"
      ? gigs.filter(
          gig => gig.status === "assigned" && gig.hiredFreelancerId === user.id
        )
      : [];

  // PUBLIC / FREELANCER → AVAILABLE GIGS
  const availableGigs = gigs.filter(gig => gig.status === "open");

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 lg:pt-12">

        {/* CLIENT VIEW – My Gigs */}
        {user?.role === "client" && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">My Gigs</h2>
              <Link
                to="/create"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
              >
                + Create New Gig
              </Link>
            </div>

            {myGigs.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                <p className="text-gray-500 mb-4">You haven't created any gigs yet</p>
                <Link
                  to="/create"
                  className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-indigo-600 border border-indigo-200 hover:bg-indigo-50 rounded-lg transition-colors"
                >
                  Create your first gig →
                </Link>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {myGigs.map(gig => (
                  <GigCard key={gig._id} gig={gig} isMyGig={true} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* FREELANCER VIEW – My Jobs */}
        {user?.role === "freelancer" && myJobs.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">My Active Jobs</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {myJobs.map(gig => (
                <GigCard key={gig._id} gig={gig} isMyJob={true} />
              ))}
            </div>
          </section>
        )}

        {/* AVAILABLE GIGS – shown to everyone */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {user?.role === "client" ? "Other Open Gigs" : "Available Gigs"}
          </h2>

          {availableGigs.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
              <p className="text-gray-500 text-lg">No open gigs at the moment</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {availableGigs.map(gig => (
                <GigCard key={gig._id} gig={gig} />
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
};

// Reusable Gig Card Component
function GigCard({ gig, isMyGig = false, isMyJob = false }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {gig.title}
        </h3>

        <div className="flex items-center gap-6 mb-4 text-sm">
          <div>
            <span className="text-gray-500">Budget</span>
            <p className="font-medium text-gray-900">₹{gig.budget?.toLocaleString() || "—"}</p>
          </div>

          <div>
            <span className="text-gray-500">Status</span>
            <p className="font-medium">
              {isMyGig || isMyJob ? (
                <span className="text-green-700">{gig.status === "assigned" ? "Hired" : gig.status}</span>
              ) : (
                <span className="text-emerald-700">Open</span>
              )}
            </p>
          </div>
        </div>

        <Link
          to={`/gig/${gig._id}`}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-indigo-600 border border-indigo-200 hover:bg-indigo-50 rounded-lg transition-colors"
        >
          View Details →
        </Link>
      </div>
    </div>
  );
}

export default Home;