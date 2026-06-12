import api from "./api";

const reviewService = {
  async submitReview({ subject_type, subject_id, order_ref_id, rating, comment }) {
    return api.request("/reviews", {
      method: "POST",
      body: JSON.stringify({ subject_type, subject_id, order_ref_id, rating, comment }),
    });
  },

  async getReviews(subjectType, subjectId, { page = 1, limit = 20 } = {}) {
    const p = new URLSearchParams({ page, limit });
    return api.request(`/reviews/${subjectType}/${subjectId}?${p}`);
  },

  async getMyReview(subjectType, subjectId) {
    return api.request(`/reviews/my/${subjectType}/${subjectId}`);
  },
};

export default reviewService;
