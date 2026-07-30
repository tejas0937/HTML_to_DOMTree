import { useState } from 'react';

function TreeNode({ node, hasParent = false }) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = Array.isArray(node.children) && node.children.length > 0;
  const attributeEntries = Object.entries(node.attributes || {});

  return (
    <div className={`flow-node ${hasParent ? 'has-parent' : ''}`}>
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
            <div key={`${child.tag}-${index}`} className="flow-branch-item">
              <TreeNode node={child} hasParent />
            </div>
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
  const [darkMode, setDarkMode] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const [zoom, setZoom] = useState(1);

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

  const increaseZoom = () => setZoom((value) => Math.min(2, value + 0.1));
  const decreaseZoom = () => setZoom((value) => Math.max(0.5, value - 0.1));
  const resetZoom = () => setZoom(1);

  return (
    <div className={`app-shell ${darkMode ? 'theme-dark' : 'theme-light'}`}>
      <header className="topbar">
        <div>
          <h1>HTML TO DOM TREE</h1>
          <p>by TEJAS</p>
        </div>
        <div className="topbar-actions">
          <button type="button" className="ghost-button" onClick={() => setDarkMode((value) => !value)}>
            {darkMode ? '☀️ Normal Mode' : '🌙 Dark Mode'}
          </button>
          <button type="button" className="ghost-button" onClick={() => setShowInfo((value) => !value)}>
            ℹ️ Info
          </button>
        </div>
      </header>

      {showInfo && (
        <section className="panel info-panel">
          <h3>About this website</h3>
          <p>
            Paste raw HTML, send it to the backend parser, and view the resulting DOM tree as a top-down flowchart.
          </p>
        </section>
      )}

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
        {tree ? (
          <>
            <div className="zoom-controls">
              <button type="button" className="ghost-button" onClick={decreaseZoom}>
                ➖ Zoom Out
              </button>
              <button type="button" className="ghost-button" onClick={resetZoom}>
                🔄 Reset
              </button>
              <button type="button" className="ghost-button" onClick={increaseZoom}>
                ➕ Zoom In
              </button>
              <span className="zoom-label">{Math.round(zoom * 100)}%</span>
            </div>
            <div className="tree-scroll">
              <div className="tree-wrapper" style={{ transform: `scale(${zoom})` }}>
                <div className="tree-root">
                  <TreeNode node={tree} />
                </div>
              </div>
            </div>
          </>
        ) : null}
      </section>
    </div>
  );
}
