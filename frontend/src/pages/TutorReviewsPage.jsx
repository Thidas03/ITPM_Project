import React, { useState } from "react";
import { getFeedbackByTutor } from "../services/feedbackService";

const TutorReviewsPage = () => {
  const [tutorId, setTutorId] = useState("");
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const handleFillDemoTutor = () => {
    setTutorId("TUT-450");
    setError("");
  };

  const handleSearch = async () => {
    const trimmedTutorId = tutorId.trim();

    if (!trimmedTutorId) {
      setError("Tutor ID is required");
      setReviews([]);
      setHasSearched(false);
      return;
    }

    try {
      setError("");
      setHasSearched(true);

      const response = await getFeedbackByTutor(trimmedTutorId);
      setReviews(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch tutor reviews");
      setReviews([]);
      setHasSearched(true);
    }
  };

  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((sum, item) => sum + item.rating, 0) / reviews.length).toFixed(1)
      : 0;

  return (
    <div className="min-h-screen bg-gray-900 px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 rounded-2xl border border-gray-700 bg-gray-800 p-8 shadow-2xl">
          <h1 className="text-3xl font-bold text-gray-300">Tutor Reviews</h1>
          <p className="mt-2 text-gray-400">
            Search reviews for a tutor using the tutor ID.
          </p>

          <div className="mt-6 flex flex-col gap-3 md:flex-row">
            <input
              type="text"
              value={tutorId}
              onChange={(e) => setTutorId(e.target.value)}
              placeholder="Enter Tutor ID"
              className="flex-1 rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-gray-300 placeholder-gray-500 outline-none focus:border-teal-500"
            />
            <button
              onClick={handleSearch}
              className="rounded-lg bg-gradient-to-r from-teal-500 to-indigo-600 px-5 py-3 font-medium text-white shadow-lg transition hover:scale-[1.02]"
            >
              Search
            </button>
            <button
              onClick={handleFillDemoTutor}
              className="rounded-lg border border-teal-500/30 bg-teal-500/10 px-5 py-3 font-medium text-gray-300 transition hover:bg-teal-500/20"
            >
              Fill Demo Tutor
            </button>
          </div>

          {error && (
            <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}
        </div>

        {reviews.length > 0 && (
          <div className="mb-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-teal-500/20 bg-teal-500/10 p-6 shadow-lg">
              <p className="text-sm text-gray-400">Total Reviews</p>
              <h3 className="mt-2 text-3xl font-bold text-gray-300">{reviews.length}</h3>
            </div>
            <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/10 p-6 shadow-lg">
              <p className="text-sm text-gray-400">Average Rating</p>
              <h3 className="mt-2 text-3xl font-bold text-gray-300">⭐ {averageRating} / 5</h3>
            </div>
          </div>
        )}

        <div className="grid gap-5">
          {!hasSearched ? (
            <div className="rounded-2xl border border-gray-700 bg-gray-800 p-8 text-center text-gray-400 shadow-xl">
              Enter a Tutor ID and click Search to view reviews.
            </div>
          ) : reviews.length === 0 ? (
            <div className="rounded-2xl border border-gray-700 bg-gray-800 p-8 text-center text-gray-400 shadow-xl">
              No reviews found for this Tutor ID.
            </div>
          ) : (
            reviews.map((review) => (
              <div
                key={review._id}
                className="rounded-2xl border border-gray-700 bg-gray-800 p-6 shadow-xl"
              >
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-300">{review.category}</h3>
                  <span className="rounded-full border border-teal-500/20 bg-teal-500/10 px-3 py-1 text-sm font-semibold text-gray-300">
                    ⭐ {review.rating}
                  </span>
                </div>

                <div className="space-y-2 text-gray-400">
                  <p>
                    <span className="text-gray-300">Session ID:</span> {review.sessionId}
                  </p>
                  <p>
                    <span className="text-gray-300">Student ID:</span> {review.studentId}
                  </p>
                  <p>
                    <span className="text-gray-300">Comment:</span> {review.comment}
                  </p>
                  <p>
                    <span className="text-gray-300">Status:</span> {review.status}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TutorReviewsPage;