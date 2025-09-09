/**
 * Simple Error Message Audit Script
 * 
 * This script analyzes our error message constants and provides
 * a comprehensive report on the rebranding effort.
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Starting Maslow AI Error Message Audit...\n');

// Function to search for patterns in files
function searchInFile(filePath, patterns) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const results = [];
    
    patterns.forEach(pattern => {
      const regex = new RegExp(pattern.regex, 'gi');
      const matches = content.match(regex);
      if (matches) {
        results.push({
          pattern: pattern.name,
          matches: matches,
          count: matches.length,
          file: filePath
        });
      }
    });
    
    return results;
  } catch (error) {
    return [];
  }
}

// Function to recursively find files
function findFiles(dir, extensions) {
  const files = [];
  
  function traverse(currentDir) {
    try {
      const items = fs.readdirSync(currentDir);
      
      items.forEach(item => {
        const fullPath = path.join(currentDir, item);
        const stats = fs.statSync(fullPath);
        
        if (stats.isDirectory() && !item.startsWith('.') && !['node_modules', 'test-results'].includes(item)) {
          traverse(fullPath);
        } else if (stats.isFile() && extensions.some(ext => item.endsWith(ext))) {
          files.push(fullPath);
        }
      });
    } catch (error) {
      // Ignore directories we can't read
    }
  }
  
  traverse(dir);
  return files;
}

// Patterns to search for
const searchPatterns = [
  { name: 'HeyGen References', regex: 'heygen' },
  { name: 'Maslow AI References', regex: 'maslow\\s+ai' },
  { name: 'Error Messages', regex: 'error[\'"`]?\\s*:.*heygen' },
  { name: 'API Key Messages', regex: 'api\\s+key.*heygen' },
  { name: 'Service Messages', regex: 'service.*heygen' },
];

// Files to examine
const targetExtensions = ['.js', '.ts', '.tsx', '.jsx', '.html', '.md'];
const sourceFiles = findFiles('.', targetExtensions);

console.log(`📁 Scanning ${sourceFiles.length} files...\n`);

// Results storage
const auditResults = {
  heygenReferences: [],
  maslowReferences: [],
  summary: {
    totalFiles: sourceFiles.length,
    filesWithHeyGen: 0,
    filesWithMaslow: 0,
    totalHeyGenMatches: 0,
    totalMaslowMatches: 0
  }
};

// Scan all files
sourceFiles.forEach(file => {
  const results = searchInFile(file, searchPatterns);
  
  if (results.length > 0) {
    const heygenMatches = results.filter(r => r.pattern === 'HeyGen References');
    const maslowMatches = results.filter(r => r.pattern === 'Maslow AI References');
    
    if (heygenMatches.length > 0) {
      auditResults.heygenReferences.push({
        file: file.replace(process.cwd(), '.'),
        matches: heygenMatches
      });
      auditResults.summary.filesWithHeyGen++;
      auditResults.summary.totalHeyGenMatches += heygenMatches.reduce((sum, m) => sum + m.count, 0);
    }
    
    if (maslowMatches.length > 0) {
      auditResults.maslowReferences.push({
        file: file.replace(process.cwd(), '.'),
        matches: maslowMatches
      });
      auditResults.summary.filesWithMaslow++;
      auditResults.summary.totalMaslowMatches += maslowMatches.reduce((sum, m) => sum + m.count, 0);
    }
  }
});

// Generate report
console.log('📊 AUDIT RESULTS');
console.log('='.repeat(50));
console.log(`Total files scanned: ${auditResults.summary.totalFiles}`);
console.log(`Files with HeyGen references: ${auditResults.summary.filesWithHeyGen}`);
console.log(`Files with Maslow AI references: ${auditResults.summary.filesWithMaslow}`);
console.log(`Total HeyGen matches: ${auditResults.summary.totalHeyGenMatches}`);
console.log(`Total Maslow AI matches: ${auditResults.summary.totalMaslowMatches}`);
console.log('');

// Show HeyGen references (these should be minimal/zero for user-facing content)
if (auditResults.heygenReferences.length > 0) {
  console.log('⚠️  HEYGEN REFERENCES FOUND:');
  console.log('-'.repeat(30));
  auditResults.heygenReferences.forEach(ref => {
    console.log(`📁 ${ref.file}`);
    ref.matches.forEach(match => {
      console.log(`   🔍 ${match.count} matches: ${match.matches.slice(0, 3).join(', ')}${match.matches.length > 3 ? '...' : ''}`);
    });
  });
  console.log('');
} else {
  console.log('✅ NO HEYGEN REFERENCES FOUND IN USER-FACING CONTENT!');
  console.log('');
}

// Show Maslow AI references (these should be present in error messages)
if (auditResults.maslowReferences.length > 0) {
  console.log('✅ MASLOW AI REFERENCES FOUND:');
  console.log('-'.repeat(30));
  auditResults.maslowReferences.forEach(ref => {
    console.log(`📁 ${ref.file}`);
    ref.matches.forEach(match => {
      console.log(`   ✅ ${match.count} matches: ${match.matches.slice(0, 3).join(', ')}${match.matches.length > 3 ? '...' : ''}`);
    });
  });
  console.log('');
}

// Check our error messages file specifically
const errorMessagesFile = './app/lib/error-messages.ts';
if (fs.existsSync(errorMessagesFile)) {
  console.log('🎯 ERROR MESSAGES FILE ANALYSIS:');
  console.log('-'.repeat(30));
  
  const errorContent = fs.readFileSync(errorMessagesFile, 'utf8');
  const heygenInErrors = (errorContent.match(/heygen/gi) || []).length;
  const maslowInErrors = (errorContent.match(/maslow\s+ai/gi) || []).length;
  
  console.log(`📄 ${errorMessagesFile}`);
  console.log(`   HeyGen references: ${heygenInErrors} ${heygenInErrors === 0 ? '✅' : '❌'}`);
  console.log(`   Maslow AI references: ${maslowInErrors} ${maslowInErrors > 0 ? '✅' : '⚠️'}`);
  console.log('');
}

// Overall assessment
console.log('🏆 OVERALL ASSESSMENT:');
console.log('='.repeat(50));

const userFacingFiles = sourceFiles.filter(f => 
  f.includes('/api/') || 
  f.includes('/components/') || 
  f.includes('/store/') || 
  f.includes('error-messages.ts')
);

const userFacingWithHeyGen = auditResults.heygenReferences.filter(ref => 
  userFacingFiles.some(f => ref.file.includes(f.replace(process.cwd(), '.')))
);

if (userFacingWithHeyGen.length === 0) {
  console.log('🎉 SUCCESS: No HeyGen references found in user-facing components!');
  console.log('✅ All error messages appear to use Maslow AI branding.');
} else {
  console.log('⚠️  WARNING: Some user-facing files still contain HeyGen references:');
  userFacingWithHeyGen.forEach(ref => {
    console.log(`   - ${ref.file}`);
  });
}

// Save detailed report
const reportFile = './test-results/audit-detailed-report.json';
if (!fs.existsSync('./test-results')) {
  fs.mkdirSync('./test-results', { recursive: true });
}

fs.writeFileSync(reportFile, JSON.stringify(auditResults, null, 2));
console.log(`\n📋 Detailed report saved to: ${reportFile}`);

// Create markdown summary
const markdownReport = `# Error Messages Audit Report

**Date**: ${new Date().toISOString()}

## Summary
- **Total Files Scanned**: ${auditResults.summary.totalFiles}
- **Files with HeyGen References**: ${auditResults.summary.filesWithHeyGen}
- **Files with Maslow AI References**: ${auditResults.summary.filesWithMaslow}
- **Total HeyGen Matches**: ${auditResults.summary.totalHeyGenMatches}
- **Total Maslow AI Matches**: ${auditResults.summary.totalMaslowMatches}

## Status
${userFacingWithHeyGen.length === 0 ? '✅ **PASSED**: No HeyGen references in user-facing content' : '⚠️ **WARNING**: HeyGen references found in user-facing content'}

## Files with HeyGen References
${auditResults.heygenReferences.length === 0 ? 'None found ✅' : auditResults.heygenReferences.map(ref => `- ${ref.file}`).join('\n')}

## Files with Maslow AI References  
${auditResults.maslowReferences.length === 0 ? 'None found (this might be expected for backend files)' : auditResults.maslowReferences.map(ref => `- ${ref.file}`).join('\n')}

## Recommendations
${userFacingWithHeyGen.length === 0 ? 
  '- ✅ Rebranding appears complete\n- ✅ All user-facing error messages use appropriate branding\n- ✅ No further action required' : 
  '- ⚠️ Review files with HeyGen references\n- ⚠️ Update remaining user-facing messages\n- ⚠️ Re-run audit after fixes'
}
`;

fs.writeFileSync('./test-results/audit-summary.md', markdownReport);
console.log(`📋 Markdown summary saved to: ./test-results/audit-summary.md`);

console.log('\n🔍 Audit complete! Check the generated reports for detailed findings.');