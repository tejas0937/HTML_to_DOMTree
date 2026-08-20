import { useState } from 'react';

/* =========================================================
   DOM TREE COMPONENT
   ========================================================= */

function TreeNode({ node, hasParent = false }) {
  const [expanded, setExpanded] = useState(true);

  const hasChildren =
    Array.isArray(node.children) && node.children.length > 0;

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

/* =========================================================
   BINARY TREE
   ========================================================= */

function createBalancedBinaryTree(count) {
  if (count <= 0) {
    return null;
  }

  let currentValue = 1;

  function build(size) {
    if (size <= 0) {
      return null;
    }

    const leftSize = Math.floor((size - 1) / 2);
    const rightSize = size - 1 - leftSize;

    const left = build(leftSize);

    const node = {
      value: currentValue++,
      left: left,
      right: null
    };

    node.right = build(rightSize);

    return node;
  }

  return build(count);
}

/* =========================================================
   BINARY TREE VISUALIZATION
   ========================================================= */

function BinaryTreeNode({ node }) {
  if (!node) {
    return null;
  }

  return (
    <div className="binary-node-wrapper">
      <div className="binary-node">
        {node.value}
      </div>

      {(node.left || node.right) && (
        <div className="binary-children">
          <div className="binary-child">
            {node.left ? (
              <BinaryTreeNode node={node.left} />
            ) : (
              <div className="empty-binary-node" />
            )}
          </div>

          <div className="binary-child">
            {node.right ? (
              <BinaryTreeNode node={node.right} />
            ) : (
              <div className="empty-binary-node" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   TRAVERSALS
   ========================================================= */

function inorderTraversal(root, result = []) {
  if (!root) {
    return result;
  }

  inorderTraversal(root.left, result);

  result.push(root.value);

  inorderTraversal(root.right, result);

  return result;
}

function preorderTraversal(root, result = []) {
  if (!root) {
    return result;
  }

  result.push(root.value);

  preorderTraversal(root.left, result);

  preorderTraversal(root.right, result);

  return result;
}

function postorderTraversal(root, result = []) {
  if (!root) {
    return result;
  }

  postorderTraversal(root.left, result);

  postorderTraversal(root.right, result);

  result.push(root.value);

  return result;
}

/* =========================================================
   TREE STATISTICS
   ========================================================= */

function countNodes(root) {
  if (!root) {
    return 0;
  }

  return (
    1 +
    countNodes(root.left) +
    countNodes(root.right)
  );
}

function getTreeHeight(root) {
  if (!root) {
    return 0;
  }

  return (
    1 +
    Math.max(
      getTreeHeight(root.left),
      getTreeHeight(root.right)
    )
  );
}

/* =========================================================
   TRAVERSAL EXECUTION
   ========================================================= */

function executeTraversal(root, type) {
  const result = [];

  const start = performance.now();

  if (type === 'inorder') {
    inorderTraversal(root, result);
  }

  if (type === 'preorder') {
    preorderTraversal(root, result);
  }

  if (type === 'postorder') {
    postorderTraversal(root, result);
  }

  const end = performance.now();

  return {
    result,
    executionTime: Math.max(end - start, 0.001)
  };
}

/* =========================================================
   BENCHMARK
   ========================================================= */

function benchmarkTraversal(root, type, totalNodes) {
  const repetitions = totalNodes < 1000 ? 1000 : 100;

  let finalResult = [];

  const start = performance.now();

  for (let i = 0; i < repetitions; i += 1) {
    if (type === 'inorder') {
      finalResult = inorderTraversal(root, []);
    }

    if (type === 'preorder') {
      finalResult = preorderTraversal(root, []);
    }

    if (type === 'postorder') {
      finalResult = postorderTraversal(root, []);
    }
  }

  const end = performance.now();

  const totalTime = Math.max(end - start, 0.001);

  const averageTime = totalTime / repetitions;

  const accuracy =
    finalResult.length === totalNodes ? 100 : 0;

  const throughput =
    totalNodes / (averageTime / 1000);

  return {
    averageTime,
    accuracy,
    throughput
  };
}

/* =========================================================
   TRAVERSAL INFORMATION
   ========================================================= */

const traversalInformation = {
  inorder: {
    title: 'Inorder Traversal',
    icon: '↙',
    description:
      'Inorder traversal visits the left subtree first, then the root node, and finally the right subtree. For a binary search tree, this traversal produces values in sorted order.',
    bestCase: 'O(n)',
    worstCase: 'O(n)',
    spaceComplexity: 'O(h)'
  },

  preorder: {
    title: 'Preorder Traversal',
    icon: '↗',
    description:
      'Preorder traversal visits the root node first, followed by the left subtree and then the right subtree. It is useful when the tree structure needs to be processed before its children.',
    bestCase: 'O(n)',
    worstCase: 'O(n)',
    spaceComplexity: 'O(h)'
  },

  postorder: {
    title: 'Postorder Traversal',
    icon: '↘',
    description:
      'Postorder traversal visits the left subtree first, followed by the right subtree, and finally the root node. It is useful when child nodes must be processed before their parent.',
    bestCase: 'O(n)',
    worstCase: 'O(n)',
    spaceComplexity: 'O(h)'
  }
};

/* =========================================================
   APP
   ========================================================= */

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

  /* Binary tree states */

  const [elementCount, setElementCount] = useState(15);

  const [binaryTree, setBinaryTree] = useState(null);

  const [selectedTraversal, setSelectedTraversal] = useState(null);

  const [traversalResults, setTraversalResults] = useState({});

  const [benchmarkResults, setBenchmarkResults] = useState({});

  const [binaryError, setBinaryError] = useState('');

  /* =========================================================
     DOM TREE GENERATION
     ========================================================= */

  async function handleGenerate() {
    setLoading(true);

    setError('');

    setTree(null);

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
        throw new Error(
          data.error || 'Failed to parse HTML'
        );
      }

      setTree(data);
    } catch (err) {
      setError(
        err.message || 'Unexpected error'
      );
    } finally {
      setLoading(false);
    }
  }

  /* =========================================================
     ZOOM
     ========================================================= */

  const increaseZoom = () => {
    setZoom((value) =>
      Math.min(2, value + 0.1)
    );
  };

  const decreaseZoom = () => {
    setZoom((value) =>
      Math.max(0.5, value - 0.1)
    );
  };

  const resetZoom = () => {
    setZoom(1);
  };

  /* =========================================================
     GENERATE BINARY TREE
     ========================================================= */

  function handleGenerateBinaryTree() {
    const count = Number(elementCount);

    if (!Number.isInteger(count) || count < 1) {
      setBinaryError(
        'Please enter a valid number greater than 0.'
      );

      return;
    }

    if (count > 10000) {
      setBinaryError(
        'Please enter a value between 1 and 10000.'
      );

      return;
    }

    setBinaryError('');

    const generatedTree =
      createBalancedBinaryTree(count);

    setBinaryTree(generatedTree);

    setSelectedTraversal(null);

    setTraversalResults({});

    setBenchmarkResults({});
  }

  /* =========================================================
     RUN TRAVERSAL
     ========================================================= */

  function handleTraversal(type) {
    if (!binaryTree) {
      return;
    }

    const totalNodes =
      countNodes(binaryTree);

    const execution =
      executeTraversal(
        binaryTree,
        type
      );

    const benchmark =
      benchmarkTraversal(
        binaryTree,
        type,
        totalNodes
      );

    setSelectedTraversal(type);

    setTraversalResults((previous) => ({
      ...previous,
      [type]: execution
    }));

    setBenchmarkResults((previous) => ({
      ...previous,
      [type]: benchmark
    }));
  }

  /* =========================================================
     BEST TRAVERSAL
     ========================================================= */

  const availableBenchmarks =
    Object.entries(benchmarkResults);

  let bestTraversal = null;

  if (availableBenchmarks.length > 0) {
    bestTraversal =
      availableBenchmarks.reduce(
        (best, current) => {
          if (!best) {
            return current;
          }

          return current[1].averageTime <
            best[1].averageTime
            ? current
            : best;
        },
        null
      );
  }

  const totalBinaryNodes =
    binaryTree
      ? countNodes(binaryTree)
      : 0;

  const binaryTreeHeight =
    binaryTree
      ? getTreeHeight(binaryTree)
      : 0;

  const selectedExecution =
    selectedTraversal
      ? traversalResults[selectedTraversal]
      : null;

  const selectedBenchmark =
    selectedTraversal
      ? benchmarkResults[selectedTraversal]
      : null;

  const selectedInfo =
    selectedTraversal
      ? traversalInformation[selectedTraversal]
      : null;

  /* =========================================================
     UI
     ========================================================= */

  return (
    <div
      className={`app-shell ${
        darkMode
          ? 'theme-dark'
          : 'theme-light'
      }`}
    >

      {/* =====================================================
          HEADER
          ===================================================== */}

      <header className="topbar">

        <div>
          <h1>HTML TO DOM TREE</h1>

          <p>by TEJAS</p>
        </div>

        <div className="topbar-actions">

          <button
            type="button"
            className="ghost-button"
            onClick={() =>
              setDarkMode(
                (value) => !value
              )
            }
          >
            {darkMode
              ? '☀️ Normal Mode'
              : '🌙 Dark Mode'}
          </button>

          <button
            type="button"
            className="ghost-button"
            onClick={() =>
              setShowInfo(
                (value) => !value
              )
            }
          >
            ℹ️ Info
          </button>

        </div>

      </header>

      {/* =====================================================
          INFO
          ===================================================== */}

      {showInfo && (
        <section className="panel info-panel">

          <h3>About this website</h3>

          <p>
            Paste raw HTML and generate its
            DOM tree using the backend parser.
          </p>

          <p>
            The Binary Tree Generator is a
            separate module for studying and
            benchmarking binary tree traversal
            algorithms.
          </p>

        </section>
      )}

      {/* =====================================================
          HTML INPUT
          ===================================================== */}

      <section className="panel input-panel">

        <label htmlFor="html-input">
          HTML input
        </label>

        <textarea
          id="html-input"
          value={html}
          onChange={(event) =>
            setHtml(event.target.value)
          }
          placeholder="Paste your HTML here..."
          rows={16}
        />

        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading}
        >
          {loading
            ? 'Generating...'
            : 'Generate DOM Tree'}
        </button>

      </section>

      {/* =====================================================
          DOM TREE OUTPUT
          ===================================================== */}

      <section className="panel output-panel">

        {error ? (
          <div className="message error">
            {error}
          </div>
        ) : null}

        {!error &&
        !tree &&
        !loading ? (
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

            <div className="dom-tree-heading">
              <span className="analysis-eyebrow">
                HTML STRUCTURE
              </span>

              <h2>
                Generated DOM Tree
              </h2>

              <p>
                Interactive representation of
                your HTML document structure.
              </p>
            </div>

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
                {Math.round(
                  zoom * 100
                )}
                %
              </span>

            </div>

            <div className="tree-scroll">

              <div
                className="tree-wrapper"
                style={{
                  transform:
                    `scale(${zoom})`
                }}
              >

                <div className="tree-root">

                  <TreeNode
                    node={tree}
                  />

                </div>

              </div>

            </div>

          </>
        ) : null}

      </section>

      {/* =====================================================
          BINARY TREE GENERATOR
          ===================================================== */}

      <section className="panel binary-generator-panel">

        <div className="binary-header">

          <div>

            <span className="analysis-eyebrow">
              DATA STRUCTURES & ALGORITHMS
            </span>

            <h2>
              Balanced Binary Tree Generator
            </h2>

            <p>
              Generate a balanced binary tree
              and compare different traversal
              techniques.
            </p>

          </div>

        </div>

        {/* INPUT */}

        <div className="binary-input-section">

          <label htmlFor="element-count">
            Number of Elements
          </label>

          <div className="binary-input-row">

            <input
              id="element-count"
              type="number"
              min="1"
              max="10000"
              value={elementCount}
              onChange={(event) =>
                setElementCount(
                  event.target.value
                )
              }
            />

            <button
              type="button"
              onClick={
                handleGenerateBinaryTree
              }
            >
              🌳 Generate Binary Tree
            </button>

          </div>

          {binaryError ? (
            <div className="binary-error">
              {binaryError}
            </div>
          ) : null}

        </div>

        {/* BINARY TREE */}

        {binaryTree ? (
          <>

            <div className="binary-tree-summary">

              <div className="binary-summary-card">

                <span>Total Nodes</span>

                <strong>
                  {totalBinaryNodes}
                </strong>

              </div>

              <div className="binary-summary-card">

                <span>Tree Height</span>

                <strong>
                  {binaryTreeHeight}
                </strong>

              </div>

              <div className="binary-summary-card">

                <span>Tree Type</span>

                <strong>
                  Balanced
                </strong>

              </div>

            </div>

            <div className="binary-tree-scroll">

              <div className="binary-tree-canvas">

                <BinaryTreeNode
                  node={binaryTree}
                />

              </div>

            </div>

            {/* TRAVERSAL BUTTONS */}

            <div className="binary-traversal-section">

              <div className="analysis-eyebrow">
                TRAVERSAL ALGORITHMS
              </div>

              <h3>
                Select a Traversal Technique
              </h3>

              <div className="binary-traversal-buttons">

                {[
                  'inorder',
                  'preorder',
                  'postorder'
                ].map((type) => (

                  <button
                    key={type}
                    type="button"
                    className={
                      selectedTraversal === type
                        ? 'binary-traversal-button active'
                        : 'binary-traversal-button'
                    }
                    onClick={() =>
                      handleTraversal(type)
                    }
                  >

                    <span>
                      {
                        traversalInformation[
                          type
                        ].icon
                      }
                    </span>

                    {
                      traversalInformation[
                        type
                      ].title
                    }

                  </button>

                ))}

              </div>

            </div>

            {/* SELECTED TRAVERSAL */}

            {selectedTraversal &&
            selectedInfo &&
            selectedExecution &&
            selectedBenchmark ? (
              <div className="binary-analysis">

                <div className="selected-traversal-header">

                  <div>

                    <span className="analysis-eyebrow">
                      CURRENT ANALYSIS
                    </span>

                    <h3>
                      {selectedInfo.title}
                    </h3>

                  </div>

                  <span className="complexity-badge">
                    O(n)
                  </span>

                </div>

                <p className="binary-description">
                  {selectedInfo.description}
                </p>

                {/* SEQUENCE */}

                <div className="binary-sequence-section">

                  <h4>
                    Traversal Sequence
                  </h4>

                  <div className="binary-sequence-box">

                    {selectedExecution.result.map(
                      (value, index) => (
                        <span
                          className="binary-sequence-node"
                          key={`${value}-${index}`}
                        >
                          {value}

                          {index <
                          selectedExecution.result.length - 1
                            ? ' → '
                            : ''}
                        </span>
                      )
                    )}

                  </div>

                </div>

                {/* METRICS */}

                <div className="binary-metrics-grid">

                  <div className="binary-metric-card">

                    <span>
                      Best Case
                    </span>

                    <strong>
                      {selectedInfo.bestCase}
                    </strong>

                  </div>

                  <div className="binary-metric-card">

                    <span>
                      Worst Case
                    </span>

                    <strong>
                      {selectedInfo.worstCase}
                    </strong>

                  </div>

                  <div className="binary-metric-card">

                    <span>
                      Total Nodes
                    </span>

                    <strong>
                      {totalBinaryNodes}
                    </strong>

                  </div>

                  <div className="binary-metric-card">

                    <span>
                      Total Iterations
                    </span>

                    <strong>
                      {totalBinaryNodes}
                    </strong>

                  </div>

                  <div className="binary-metric-card">

                    <span>
                      Latency
                    </span>

                    <strong>
                      {selectedBenchmark.averageTime.toFixed(
                        4
                      )}{' '}
                      ms
                    </strong>

                  </div>

                  <div className="binary-metric-card">

                    <span>
                      Throughput
                    </span>

                    <strong>
                      {selectedBenchmark.throughput >=
                      1000000
                        ? `${(
                            selectedBenchmark.throughput /
                            1000000
                          ).toFixed(2)} M`
                        : selectedBenchmark.throughput >=
                          1000
                        ? `${(
                            selectedBenchmark.throughput /
                            1000
                          ).toFixed(2)} K`
                        : selectedBenchmark.throughput.toFixed(
                            2
                          )}{' '}
                      nodes/sec
                    </strong>

                  </div>

                  <div className="binary-metric-card">

                    <span>
                      Accuracy
                    </span>

                    <strong>
                      {selectedBenchmark.accuracy.toFixed(
                        0
                      )}
                      %
                    </strong>

                  </div>

                  <div className="binary-metric-card">

                    <span>
                      Execution Time
                    </span>

                    <strong>
                      {selectedExecution.executionTime.toFixed(
                        4
                      )}{' '}
                      ms
                    </strong>

                  </div>

                </div>

                {/* COMPLEXITY */}

                <div className="complexity-information">

                  <div>

                    <span>
                      Time Complexity
                    </span>

                    <strong>
                      O(n)
                    </strong>

                  </div>

                  <div>

                    <span>
                      Space Complexity
                    </span>

                    <strong>
                      {selectedInfo.spaceComplexity}
                    </strong>

                  </div>

                </div>

              </div>
            ) : null}

            {/* BEST TECHNIQUE */}

            {bestTraversal ? (

              <div className="best-traversal-card">

                <div className="best-traversal-icon">
                  🏆
                </div>

                <div className="best-traversal-content">

                  <span className="analysis-eyebrow">
                    PERFORMANCE COMPARISON
                  </span>

                  <h3>
                    Best Traversal Technique
                  </h3>

                  <strong className="best-traversal-name">
                    {
                      traversalInformation[
                        bestTraversal[0]
                      ].title
                    }
                  </strong>

                  <p>
                    Based on the measured benchmark
                    for the generated balanced binary
                    tree, this traversal achieved the
                    lowest average execution latency
                    among the traversal techniques that
                    have been tested.
                  </p>

                  <div className="best-traversal-time">

                    Average Execution Time:

                    <strong>
                      {' '}
                      {bestTraversal[1].averageTime.toFixed(
                        4
                      )}{' '}
                      ms
                    </strong>

                  </div>

                </div>

              </div>

            ) : (

              <div className="benchmark-hint">

                💡 Run all three traversal techniques
                to compare their measured performance
                and determine the best technique.

              </div>

            )}

          </>
        ) : (

          <div className="binary-empty-state">

            <div className="binary-empty-icon">
              🌳
            </div>

            <h3>
              No Binary Tree Generated
            </h3>

            <p>
              Enter the number of elements above
              and generate a balanced binary tree
              to begin the traversal analysis.
            </p>

          </div>

        )}

      </section>

    </div>
  );
}