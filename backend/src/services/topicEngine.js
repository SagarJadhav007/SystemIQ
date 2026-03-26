export function extractTopicsFromText(text, problem) {
  if (!text) return [];

  const detected = [];
  const lower = text.toLowerCase();

  for (const [key, topic] of Object.entries(problem.topics)) {
    for (const factor of topic.key_factors) {
      if (lower.includes(factor)) {
        detected.push(key);
        break;
      }
    }
  }

  return detected;
}

export function extractTopicsFromGraph(graph, problem) {
  if (!graph?.nodes) return [];

  const topics = [];

  for (const node of graph.nodes) {
    const topic = problem.node_to_topic[node.type];
    if (topic) topics.push(topic);
  }

  return topics;
}