import { useState, useEffect } from "react";
import { Star, Send, Trash2, MessageSquare, User } from "lucide-react";
import useShop from "../hooks/useShop";

const STORAGE_KEY = "techzone_reviews";

export default function Reviews() {
  const { t } = useShop();
  const [reviews, setReviews] = useState([]);
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Загружаем отзывы из localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setReviews(JSON.parse(saved));
    } catch {
      // ignore
    }
  }, []);

  // Сохраняем в localStorage при изменении
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
  }, [reviews]);

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name.trim()) return setError(t.revErrName);
    if (!comment.trim()) return setError(t.revErrComment);

    const newReview = {
      id: Date.now(),
      name: name.trim(),
      rating,
      comment: comment.trim(),
      date: new Date().toISOString(),
    };

    setReviews((prev) => [newReview, ...prev]);
    setName("");
    setRating(5);
    setComment("");
    setSuccess(t.revSuccess);
    setTimeout(() => setSuccess(""), 3000);
  }

  function handleDelete(reviewId) {
    setReviews((prev) => prev.filter((r) => r.id !== reviewId));
  }

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : "—";

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  return (
    <section className="section reviews-section" id="reviews">
      <div className="section-heading">
        <div>
          <span className="eyebrow">{t.revEyebrow}</span>
          <h2>
            {t.revTitle1} <span>{t.revTitleAccent}</span>
          </h2>
          <p>{t.revDesc}</p>
        </div>

        <div className="reviews-stats">
          <Star size={18} fill="currentColor" />
          <strong>{avgRating}</strong>
          <span>· {reviews.length} {t.revCount}</span>
        </div>
      </div>

      {/* Форма отзыва */}
      <form className="review-form" onSubmit={handleSubmit}>
        <div className="review-form-top">
          <label className="review-name">
            <User size={16} />
            <input
              type="text"
              placeholder={t.revNamePlaceholder}
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={40}
            />
          </label>

          <div className="review-rating">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="star-btn"
                aria-label={`${star} ${t.revStars}`}
              >
                <Star
                  size={22}
                  fill={star <= (hoverRating || rating) ? "currentColor" : "none"}
                />
              </button>
            ))}
          </div>
        </div>

        <label className="review-comment">
          <MessageSquare size={16} />
          <textarea
            placeholder={t.revCommentPlaceholder}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            maxLength={500}
          />
        </label>

        {error && <p className="admin-error">{error}</p>}
        {success && <p className="admin-success">{success}</p>}

        <button type="submit" className="primary-button review-submit">
          <Send size={16} />
          {t.revSubmit}
        </button>
      </form>

      {/* Список отзывов */}
      <div className="reviews-list">
        {reviews.length === 0 ? (
          <div className="empty-state reviews-empty">
            <MessageSquare size={35} />
            <h3>{t.revEmptyTitle}</h3>
            <p>{t.revEmptyDesc}</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div className="review-card" key={review.id}>
              <div className="review-card-header">
                <div className="review-avatar">
                  {review.name.charAt(0).toUpperCase()}
                </div>
                <div className="review-meta">
                  <b>{review.name}</b>
                  <span>{formatDate(review.date)}</span>
                </div>
                <div className="review-stars">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={13}
                      fill={star <= review.rating ? "currentColor" : "none"}
                    />
                  ))}
                </div>
                <button
                  className="admin-delete-btn"
                  onClick={() => handleDelete(review.id)}
                  aria-label={t.revDelete}
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <p className="review-text">{review.comment}</p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
