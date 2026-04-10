'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Dental Research Agent Handler
 * Uses Tavily SDK to run procedure-focused searches and compile research output.
 */
async function handle(job) {
  const { task_name, client_id, procedure_focus, platform_targets } = job.data;
  const startTime = Date.now();
  const outputDir = path.resolve(__dirname, '../../outputs', task_name);

  fs.mkdirSync(outputDir, { recursive: true });

  job.log(`Processing dental_research_agent for ${task_name}...`);
  job.updateProgress(10);

  // Define the 5 research queries
  const queries = [
    `${procedure_focus} patient benefits and outcomes`,
    `${procedure_focus} latest techniques and technology 2025`,
    `${procedure_focus} cost comparison and insurance coverage`,
    `${procedure_focus} patient testimonials and satisfaction`,
    `${procedure_focus} competitive dental marketing messaging`,
  ];

  let searchResults = [];

  // Attempt Tavily search if API key is available
  const tavilyKey = process.env.TAVILY_API_KEY;
  if (tavilyKey) {
    try {
      const { tavily } = require('@tavily/core');
      const client = tavily({ apiKey: tavilyKey });

      job.log('Tavily API key found — running live searches...');
      for (let i = 0; i < queries.length; i++) {
        try {
          const result = await client.search(queries[i], { maxResults: 5 });
          searchResults.push({
            query: queries[i],
            results: result.results || [],
            timestamp: new Date().toISOString(),
          });
          job.updateProgress(10 + Math.round(((i + 1) / queries.length) * 50));
        } catch (err) {
          job.log(`Search failed for query "${queries[i]}": ${err.message}`);
          searchResults.push({
            query: queries[i],
            results: [],
            error: err.message,
            timestamp: new Date().toISOString(),
          });
        }
      }
    } catch (err) {
      job.log(`Tavily SDK not available: ${err.message}. Using stub data.`);
      searchResults = queries.map((q) => ({
        query: q,
        results: [{ title: `[STUB] Result for: ${q}`, url: 'https://example.com', content: 'Simulated research content.' }],
        stub: true,
        timestamp: new Date().toISOString(),
      }));
    }
  } else {
    job.log('No TAVILY_API_KEY found — generating stub research data.');
    searchResults = queries.map((q) => ({
      query: q,
      results: [{ title: `[STUB] Result for: ${q}`, url: 'https://example.com', content: 'Simulated research content.' }],
      stub: true,
      timestamp: new Date().toISOString(),
    }));
  }

  job.updateProgress(70);

  // Write research_results.json
  const researchPayload = {
    task_name,
    client_id,
    procedure_focus,
    platform_targets,
    search_count: searchResults.length,
    searches: searchResults,
    generated_at: new Date().toISOString(),
  };

  const resultsPath = path.join(outputDir, 'research_results.json');
  fs.writeFileSync(resultsPath, JSON.stringify(researchPayload, null, 2), 'utf-8');
  job.log(`Wrote ${resultsPath}`);

  job.updateProgress(85);

  // Write research_brief.md
  let brief = `# Research Brief: ${procedure_focus}\n\n`;
  brief += `**Client:** ${client_id}  \n`;
  brief += `**Generated:** ${new Date().toISOString()}  \n`;
  brief += `**Platforms:** ${platform_targets.join(', ')}  \n\n`;
  brief += `## Key Findings\n\n`;
  for (const search of searchResults) {
    brief += `### ${search.query}\n\n`;
    for (const r of search.results) {
      brief += `- **${r.title}**\n  ${r.content || 'No snippet available.'}\n\n`;
    }
  }

  const briefPath = path.join(outputDir, 'research_brief.md');
  fs.writeFileSync(briefPath, brief, 'utf-8');
  job.log(`Wrote ${briefPath}`);

  job.updateProgress(100);

  const duration = Date.now() - startTime;
  return {
    status: 'completed',
    agent: 'dental_research_agent',
    duration_ms: duration,
    outputs: [resultsPath, briefPath],
    notes: tavilyKey ? 'Live Tavily searches completed.' : 'Stub data generated (no API key).',
  };
}

module.exports = { handle };
