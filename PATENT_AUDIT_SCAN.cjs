// 🔍 ShaheenPulse AI - Patent Audit Scanner
// Scans for proprietary architecture components and tags them appropriately

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class PatentAuditScanner {
  constructor() {
    this.patentKeywords = [
      'Mutation',
      'Hardware Abstraction',
      'Aeon Evolution',
      'Vortex Interaction',
      'Phalanx Twin-Gating',
      'Vitality Index',
      'Self-Healing',
      'Industrial Failure',
      'Model Drift',
      'SHAHEEN_CORE_LOGIC'
    ];
    
    this.patentTag = '// ! PATENT-PENDING: SHAHEEN_CORE_LOGIC';
    this.scannedFiles = [];
    this.patentFiles = [];
    this.missingTags = [];
  }

  // Scan directory recursively for relevant files
  scanDirectory(dirPath, extensions = ['.js', '.ts', '.tsx', '.py', '.jsx']) {
    const files = [];
    
    function walkDir(currentPath) {
      const items = fs.readdirSync(currentPath);
      
      for (const item of items) {
        const fullPath = path.join(currentPath, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          walkDir(fullPath);
        } else if (stat.isFile()) {
          const ext = path.extname(item);
          if (extensions.includes(ext)) {
            files.push(fullPath);
          }
        }
      }
    }
    
    walkDir(dirPath);
    return files;
  }

  // Scan individual file for patent-related content
  scanFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      const patentLines = [];
      let hasPatentTag = false;
      
      lines.forEach((line, index) => {
        const lineNumber = index + 1;
        
        // Check for patent keywords
        for (const keyword of this.patentKeywords) {
          if (line.toLowerCase().includes(keyword.toLowerCase())) {
            patentLines.push({
              line: lineNumber,
              content: line.trim(),
              keyword: keyword,
              hasTag: line.includes(this.patentTag)
            });
          }
        }
        
        // Check for existing patent tag
        if (line.includes(this.patentTag)) {
          hasPatentTag = true;
        }
      });
      
      return {
        file: filePath,
        patentLines: patentLines,
        hasPatentTag: hasPatentTag,
        needsTagging: patentLines.length > 0 && !hasPatentTag
      };
    } catch (error) {
      console.error(`Error scanning file ${filePath}:`, error.message);
      return null;
    }
  }

  // Add patent tags to files that need them
  addPatentTags(filePath, scanResult) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      
      // Add patent tag at the beginning of the file
      if (scanResult.needsTagging) {
        lines.unshift('');
        lines.unshift(this.patentTag);
        lines.unshift('// 🔒 ShaheenPulse AI - Proprietary Architecture');
        
        const updatedContent = lines.join('\n');
        fs.writeFileSync(filePath, updatedContent);
        
        console.log(`✅ Added patent tag to: ${filePath}`);
        return true;
      }
    } catch (error) {
      console.error(`Error adding patent tag to ${filePath}:`, error.message);
      return false;
    }
    return false;
  }

  // Run Snyk security scan
  runSnykScan() {
    try {
      console.log('🔍 Running Snyk security scan...');
      const output = execSync('npx snyk test --json', { encoding: 'utf8' });
      return JSON.parse(output);
    } catch (error) {
      console.error('Snyk scan failed:', error.message);
      return null;
    }
  }

  // Main audit execution
  executeAudit(rootDir = '.') {
    console.log('🚀 Starting ShaheenPulse AI Patent Audit...\n');
    
    // Scan all relevant files
    const files = this.scanDirectory(rootDir);
    console.log(`📁 Found ${files.length} files to scan\n`);
    
    // Scan each file for patent content
    files.forEach(filePath => {
      const scanResult = this.scanFile(filePath);
      if (scanResult) {
        this.scannedFiles.push(scanResult);
        
        if (scanResult.patentLines.length > 0) {
          this.patentFiles.push(scanResult);
          
          if (scanResult.needsTagging) {
            this.missingTags.push(filePath);
          }
        }
      }
    });
    
    // Generate audit report
    this.generateAuditReport();
    
    // Add missing patent tags
    if (this.missingTags.length > 0) {
      console.log('\n🔧 Adding missing patent tags...');
      this.missingTags.forEach(filePath => {
        const scanResult = this.scannedFiles.find(f => f.file === filePath);
        if (scanResult) {
          this.addPatentTags(filePath, scanResult);
        }
      });
    }
    
    // Run security scan
    const snykResults = this.runSnykScan();
    if (snykResults) {
      console.log('\n🔒 Snyk Security Scan Results:');
      console.log(`Vulnerabilities: ${snykResults.vulnerabilities.length}`);
    }
    
    console.log('\n✅ Patent audit completed!');
    return this.getAuditSummary();
  }

  // Generate detailed audit report
  generateAuditReport() {
    console.log('\n📊 PATENT AUDIT REPORT');
    console.log('='.repeat(50));
    
    console.log(`\n📁 Files Scanned: ${this.scannedFiles.length}`);
    console.log(`🔒 Patent-Related Files: ${this.patentFiles.length}`);
    console.log(`🏷️  Files Needing Tags: ${this.missingTags.length}`);
    
    if (this.patentFiles.length > 0) {
      console.log('\n🔍 PATENT-RELATED COMPONENTS:');
      this.patentFiles.forEach(file => {
        console.log(`\n📄 ${file.file}`);
        file.patentLines.forEach(line => {
          const status = line.hasTag ? '✅' : '⚠️';
          console.log(`   ${status} Line ${line.line}: ${line.content}`);
          console.log(`      Keyword: ${line.keyword}`);
        });
      });
    }
    
    if (this.missingTags.length > 0) {
      console.log('\n🏷️  FILES NEEDING PATENT TAGS:');
      this.missingTags.forEach(file => {
        console.log(`   📄 ${file}`);
      });
    }
  }

  // Get audit summary
  getAuditSummary() {
    return {
      totalFiles: this.scannedFiles.length,
      patentFiles: this.patentFiles.length,
      filesNeedingTags: this.missingTags.length,
      patentKeywords: this.patentKeywords,
      auditDate: new Date().toISOString(),
      status: this.missingTags.length === 0 ? 'COMPLIANT' : 'NEEDS_ATTENTION'
    };
  }
}

// Execute the audit
const scanner = new PatentAuditScanner();
const auditResults = scanner.executeAudit();

// Export for use in other scripts
module.exports = PatentAuditScanner;
