import { useState, useEffect } from "react";
import { Star, Send, Trash2, MessageSquare, User } from "lucide-react";
import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import useShop from "../hooks/useShop";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import { sendTelegramReview } from "../utils/telegram";

export default function Reviews() {
  const { authLoading, isAdmin, user } = useAuth();
  const { lang, t } = useShop();
  const [reviews, setReviews] = useState([]);
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Отзывы хранятся в Firestore (коллекция "reviews") и видны всем посетителям
  useEffect(() => {
    if (!db) return undefined;
    return onSnapshot(
      query(collection(db, "reviews"), orderBy("createdAt", "desc"), limit(100)),
      (snapshot) => setReviews(snapshot.docs.map((item) => ({ ...item.data(), id: item.id }))),
      (snapshotError) => console.error("Failed to load reviews", snapshotError),
    );
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!user || authLoading || submitting || !db) return;
    setError("");
    setSuccess("");

    const trimmedName = name.trim();
    const trimmedComment = comment.trim();
    if (!trimmedName) return setError(t.revErrName);
    if (!trimmedComment) return setError(t.revErrComment);

    setSubmitting(true);
    try {
      await addDoc(collection(db, "reviews"), {
        userId: user.uid,
        name: trimmedName.slice(0, 40),
        rating,
        comment: trimmedComment.slice(0, 500),
        createdAt: serverTimestamp(),
      });
      sendTelegramReview({ name: trimmedName, email: user.email, rating, comment: trimmedComment });
      setName("");
      setRating(5);
      setComment("");
      setSuccess(t.revSuccess);
      setTimeout(() => setSuccess(""), 3000);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(reviewId) {
    if (!db) return;
    try {
      await deleteDoc(doc(db, "reviews", reviewId));
    } catch (deleteError) {
      setError(deleteError.message);
    }
  }

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : "—";

  function formatDate(timestamp) {
    const date = timestamp?.toDate ? timestamp.toDate() : new Date();
    return date.toLocaleDateString({ ru: "ru-RU", ky: "ky-KG", en: "en-US" }[lang] || "ru-RU", {
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
      {authLoading ? (
        <div className="review-form">
          <p>{t.revAuthChecking}</p>
        </div>
      ) : !user ? (
        <div className="review-form">
          <p>{t.revSignInRequired}</p>
          <Link to="/auth" className="primary-button review-submit">
            {t.revSignIn}
          </Link>
        </div>
      ) : (
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

        <button type="submit" className="primary-button review-submit" disabled={submitting}>
          <Send size={16} />
          {t.revSubmit}
        </button>
      </form>
      )}

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
                  <span>{formatDate(review.createdAt)}</span>
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
                {(isAdmin || review.userId === user?.uid) && (
                  <button
                    type="button"
                    className="admin-delete-btn"
                    onClick={() => handleDelete(review.id)}
                    aria-label={t.revDelete}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              <p className="review-text">{review.comment}</p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
