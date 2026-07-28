const express = require('express');
const cors = require('cors');
const { JSDOM } = require('jsdom');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '1mb' }));

function buildDomTree(node) {
  if (!node) {
    return null;
  }

  if (node.nodeType === node.TEXT_NODE) {
    const content = node.textContent?.replace(/\s+/g, ' ').trim();
    if (!content) {
      return null;
    }

    return {
      tag: '#text',
      content,
      children: []
    };
  }

  if (node.nodeType === node.COMMENT_NODE) {
    return {
      tag: '#comment',
      content: node.textContent || '',
      children: []
    };
  }

  const attributes = {};
  for (let i = 0; i < node.attributes?.length; i += 1) {
    const attr = node.attributes[i];
    attributes[attr.name] = attr.value;
  }

  const children = Array.from(node.childNodes)
    .map(buildDomTree)
    .filter(Boolean);

  return {
    tag: node.tagName ? node.tagName.toLowerCase() : '#document',
    attributes: Object.keys(attributes).length ? attributes : {},
    children
  };
}

app.post('/api/parse-dom', (req, res) => {
  try {
    const { html } = req.body || {};

    if (typeof html !== 'string' || !html.trim()) {
      return res.status(400).json({ error: 'Please provide a non-empty HTML string.' });
    }

    const dom = new JSDOM(html, { runScripts: 'dangerously' });
    const root = dom.window.document.documentElement;
    const tree = buildDomTree(root);

    return res.json(tree);
  } catch (error) {
    console.error('DOM parsing failed:', error);
    return res.status(422).json({ error: 'Invalid or malformed HTML provided.' });
  }
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
