import { useState } from 'react';

function TreeNode({ node }) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = Array.isArray(node.children) && node.children.length > 0;
  const attributeEntries = Object.entries(node.attributes || {});

  return (
    <div className="flow-node">
      <div className={`flow-card ${hasChildren ? 'has-children' : ''}`}>
        <button
          type="button"
          className="flow-toggle"
          onClick={() => setExpanded((value) => !value)}
          disabled={!hasChildren}
          aria-label={expanded ? 'Collapse node' : 'Expand node'}
        >
          {hasChildren ? (expanded ? '▾' : '▸') : '•'}
        </button>
        <div className="flow-card-content">
          <div className="flow-tag">{node.tag}</div>
          {attributeEntries.length > 0 && (
            <div className="flow-attrs">
              {attributeEntries
                .slice(0, 3)
                .map(([key, value]) => `${key}="${value}"`)
                .join(' ')}
            </div>
          )}
          {node.content ? <div className="flow-content">{node.content}</div> : null}
        </div>
      </div>
      {hasChildren && expanded && (
        <div className="flow-branch">
          {node.children.map((child, index) => (
            <TreeNode key={`${child.tag}-${index}`} node={child} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [html, setHtml] = useState(`<div class="container">
  <h1 id="title">Hello DOM</h1>
  <p>Sample content</p>
</div>`);
  const [tree, setTree] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleGenerate() {
    setLoading(true);
    setError('');
    setTree(null);

    try {
      const response = await fetch('/api/parse-dom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to parse HTML');
      }

      setTree(data);
    } catch (err) {
      setError(err.message || 'Unexpected error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app-shell">
      <header>
        <h1>HTML to DOM Tree</h1>
        <p>Paste HTML and visualize it as a nested DOM tree.</p>
      </header>

      <section className="panel input-panel">
        <label htmlFor="html-input">HTML input</label>
        <textarea
          id="html-input"
          value={html}
          onChange={(event) => setHtml(event.target.value)}
          placeholder="Paste your HTML here..."
          rows={16}
        />
        <button type="button" onClick={handleGenerate} disabled={loading}>
          {loading ? 'Generating...' : 'Generate DOM Tree'}
        </button>
      </section>

      <section className="panel output-panel">
        {error ? <div className="message error">{error}</div> : null}
        {!error && !tree && !loading ? (
          <div className="message">Your DOM tree will appear here.</div>
        ) : null}
        {loading ? <div className="message">Parsing HTML...</div> : null}
        {tree ? <TreeNode node={tree} /> : null}
      </section>
    </div>
  );
}
