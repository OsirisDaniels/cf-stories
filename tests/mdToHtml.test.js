 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a//dev/null b/tests/mdToHtml.test.js
index 0000000000000000000000000000000000000000..5294c55e3cd0c5fbf4b46301113b23b46a93fc5b 100644
--- a//dev/null
+++ b/tests/mdToHtml.test.js
@@ -0,0 +1,46 @@
+const fs = require('fs');
+const vm = require('vm');
+const assert = require('assert');
+
+const html = fs.readFileSync(require('path').join(__dirname, '..', 'index.html'), 'utf8');
+const start = html.indexOf('const esc=');
+const end = html.indexOf('// Load posts', start);
+if (start === -1 || end === -1) {
+  throw new Error('Could not locate mdToHtml implementation in index.html');
+}
+const code = html.slice(start, end);
+const context = {};
+vm.createContext(context);
+new vm.Script(code).runInContext(context);
+
+const mdToHtml = context.mdToHtml;
+assert.strictEqual(typeof mdToHtml, 'function', 'mdToHtml should be a function');
+
+(function testHeadingsAndParagraphs() {
+  const input = '# Title\n\nParagraph';
+  const output = mdToHtml(input);
+  assert.ok(output.includes('<h1>Title</h1>'), 'renders heading');
+  assert.ok(/<p>Paragraph<\/p>/.test(output), 'wraps paragraph');
+})();
+
+(function testLists() {
+  const input = '- one\n- two\n\n* three';
+  const output = mdToHtml(input);
+  const listContainers = output.match(/<ul>.*?<\/ul>/gs) || [];
+  assert.ok(listContainers.length >= 1, 'creates at least one list container');
+  const listItems = output.match(/<li>.*?<\/li>/g) || [];
+  assert.ok(listItems.some(item => item.includes('one')), 'renders first bullet');
+  assert.ok(listItems.some(item => item.includes('two')), 'renders second bullet');
+  assert.ok(listItems.some(item => item.includes('three')), 'renders third bullet');
+})();
+
+(function testBlockquoteAndInline() {
+  const input = '> quoted\n\n**bold** and _em_ plus `code`';
+  const output = mdToHtml(input);
+  assert.ok(output.includes('<blockquote>quoted</blockquote>'), 'renders blockquote');
+  assert.ok(output.includes('<strong>bold</strong>'), 'renders bold');
+  assert.ok(output.includes('<em>em</em>'), 'renders emphasis');
+  assert.ok(output.includes('<code>code</code>'), 'renders code');
+})();
+
+console.log('mdToHtml tests passed');
 
EOF
)
