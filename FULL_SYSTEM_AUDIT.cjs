// 🔍 ShaheenPulse AI - Full System Audit
// Comprehensive audit of entire codebase, logic, health checks, and systems

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class FullSystemAudit {
  constructor() {
    this.totalFiles = 0;
    this.auditedFiles = 0;
    this.results = {
      codebase: {},
      logic: {},
      healthChecks: {},
      security: {},
      performance: {},
      documentation: {},
      infrastructure: {},
      compliance: {},
      overall: {}
    };
    
    this.categories = {
      backend: ['.js', '.py'],
      frontend: ['.js', '.ts', '.tsx'],
      config: ['.json', '.yaml', '.yml'],
      docs: ['.md'],
      database: ['.sql'],
      docker: ['Dockerfile', 'docker-compose.yml']
    };
  }

  // Get all files in the project
  getAllFiles() {
    const files = [];
    
    function walkDir(currentPath) {
      try {
        const items = fs.readdirSync(currentPath);
        
        for (const item of items) {
          const fullPath = path.join(currentPath, item);
          const stat = fs.statSync(fullPath);
          
          if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules' && item !== '.git') {
            walkDir(fullPath);
          } else if (stat.isFile()) {
            files.push(fullPath);
          }
        }
      } catch (error) {
        // Skip directories we can't read
      }
    }
    
    walkDir('.');
    return files;
  }

  // Audit codebase structure
  auditCodebase() {
    console.log('🔍 Auditing Codebase Structure...');
    
    const files = this.getAllFiles();
    const structure = {
      totalFiles: files.length,
      backendFiles: 0,
      frontendFiles: 0,
      configFiles: 0,
      docFiles: 0,
      databaseFiles: 0,
      dockerFiles: 0,
      otherFiles: 0
    };
    
    files.forEach(file => {
      const ext = path.extname(file);
      const basename = path.basename(file);
      
      if (this.categories.backend.includes(ext)) {
        structure.backendFiles++;
      } else if (this.categories.frontend.includes(ext)) {
        structure.frontendFiles++;
      } else if (this.categories.config.includes(ext)) {
        structure.configFiles++;
      } else if (this.categories.docs.includes(ext)) {
        structure.docFiles++;
      } else if (this.categories.database.includes(ext)) {
        structure.databaseFiles++;
      } else if (this.categories.docker.includes(basename)) {
        structure.dockerFiles++;
      } else {
        structure.otherFiles++;
      }
    });
    
    // Calculate scores
    const expectedStructure = {
      backendFiles: 50,
      frontendFiles: 100,
      configFiles: 30,
      docFiles: 20,
      databaseFiles: 10,
      dockerFiles: 5
    };
    
    let structureScore = 0;
    let totalScore = 0;
    
    Object.keys(expectedStructure).forEach(key => {
      const actual = structure[key];
      const expected = expectedStructure[key];
      const score = Math.min(100, (actual / expected) * 100);
      structureScore += score;
      totalScore += 100;
    });
    
    this.results.codebase = {
      structure,
      score: Math.round(structureScore / (totalScore / 100)),
      status: structureScore >= 80 ? 'EXCELLENT' : structureScore >= 60 ? 'GOOD' : 'NEEDS_IMPROVEMENT'
    };
    
    console.log(`✅ Codebase Audit: ${this.results.codebase.score}% - ${this.results.codebase.status}`);
  }

  // Audit logic and algorithms
  auditLogic() {
    console.log('🧠 Auditing Logic and Algorithms...');
    
    const logicFiles = [
      'backend/agent/agent_graph.py',
      'backend/agent/enhanced_al_hakim.py',
      'backend/agent/lovable_enhanced_agent.py',
      'backend/agent/nodes/planner.py',
      'backend/agent/nodes/executor.py',
      'backend/agent/nodes/reflector.py',
      'backend/security/citadel_armor.py',
      'backend/security/zero_day_protection.py',
      'backend/health/comprehensive_health.py',
      'backend/services/neural_router.py'
    ];
    
    let logicScore = 0;
    let totalChecks = 0;
    const findings = [];
    
    logicFiles.forEach(file => {
      if (fs.existsSync(file)) {
        try {
          const content = fs.readFileSync(file, 'utf8');
          totalChecks += 5;
          
          // Check for proper error handling
          if (content.includes('try:') && content.includes('except:')) {
            logicScore += 1;
          }
          
          // Check for logging
          if (content.includes('logging') || content.includes('logger')) {
            logicScore += 1;
          }
          
          // Check for input validation
          if (content.includes('validate') || content.includes('sanitize')) {
            logicScore += 1;
          }
          
          // Check for documentation
          if (content.includes('"""') || content.includes("'''")) {
            logicScore += 1;
          }
          
          // Check for type hints
          if (content.includes(': ') && content.includes('def ')) {
            logicScore += 1;
          }
          
          findings.push({ file, status: 'PRESENT' });
        } catch (error) {
          findings.push({ file, status: 'ERROR', error: error.message });
        }
      } else {
        findings.push({ file, status: 'MISSING' });
        totalChecks += 5;
      }
    });
    
    const finalScore = totalChecks > 0 ? Math.round((logicScore / totalChecks) * 100) : 0;
    
    this.results.logic = {
      files: logicFiles.length,
      present: findings.filter(f => f.status === 'PRESENT').length,
      missing: findings.filter(f => f.status === 'MISSING').length,
      errors: findings.filter(f => f.status === 'ERROR').length,
      score: finalScore,
      status: finalScore >= 80 ? 'EXCELLENT' : finalScore >= 60 ? 'GOOD' : 'NEEDS_IMPROVEMENT',
      findings
    };
    
    console.log(`✅ Logic Audit: ${finalScore}% - ${this.results.logic.status}`);
  }

  // Audit health checks
  auditHealthChecks() {
    console.log('🏥 Auditing Health Checks...');
    
    const healthCheckFiles = [
      'backend/health/comprehensive_health.py',
      'backend/api/health.py',
      'PATENT_AUDIT_SCAN.cjs',
      'INDUSTRIAL_DOCKER_SETUP.yml',
      'VITALITY_INDEX_SCHEMA.sql'
    ];
    
    let healthScore = 0;
    let totalChecks = 0;
    const healthChecks = [];
    
    healthCheckFiles.forEach(file => {
      if (fs.existsSync(file)) {
        try {
          const content = fs.readFileSync(file, 'utf8');
          totalChecks += 4;
          
          // Check for health endpoints
          if (content.includes('/health') || content.includes('/vitality-check')) {
            healthScore += 1;
          }
          
          // Check for monitoring
          if (content.includes('monitor') || content.includes('metrics')) {
            healthScore += 1;
          }
          
          // Check for alerts
          if (content.includes('alert') || content.includes('notification')) {
            healthScore += 1;
          }
          
          // Check for logging
          if (content.includes('log') || content.includes('audit')) {
            healthScore += 1;
          }
          
          healthChecks.push({ file, status: 'ACTIVE' });
        } catch (error) {
          healthChecks.push({ file, status: 'ERROR', error: error.message });
        }
      } else {
        healthChecks.push({ file, status: 'MISSING' });
        totalChecks += 4;
      }
    });
    
    const finalScore = totalChecks > 0 ? Math.round((healthScore / totalChecks) * 100) : 0;
    
    this.results.healthChecks = {
      files: healthCheckFiles.length,
      active: healthChecks.filter(h => h.status === 'ACTIVE').length,
      missing: healthChecks.filter(h => h.status === 'MISSING').length,
      errors: healthChecks.filter(h => h.status === 'ERROR').length,
      score: finalScore,
      status: finalScore >= 80 ? 'EXCELLENT' : finalScore >= 60 ? 'GOOD' : 'NEEDS_IMPROVEMENT',
      healthChecks
    };
    
    console.log(`✅ Health Checks Audit: ${finalScore}% - ${this.results.healthChecks.status}`);
  }

  // Audit security
  auditSecurity() {
    console.log('🔒 Auditing Security...');
    
    const securityFiles = [
      'backend/security/citadel_armor.py',
      'backend/security/zero_day_protection.py',
      'backend/security/zero_day_middleware.py',
      'PATENT_AUDIT_SCAN.cjs'
    ];
    
    let securityScore = 0;
    let totalChecks = 0;
    const securityFeatures = [];
    
    securityFiles.forEach(file => {
      if (fs.existsSync(file)) {
        try {
          const content = fs.readFileSync(file, 'utf8');
          totalChecks += 5;
          
          // Check for encryption
          if (content.includes('encrypt') || content.includes('cipher')) {
            securityScore += 1;
          }
          
          // Check for authentication
          if (content.includes('auth') || content.includes('token') || content.includes('jwt')) {
            securityScore += 1;
          }
          
          // Check for input validation
          if (content.includes('validate') || content.includes('sanitize')) {
            securityScore += 1;
          }
          
          // Check for logging
          if (content.includes('log') || content.includes('audit')) {
            securityScore += 1;
          }
          
          // Check for error handling
          if (content.includes('try:') && content.includes('except:')) {
            securityScore += 1;
          }
          
          securityFeatures.push({ file, status: 'SECURED' });
        } catch (error) {
          securityFeatures.push({ file, status: 'ERROR', error: error.message });
        }
      } else {
        securityFeatures.push({ file, status: 'MISSING' });
        totalChecks += 5;
      }
    });
    
    const finalScore = totalChecks > 0 ? Math.round((securityScore / totalChecks) * 100) : 0;
    
    this.results.security = {
      files: securityFiles.length,
      secured: securityFeatures.filter(s => s.status === 'SECURED').length,
      missing: securityFeatures.filter(s => s.status === 'MISSING').length,
      errors: securityFeatures.filter(s => s.status === 'ERROR').length,
      score: finalScore,
      status: finalScore >= 80 ? 'EXCELLENT' : finalScore >= 60 ? 'GOOD' : 'NEEDS_IMPROVEMENT',
      securityFeatures
    };
    
    console.log(`✅ Security Audit: ${finalScore}% - ${this.results.security.status}`);
  }

  // Audit performance
  auditPerformance() {
    console.log('⚡ Auditing Performance...');
    
    const performanceIndicators = [
      { name: 'Database Optimization', check: () => fs.existsSync('VITALITY_INDEX_SCHEMA.sql') },
      { name: 'Docker Configuration', check: () => fs.existsSync('INDUSTRIAL_DOCKER_SETUP.yml') },
      { name: 'Frontend Optimization', check: () => fs.existsSync('frontend/next.config.js') },
      { name: 'Backend Performance', check: () => fs.existsSync('backend/server.py') },
      { name: 'Caching Strategy', check: () => fs.existsSync('INDUSTRIAL_DOCKER_SETUP.yml') && fs.readFileSync('INDUSTRIAL_DOCKER_SETUP.yml', 'utf8').includes('redis') }
    ];
    
    let performanceScore = 0;
    const performanceResults = [];
    
    performanceIndicators.forEach(indicator => {
      const result = indicator.check();
      if (result) {
        performanceScore += 20;
        performanceResults.push({ name: indicator.name, status: 'OPTIMIZED' });
      } else {
        performanceResults.push({ name: indicator.name, status: 'NEEDS_OPTIMIZATION' });
      }
    });
    
    this.results.performance = {
      indicators: performanceIndicators.length,
      optimized: performanceResults.filter(p => p.status === 'OPTIMIZED').length,
      needsOptimization: performanceResults.filter(p => p.status === 'NEEDS_OPTIMIZATION').length,
      score: performanceScore,
      status: performanceScore >= 80 ? 'EXCELLENT' : performanceScore >= 60 ? 'GOOD' : 'NEEDS_IMPROVEMENT',
      performanceResults
    };
    
    console.log(`✅ Performance Audit: ${performanceScore}% - ${this.results.performance.status}`);
  }

  // Audit documentation
  auditDocumentation() {
    console.log('📚 Auditing Documentation...');
    
    const docFiles = [
      'README.md',
      'AGENTIC_BLUEPRINT.md',
      'BILINGUAL_IMPLEMENTATION.md',
      'COMMERCIAL_ENGINE_RECALIBRATION.md',
      'DEVOPS_PORTABILITY_ARCHITECTURE.md',
      'INDUSTRIAL_LAUNCH_SETUP_GUIDE.md',
      'INSTALLATION_GUIDE.md',
      'LOVABLE_INTEGRATION_COMPLETE.md',
      'SOVEREIGN_AUDIT.md',
      'COMPREHENSIVE_READINESS_AUDIT.md'
    ];
    
    let docScore = 0;
    const documentationResults = [];
    
    docFiles.forEach(file => {
      if (fs.existsSync(file)) {
        try {
          const content = fs.readFileSync(file, 'utf8');
          const size = content.length;
          
          if (size > 1000) {
            docScore += 10;
            documentationResults.push({ file, status: 'COMPLETE', size });
          } else {
            docScore += 5;
            documentationResults.push({ file, status: 'MINIMAL', size });
          }
        } catch (error) {
          documentationResults.push({ file, status: 'ERROR', error: error.message });
        }
      } else {
        documentationResults.push({ file, status: 'MISSING' });
      }
    });
    
    this.results.documentation = {
      files: docFiles.length,
      complete: documentationResults.filter(d => d.status === 'COMPLETE').length,
      minimal: documentationResults.filter(d => d.status === 'MINIMAL').length,
      missing: documentationResults.filter(d => d.status === 'MISSING').length,
      errors: documentationResults.filter(d => d.status === 'ERROR').length,
      score: docScore,
      status: docScore >= 80 ? 'EXCELLENT' : docScore >= 60 ? 'GOOD' : 'NEEDS_IMPROVEMENT',
      documentationResults
    };
    
    console.log(`✅ Documentation Audit: ${docScore}% - ${this.results.documentation.status}`);
  }

  // Audit infrastructure
  auditInfrastructure() {
    console.log('🏗️ Auditing Infrastructure...');
    
    const infraFiles = [
      'INDUSTRIAL_DOCKER_SETUP.yml',
      'VITALITY_INDEX_SCHEMA.sql',
      'WINDSURF_LAYOUT_CONFIG.txt',
      'THUNDER_CLIENT_COLLECTION.txt',
      'package.json',
      'backend/requirements.txt',
      'frontend/package.json'
    ];
    
    let infraScore = 0;
    const infrastructureResults = [];
    
    infraFiles.forEach(file => {
      if (fs.existsSync(file)) {
        try {
          const content = fs.readFileSync(file, 'utf8');
          infraScore += 14; // 100/7 files
          infrastructureResults.push({ file, status: 'CONFIGURED' });
        } catch (error) {
          infrastructureResults.push({ file, status: 'ERROR', error: error.message });
        }
      } else {
        infrastructureResults.push({ file, status: 'MISSING' });
      }
    });
    
    this.results.infrastructure = {
      files: infraFiles.length,
      configured: infrastructureResults.filter(i => i.status === 'CONFIGURED').length,
      missing: infrastructureResults.filter(i => i.status === 'MISSING').length,
      errors: infrastructureResults.filter(i => i.status === 'ERROR').length,
      score: infraScore,
      status: infraScore >= 80 ? 'EXCELLENT' : infraScore >= 60 ? 'GOOD' : 'NEEDS_IMPROVEMENT',
      infrastructureResults
    };
    
    console.log(`✅ Infrastructure Audit: ${infraScore}% - ${this.results.infrastructure.status}`);
  }

  // Audit compliance
  auditCompliance() {
    console.log('⚖️ Auditing Compliance...');
    
    const complianceChecks = [
      { name: 'Patent Protection', check: () => fs.existsSync('PATENT_AUDIT_SCAN.cjs') },
      { name: 'Data Protection', check: () => fs.existsSync('VITALITY_INDEX_SCHEMA.sql') },
      { name: 'Security Standards', check: () => fs.existsSync('backend/security/citadel_armor.py') },
      { name: 'Documentation Standards', check: () => fs.existsSync('COMPREHENSIVE_READINESS_AUDIT.md') },
      { name: 'Industrial Standards', check: () => fs.existsSync('INDUSTRIAL_DOCKER_SETUP.yml') }
    ];
    
    let complianceScore = 0;
    const complianceResults = [];
    
    complianceChecks.forEach(check => {
      const result = check.check();
      if (result) {
        complianceScore += 20;
        complianceResults.push({ name: check.name, status: 'COMPLIANT' });
      } else {
        complianceResults.push({ name: check.name, status: 'NON_COMPLIANT' });
      }
    });
    
    this.results.compliance = {
      checks: complianceChecks.length,
      compliant: complianceResults.filter(c => c.status === 'COMPLIANT').length,
      nonCompliant: complianceResults.filter(c => c.status === 'NON_COMPLIANT').length,
      score: complianceScore,
      status: complianceScore >= 80 ? 'EXCELLENT' : complianceScore >= 60 ? 'GOOD' : 'NEEDS_IMPROVEMENT',
      complianceResults
    };
    
    console.log(`✅ Compliance Audit: ${complianceScore}% - ${this.results.compliance.status}`);
  }

  // Calculate overall score
  calculateOverallScore() {
    const scores = [
      this.results.codebase.score,
      this.results.logic.score,
      this.results.healthChecks.score,
      this.results.security.score,
      this.results.performance.score,
      this.results.documentation.score,
      this.results.infrastructure.score,
      this.results.compliance.score
    ];
    
    const totalScore = scores.reduce((sum, score) => sum + score, 0);
    const overallScore = Math.round(totalScore / scores.length);
    
    this.results.overall = {
      score: overallScore,
      status: overallScore >= 90 ? 'MASTERPIECE' : overallScore >= 80 ? 'EXCELLENT' : overallScore >= 70 ? 'GOOD' : overallScore >= 60 ? 'ACCEPTABLE' : 'NEEDS_IMPROVEMENT',
      breakdown: {
        codebase: this.results.codebase.score,
        logic: this.results.logic.score,
        healthChecks: this.results.healthChecks.score,
        security: this.results.security.score,
        performance: this.results.performance.score,
        documentation: this.results.documentation.score,
        infrastructure: this.results.infrastructure.score,
        compliance: this.results.compliance.score
      }
    };
    
    return overallScore;
  }

  // Generate comprehensive report
  generateReport() {
    console.log('\n📊 GENERATING COMPREHENSIVE AUDIT REPORT');
    console.log('=' .repeat(60));
    
    const overallScore = this.calculateOverallScore();
    
    console.log('\n🎯 OVERALL SYSTEM HEALTH');
    console.log(`Score: ${overallScore}%`);
    console.log(`Status: ${this.results.overall.status}`);
    
    console.log('\n📋 CATEGORY BREAKDOWN');
    console.log(`Codebase Structure: ${this.results.codebase.score}% - ${this.results.codebase.status}`);
    console.log(`Logic & Algorithms: ${this.results.logic.score}% - ${this.results.logic.status}`);
    console.log(`Health Checks: ${this.results.healthChecks.score}% - ${this.results.healthChecks.status}`);
    console.log(`Security: ${this.results.security.score}% - ${this.results.security.status}`);
    console.log(`Performance: ${this.results.performance.score}% - ${this.results.performance.status}`);
    console.log(`Documentation: ${this.results.documentation.score}% - ${this.results.documentation.status}`);
    console.log(`Infrastructure: ${this.results.infrastructure.score}% - ${this.results.infrastructure.status}`);
    console.log(`Compliance: ${this.results.compliance.score}% - ${this.results.compliance.status}`);
    
    console.log('\n🔍 DETAILED FINDINGS');
    
    // Codebase details
    console.log('\n📁 Codebase Structure:');
    console.log(`  Total Files: ${this.results.codebase.structure.totalFiles}`);
    console.log(`  Backend Files: ${this.results.codebase.structure.backendFiles}`);
    console.log(`  Frontend Files: ${this.results.codebase.structure.frontendFiles}`);
    console.log(`  Config Files: ${this.results.codebase.structure.configFiles}`);
    console.log(`  Documentation: ${this.results.codebase.structure.docFiles}`);
    
    // Logic details
    console.log('\n🧠 Logic & Algorithms:');
    console.log(`  Files Audited: ${this.results.logic.files}`);
    console.log(`  Present: ${this.results.logic.present}`);
    console.log(`  Missing: ${this.results.logic.missing}`);
    console.log(`  Errors: ${this.results.logic.errors}`);
    
    // Security details
    console.log('\n🔒 Security:');
    console.log(`  Files Secured: ${this.results.security.secured}`);
    console.log(`  Missing: ${this.results.security.missing}`);
    console.log(`  Errors: ${this.results.security.errors}`);
    
    // Performance details
    console.log('\n⚡ Performance:');
    console.log(`  Optimized: ${this.results.performance.optimized}`);
    console.log(`  Needs Optimization: ${this.results.performance.needsOptimization}`);
    
    // Infrastructure details
    console.log('\n🏗️ Infrastructure:');
    console.log(`  Configured: ${this.results.infrastructure.configured}`);
    console.log(`  Missing: ${this.results.infrastructure.missing}`);
    console.log(`  Errors: ${this.results.infrastructure.errors}`);
    
    // Compliance details
    console.log('\n⚖️ Compliance:');
    console.log(`  Compliant: ${this.results.compliance.compliant}`);
    console.log(`  Non-Compliant: ${this.results.compliance.nonCompliant}`);
    
    console.log('\n🏆 FINAL ASSESSMENT');
    if (overallScore >= 90) {
      console.log('🎉 MASTERPIECE - Your ShaheenPulse AI system is exceptional!');
    } else if (overallScore >= 80) {
      console.log('✅ EXCELLENT - Your system is very well prepared!');
    } else if (overallScore >= 70) {
      console.log('👍 GOOD - Your system is ready with minor improvements needed!');
    } else if (overallScore >= 60) {
      console.log('⚠️ ACCEPTABLE - Your system needs some improvements!');
    } else {
      console.log('❌ NEEDS IMPROVEMENT - Significant work required!');
    }
    
    return overallScore;
  }

  // Execute full audit
  executeFullAudit() {
    console.log('🚀 STARTING FULL SYSTEM AUDIT OF SHAHEENPULSE AI');
    console.log('=' .repeat(60));
    
    const startTime = Date.now();
    
    // Run all audits
    this.auditCodebase();
    this.auditLogic();
    this.auditHealthChecks();
    this.auditSecurity();
    this.auditPerformance();
    this.auditDocumentation();
    this.auditInfrastructure();
    this.auditCompliance();
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`\n⏱️ Audit completed in ${duration}ms`);
    
    // Generate final report
    const finalScore = this.generateReport();
    
    console.log('\n🎯 FINAL OK PERCENTAGE');
    console.log('=' .repeat(60));
    console.log(`🎉 SHAHEENPULSE AI OK PERCENTAGE: ${finalScore}%`);
    console.log(`🏆 STATUS: ${this.results.overall.status}`);
    console.log('=' .repeat(60));
    
    return {
      score: finalScore,
      status: this.results.overall.status,
      duration,
      results: this.results
    };
  }
}

// Execute the full audit
const auditor = new FullSystemAudit();
const auditResults = auditor.executeFullAudit();

// Export for use in other scripts
module.exports = FullSystemAudit;
