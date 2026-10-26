import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <main className="section empty-state">
      <h1>Страница не найдена</h1>
      <Link className="primary-button" to="/">На главную</Link>
    </main>
  );
}
