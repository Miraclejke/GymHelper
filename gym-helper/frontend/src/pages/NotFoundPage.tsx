import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

export default function NotFoundPage() {
  return (
    <div className="page center">
      <div className="notfound">
        <h1>Страница не найдена</h1>
        <p className="muted">Похоже, этой страницы нет. Перейдите на главную.</p>
        <Link to="/">
          <Button variant="primary">На дашборд</Button>
        </Link>
      </div>
    </div>
  );
}
