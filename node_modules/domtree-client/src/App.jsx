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

          {node.content ? (
            <div className="flow-content">{node.content}</div>
          ) : null}
        </div>
      </div>

      {hasChildren && expanded && (
        <div className="flow-branch">
          {node.children.map((child, index) => (
            <div
              key={`${child.tag}-${index}`}
              className="flow-branch-item"
            >
              <TreeNode node={child} hasParent />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function getNodeName(node) {
  return node.tag || 'node';
}

function preorder(node, result = []) {
  result.push(getNodeName(node));

  if (Array.isArray(node.children)) {
    node.children.forEach((child) => {
      preorder(child, result);
    });
  }

  return result;
}

function postorder(node, result = []) {
  if (Array.isArray(node.children)) {
    node.children.forEach((child) => {
      postorder(child, result);
    });
  }

  result.push(getNodeName(node));

  return result;
}

function inorder(node, result = []) {
  const children = Array.isArray(node.children) ? node.children : [];

  if (children.length === 0) {
    result.push(getNodeName(node));
    return result;
  }

  const middle = Math.ceil(children.length / 2);

  children.slice(0, middle).forEach((child) => {
    inorder(child, result);
  });

  result.push(getNodeName(node));

  children.slice(middle).forEach((child) => {
    inorder(child, result);
  });

  return result;
}

function calculateTreeStats(node, depth = 1) {
  const children = Array.isArray(node.children) ? node.children : [];

  let totalNodes = 1;
  let childNodes = children.length;
  let leafNodes = children.length === 0 ? 1 : 0;
  let height = depth;

  children.forEach((child) => {
    const stats = calculateTreeStats(child, depth + 1);

    totalNodes += stats.totalNodes;
    childNodes += stats.childNodes;
    leafNodes += stats.leafNodes;
    height = Math.max(height, stats.height);
  });

  return {
    totalNodes,
    childNodes,
    leafNodes,
    height
  };
}

function getTraversalData(tree, type) {
  let sequence = [];

  if (type === 'inorder') {
    sequence = inorder(tree);
  }

  if (type === 'preorder') {
    sequence = preorder(tree);
  }

  if (type === 'postorder') {
    sequence = postorder(tree);
  }

  const descriptions = {
    inorder:
      'Inorder traversal visits the child nodes before and after the current node. Since a DOM tree can have multiple children, this implementation uses a generalized inorder approach by visiting the first half of the children, then the current node, followed by the remaining children.',

    preorder:
      'Preorder traversal visits the current node first and then recursively visits all of its child nodes from left to right.',

    postorder:
      'Postorder traversal visits all child nodes first and then visits the current node. This is useful when processing a hierarchy from the deepest elements toward the root.'
  };

  return {
    title: type.charAt(0).toUpperCase() + type.slice(1),
    description: descriptions[type],
    sequence
  };
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
  const [selectedTraversal, setSelectedTraversal] = useState(null);

  async function handleGenerate() {
    setLoading(true);
    setError('');
    setTree(null);
    setSelectedTraversal(null);

    try {
      const response = await fetch('/api/parse-dom', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
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

  const increaseZoom = () => {
    setZoom((value) => Math.min(2, value + 0.1));
  };

  const decreaseZoom = () => {
    setZoom((value) => Math.max(0.5, value - 0.1));
  };

  const resetZoom = () => {
    setZoom(1);
  };

  const stats = tree ? calculateTreeStats(tree) : null;

  const handleTraversal = (type) => {
    if (!tree) return;

    const data = getTraversalData(tree, type);

    setSelectedTraversal(data);
  };

  return (
    <div className={`app-shell ${darkMode ? 'theme-dark' : 'theme-light'}`}>
      <header className="topbar">
        <div>
          <h1>HTML TO DOM TREE</h1>
          <p>by TEJAS</p>
        </div>

        <div className="topbar-actions">
          <button
            type="button"
            className="ghost-button"
            onClick={() => setDarkMode((value) => !value)}
          >
            {darkMode ? '☀️ Normal Mode' : '🌙 Dark Mode'}
          </button>

          <button
            type="button"
            className="ghost-button"
            onClick={() => setShowInfo((value) => !value)}
          >
            ℹ️ Info
          </button>
        </div>
      </header>

      {showInfo && (
        <section className="panel info-panel">
          <h3>About this website</h3>

          <p>
            Paste raw HTML, send it to the backend parser, and view the
            resulting DOM tree as a top down flowchart.
          </p>

          <p>
            You can also analyze the generated tree using preorder,
            inorder and postorder traversal techniques.
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

        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading}
        >
          {loading ? 'Generating...' : 'Generate DOM Tree'}
        </button>
      </section>

      <section className="panel output-panel">
        {error ? (
          <div className="message error">{error}</div>
        ) : null}

        {!error && !tree && !loading ? (
          <div className="message">
            Your DOM tree will appear here.
          </div>
        ) : null}

        {loading ? (
          <div className="message">
            Parsing HTML...
          </div>
        ) : null}

        {tree ? (
          <>
            <div className="zoom-controls">
              <button
                type="button"
                className="ghost-button"
                onClick={decreaseZoom}
              >
                ➖ Zoom Out
              </button>

              <button
                type="button"
                className="ghost-button"
                onClick={resetZoom}
              >
                🔄 Reset
              </button>

              <button
                type="button"
                className="ghost-button"
                onClick={increaseZoom}
              >
                ➕ Zoom In
              </button>

              <span className="zoom-label">
                {Math.round(zoom * 100)}%
              </span>
            </div>

            <div className="tree-scroll">
              <div
                className="tree-wrapper"
                style={{ transform: `scale(${zoom})` }}
              >
                <div className="tree-root">
                  <TreeNode node={tree} />
                </div>
              </div>
            </div>

            <div className="tree-analysis">
              <div className="analysis-header">
                <div>
                  <span className="analysis-eyebrow">
                    TREE ANALYSIS
                  </span>

                  <h2>Traversal & Structure</h2>

                  <p>
                    Select a traversal method to analyze the generated DOM
                    tree.
                  </p>
                </div>
              </div>

              <div className="traversal-buttons">
                <button
                  type="button"
                  className={
                    selectedTraversal?.title === 'Inorder'
                      ? 'traversal-button active'
                      : 'traversal-button'
                  }
                  onClick={() => handleTraversal('inorder')}
                >
                  <span>↙</span>
                  Inorder
                </button>

                <button
                  type="button"
                  className={
                    selectedTraversal?.title === 'Preorder'
                      ? 'traversal-button active'
                      : 'traversal-button'
                  }
                  onClick={() => handleTraversal('preorder')}
                >
                  <span>↗</span>
                  Preorder
                </button>

                <button
                  type="button"
                  className={
                    selectedTraversal?.title === 'Postorder'
                      ? 'traversal-button active'
                      : 'traversal-button'
                  }
                  onClick={() => handleTraversal('postorder')}
                >
                  <span>↘</span>
                  Postorder
                </button>
              </div>

              {selectedTraversal && (
                <div className="traversal-result">
                  <div className="traversal-main">
                    <div className="traversal-title-row">
                      <h3>
                        {selectedTraversal.title} Traversal
                      </h3>

                      <span className="complexity-badge">
                        O(n)
                      </span>
                    </div>

                    <p className="traversal-description">
                      {selectedTraversal.description}
                    </p>

                    <div className="sequence-section">
                      <h4>Traversal Sequence</h4>

                      <div className="sequence-box">
                        {selectedTraversal.sequence.map(
                          (tag, index) => (
                            <span
                              className="sequence-node"
                              key={`${tag}-${index}`}
                            >
                              {tag}
                              {index <
                              selectedTraversal.sequence.length - 1
                                ? ' → '
                                : ''}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="complexity-grid">
                    <div className="stat-card">
                      <span>Time Complexity</span>
                      <strong>O(n)</strong>
                    </div>

                    <div className="stat-card">
                      <span>Best Case</span>
                      <strong>O(n)</strong>
                    </div>

                    <div className="stat-card">
                      <span>Worst Case</span>
                      <strong>O(n)</strong>
                    </div>

                    <div className="stat-card">
                      <span>Space Complexity</span>
                      <strong>O(h)</strong>
                    </div>
                  </div>
                </div>
              )}

              <div className="tree-stats">
                <div className="stat-heading">
                  <span className="analysis-eyebrow">
                    STRUCTURE
                  </span>

                  <h3>Tree Statistics</h3>
                </div>

                <div className="stats-grid">
                  <div className="stat-card">
                    <span>Root Nodes</span>
                    <strong>1</strong>
                  </div>

                  <div className="stat-card">
                    <span>Total Nodes</span>
                    <strong>{stats.totalNodes}</strong>
                  </div>

                  <div className="stat-card">
                    <span>Child Nodes</span>
                    <strong>{stats.childNodes}</strong>
                  </div>

                  <div className="stat-card">
                    <span>Leaf Nodes</span>
                    <strong>{stats.leafNodes}</strong>
                  </div>

                  <div className="stat-card">
                    <span>Tree Height</span>
                    <strong>{stats.height}</strong>
                  </div>

                  <div className="stat-card">
                    <span>Root Element</span>
                    <strong>{getNodeName(tree)}</strong>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </section>
    </div>
  );
}