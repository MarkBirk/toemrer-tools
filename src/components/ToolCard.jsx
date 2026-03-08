import { Link } from 'react-router-dom';

const toolIcons = {
  materialeberegner: '📐',
  taghaeldning: '📏',
  'spaer-laengde': '📐',
  'skruer-beslag': '🔩',
  'maal-konverter': '↔️',
  tilbudsberegner: '💰',
  materialeliste: '📋',
  standardmaal: '📖',
  'bygge-noter': '📝',
  'vaegt-beregner': '⚖️',
  skaereplan: '✂️',
  'bygge-regler': '📜',
};

export default function ToolCard({ path, title, description }) {
  return (
    <Link to={`/${path}`} className="tool-card">
      <span className="tool-card-icon">{toolIcons[path] || '🔧'}</span>
      <div className="tool-card-text">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </Link>
  );
}
