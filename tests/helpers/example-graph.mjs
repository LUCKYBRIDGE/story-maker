import assert from 'node:assert/strict';

// Independent test oracle: chapter order, then cut order; never raw JSON position.
export function analyzeExample(project) {
  const lines = [...project.chapters].sort((a, b) => a.order - b.order)
    .flatMap(chapter => project.lines.filter(line => line.chapterId === chapter.id).sort((a, b) => a.order - b.order));
  assert.equal(lines.length, project.lines.length, 'orphan or duplicate chapter membership');
  const byId = new Map(lines.map(line => [line.id, line]));
  assert.equal(byId.size, lines.length, 'duplicate cut ID');
  const edges = new Map(lines.map((line, index) => [line.id,
    line.flow?.type === 'choice' ? line.flow.options.map((option, optionIndex) => ({ target: option.targetLineId, optionIndex }))
      : [{ target: line.flow?.type === 'goto' ? line.flow.targetLineId : lines[index + 1]?.id ?? null }],
  ]));
  for (const targets of edges.values()) for (const edge of targets)
    assert.ok(edge.target === null || byId.has(edge.target), `broken target ${edge.target}`);
  const colors = new Map();
  function visit(id) {
    assert.notEqual(colors.get(id), 'active', `cycle at ${id}`);
    if (colors.get(id) === 'done') return;
    colors.set(id, 'active');
    for (const { target } of edges.get(id)) if (target !== null) visit(target);
    colors.set(id, 'done');
  }
  for (const line of lines) visit(line.id); // Also inspect disconnected source routes.
  const routes = [], reached = new Set(), reachedEdges = new Set();
  function walk(id, path) {
    reached.add(id);
    for (const [edgeIndex, edge] of edges.get(id).entries()) {
      reachedEdges.add(`${id}/${edgeIndex}`);
      const nextPath = [...path, { lineId: id, ...edge }];
      if (edge.target === null) routes.push(nextPath);
      else walk(edge.target, nextPath);
      assert.ok(routes.length <= 1000, 'example path explosion; review graph');
    }
  }
  walk(lines[0].id, []);
  const endingRoutes = new Map();
  for (const route of routes) {
    const end = route.at(-1).lineId;
    if (!endingRoutes.has(end) || route.length < endingRoutes.get(end).length) endingRoutes.set(end, route);
  }
  const incoming = new Map();
  for (const id of reached) for (const { target } of edges.get(id)) if (target !== null)
    incoming.set(target, (incoming.get(target) || 0) + 1);
  return { lines, byId, routes, endingRoutes: [...endingRoutes.values()],
    unreachable: lines.filter(line => !reached.has(line.id)).map(line => line.id),
    reachableCuts: reached.size, reachableEdges: reachedEdges.size,
    joins: [...incoming].filter(([, count]) => count > 1).map(([id]) => id) };
}
