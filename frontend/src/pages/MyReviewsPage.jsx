import React, { useState } from "react";
import { getFeedbackByTutor } from "../services/feedbackService";

const MyReviewsPage = () => {
  const [tutorName, setTutorName] = useState("");
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleLoadMyReviews = async () => {
    const trimmedTutorName = tutorName.trim();

    if (!trimmedTutorName) {
      setError("Tutor Name is required");
      setReviews([]);
      setSearched(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSearched(true);

      const response = await getFeedbackByTutor(trimmedTutorName);
      setReviews(Array.isArray(response) ? response : (response?.data || []));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load your reviews");
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemoTutor = () => {
    setTutorName("John Doe");
    setError("");
  };

  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((sum, item) => sum + item.rating, 0) / reviews.length).toFixed(1)
      : "0.0";

  return (
    <div className="min-h-screen bg-gray-900 px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 rounded-2xl border border-gray-700 bg-gray-800 p-8 shadow-2xl">
          <h1 className="text-3xl font-bold text-gray-300">My Reviews</h1>
          <p className="mt-2 text-gray-400">
            Tutors can view anonymous feedback submitted by students.
          </p>

          <div className="mt-6 flex flex-col gap-3 md:flex-row">
            <input
              type="text"
              value={tutorName}
              onChange={(e) => setTutorName(e.target.value)}
              placeholder="Enter Your Tutor Name"
              className="flex-1 rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-gray-300 placeholder-gray-500 outline-none focus:border-teal-500"
            />
            <button
              type="button"
              onClick={handleLoadMyReviews}
              className="rounded-lg bg-gradient-to-r from-teal-500 to-indigo-600 px-5 py-3 font-medium text-white shadow-lg transition hover:scale-[1.02]"
            >
              View My Reviews
            </button>
            <button
              type="button"
              onClick={handleFillDemoTutor}
              className="rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 px-5 py-3 font-medium text-white shadow-lg transition hover:scale-[1.02]"
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
          {!searched ? (
            <div className="rounded-2xl border border-gray-700 bg-gray-800 p-8 text-center text-gray-400 shadow-xl">
              Enter your Tutor Name and click View My Reviews.
            </div>
          ) : loading ? (
            <div className="rounded-2xl border border-teal-500/20 bg-teal-500/10 p-8 text-center text-gray-300 shadow-xl">
              Loading reviews...
            </div>
          ) : reviews.length === 0 ? (
            <div className="rounded-2xl border border-gray-700 bg-gray-800 p-8 text-center text-gray-400 shadow-xl">
              No reviews found for this Tutor Name.
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
                    <span className="text-gray-300">Reviewer:</span> Anonymous Student
                  </p>
                  <p>
                    <span className="text-gray-300">Comment:</span> {review.comment}
                  </p>
                  {review.createdAt && (
                    <p>
                      <span className="text-gray-300">Submitted:</span>{" "}
                      {new Date(review.createdAt).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MyReviewsPage;