// Agent handler registry — maps agent names to real AI implementations
const { runDentalResearch } = require('./ai-dental-research');
const { runCopywriter } = require('./ai-copywriter');
const { runAdCreative } = require('./ai-ad-creative');
const { runCarousel } = require('./ai-carousel');
const { runVideoAd } = require('./ai-video');
const { runReviewLoop } = require('./ai-review-loop');
const { runDistribution } = require('./ai-distribution');
const { PipelineLogger } = require('../utils/logger');

const handlers = {
  dental_research_agent: async (job) => {
    const logger = new PipelineLogger(job.data.task_name, 'dental_research_agent');
    logger.info('Starting dental research...');
    try {
      const result = await runDentalResearch(job);
      logger.info('Research complete', result);
      return result;
    } catch (err) {
      logger.error('Research failed', { error: err.message });
      throw err;
    }
  },

  dental_intelligence_agent: async (job) => {
    const logger = new PipelineLogger(job.data.task_name, 'dental_intelligence_agent');
    logger.info('Loading dental knowledge base...');
    // Intelligence agent enriches context by loading knowledge files
    // This is handled implicitly by the other agents reading knowledge/
    const fs = require('fs');
    const path = require('path');
    const knowledgeDir = path.resolve(__dirname, '../../knowledge');
    const procedureFile = path.join(knowledgeDir, 'procedimentos',
      job.data.procedure_focus?.replace(/\s+/g, '_').toLowerCase() + '.md');

    let knowledge = 'general dental knowledge';
    if (fs.existsSync(procedureFile)) {
      knowledge = fs.readFileSync(procedureFile, 'utf-8');
      logger.info(`Loaded procedure knowledge: ${procedureFile}`);
    }

    // Save enriched context for downstream agents
    const outputDir = path.resolve(__dirname, `../../outputs/${job.data.task_name}`);
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const enrichment = {
      procedure_knowledge: knowledge.substring(0, 2000),
      cfo_rules: fs.existsSync(path.join(knowledgeDir, 'regulatorio/cfo_publicidade.md'))
        ? fs.readFileSync(path.join(knowledgeDir, 'regulatorio/cfo_publicidade.md'), 'utf-8').substring(0, 2000)
        : '',
      emotional_triggers: fs.existsSync(path.join(knowledgeDir, 'comunicacao/gatilhos_emocionais.md'))
        ? fs.readFileSync(path.join(knowledgeDir, 'comunicacao/gatilhos_emocionais.md'), 'utf-8').substring(0, 2000)
        : '',
      patient_pains: fs.existsSync(path.join(knowledgeDir, 'comunicacao/dores_do_paciente.md'))
        ? fs.readFileSync(path.join(knowledgeDir, 'comunicacao/dores_do_paciente.md'), 'utf-8').substring(0, 2000)
        : '',
    };

    fs.writeFileSync(path.join(outputDir, 'dental_intelligence.json'), JSON.stringify(enrichment, null, 2));
    logger.info('Intelligence enrichment saved');
    return { status: 'complete', outputs: ['dental_intelligence.json'] };
  },

  ad_creative_designer: async (job) => {
    const logger = new PipelineLogger(job.data.task_name, 'ad_creative_designer');
    logger.info('Starting ad creative design...');
    try {
      const result = await runAdCreative(job);
      logger.info('Ad creative complete', result);
      return result;
    } catch (err) {
      logger.error('Ad creative failed', { error: err.message });
      throw err;
    }
  },

  carousel_agent: async (job) => {
    const logger = new PipelineLogger(job.data.task_name, 'carousel_agent');
    logger.info('Starting carousel generation...');
    try {
      const result = await runCarousel(job);
      logger.info('Carousel complete', result);
      return result;
    } catch (err) {
      logger.error('Carousel failed', { error: err.message });
      throw err;
    }
  },

  video_ad_specialist: async (job) => {
    const logger = new PipelineLogger(job.data.task_name, 'video_ad_specialist');
    logger.info('Starting video ad generation...');
    try {
      const result = await runVideoAd(job);
      logger.info('Video ad complete', result);
      return result;
    } catch (err) {
      logger.error('Video ad failed', { error: err.message });
      throw err;
    }
  },

  copywriter_agent: async (job) => {
    const logger = new PipelineLogger(job.data.task_name, 'copywriter_agent');
    logger.info('Starting copywriting...');
    try {
      const result = await runCopywriter(job);
      logger.info('Copywriting complete', result);
      return result;
    } catch (err) {
      logger.error('Copywriting failed', { error: err.message });
      throw err;
    }
  },

  review_orchestrator: async (job) => {
    const logger = new PipelineLogger(job.data.task_name, 'review_orchestrator');
    logger.info('Starting review loop...');
    try {
      const result = await runReviewLoop(job);
      logger.info('Review complete', result);
      return result;
    } catch (err) {
      logger.error('Review failed', { error: err.message });
      throw err;
    }
  },

  // Individual reviewers are handled within review_orchestrator
  cfo_compliance_reviewer: async (job) => ({ status: 'complete', notes: 'Handled by review_orchestrator' }),
  copy_reviewer: async (job) => ({ status: 'complete', notes: 'Handled by review_orchestrator' }),
  visual_reviewer: async (job) => ({ status: 'complete', notes: 'Handled by review_orchestrator' }),
  dental_expert_reviewer: async (job) => ({ status: 'complete', notes: 'Handled by review_orchestrator' }),
  issue_consolidator: async (job) => ({ status: 'complete', notes: 'Handled by review_orchestrator' }),
  correction_agent: async (job) => ({ status: 'complete', notes: 'Handled by review_orchestrator' }),

  distribution_agent: async (job) => {
    const logger = new PipelineLogger(job.data.task_name, 'distribution_agent');
    logger.info('Starting distribution...');
    try {
      const result = await runDistribution(job);
      logger.info('Distribution complete', result);
      return result;
    } catch (err) {
      logger.error('Distribution failed', { error: err.message });
      throw err;
    }
  },
};

module.exports = handlers;
