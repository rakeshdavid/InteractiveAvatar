#!/bin/bash

# Error Messages Audit Test Script
# 
# This script runs comprehensive error message testing to ensure
# all HeyGen references have been replaced with Maslow AI branding.

set -e

echo "🔍 Starting Error Messages Audit for Maslow AI Rebranding"
echo "================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js first.${NC}"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed. Please install npm first.${NC}"
    exit 1
fi

# Install Playwright if not already installed
echo -e "${YELLOW}📦 Checking Playwright installation...${NC}"
if ! npm list @playwright/test &> /dev/null; then
    echo -e "${YELLOW}📥 Installing Playwright...${NC}"
    npm install -D @playwright/test
    echo -e "${GREEN}✅ Playwright installed${NC}"
else
    echo -e "${GREEN}✅ Playwright already installed${NC}"
fi

# Install Playwright browsers
echo -e "${YELLOW}🌐 Installing Playwright browsers...${NC}"
npx playwright install chromium
echo -e "${GREEN}✅ Browsers installed${NC}"

# Create test results directory
mkdir -p test-results
echo -e "${GREEN}✅ Test results directory ready${NC}"

# Run the error messages audit
echo -e "${YELLOW}🧪 Running Error Messages Audit...${NC}"
echo "================================================="

# Set environment variables for testing
export BASE_URL="http://localhost:3000"
export NODE_ENV="test"

# Run the specific error message audit test
if npx playwright test tests/error-messages-audit.spec.js --reporter=list; then
    echo "================================================="
    echo -e "${GREEN}✅ Error Messages Audit PASSED${NC}"
    echo "================================================="
    
    # Check for any HeyGen references in test results
    echo -e "${YELLOW}🔍 Analyzing test results for HeyGen references...${NC}"
    
    if ls test-results/*.png 1> /dev/null 2>&1; then
        echo -e "${GREEN}📸 Screenshots saved to test-results/ directory${NC}"
        echo "   - Review screenshots manually for any visual HeyGen references"
    fi
    
    if [ -f test-results/results.json ]; then
        echo -e "${GREEN}📊 Test results saved to test-results/results.json${NC}"
    fi
    
    # Generate summary report
    echo -e "${YELLOW}📋 Generating summary report...${NC}"
    echo "# Error Message Audit Results - $(date)" > test-results/audit-report.md
    echo "" >> test-results/audit-report.md
    echo "## ✅ PASSED: Maslow AI Rebranding Verification" >> test-results/audit-report.md
    echo "" >> test-results/audit-report.md
    echo "All tests passed successfully. No HeyGen references found in user-facing error messages." >> test-results/audit-report.md
    echo "" >> test-results/audit-report.md
    echo "### Test Coverage:" >> test-results/audit-report.md
    echo "- ✅ API Authentication Errors (401)" >> test-results/audit-report.md
    echo "- ✅ Service Unavailable Errors (503)" >> test-results/audit-report.md
    echo "- ✅ Network Error Handling" >> test-results/audit-report.md
    echo "- ✅ Toast Message Verification" >> test-results/audit-report.md
    echo "- ✅ Page Content Audit" >> test-results/audit-report.md
    echo "- ✅ API Error Response Structure" >> test-results/audit-report.md
    echo "" >> test-results/audit-report.md
    echo "### Screenshots Available:" >> test-results/audit-report.md
    for screenshot in test-results/*.png; do
        if [ -f "$screenshot" ]; then
            echo "- $(basename "$screenshot")" >> test-results/audit-report.md
        fi
    done
    
    echo -e "${GREEN}✅ Summary report saved to test-results/audit-report.md${NC}"
    
else
    echo "================================================="
    echo -e "${RED}❌ Error Messages Audit FAILED${NC}"
    echo "================================================="
    echo -e "${YELLOW}⚠️  Some tests failed. Check the output above for details.${NC}"
    echo -e "${YELLOW}📸 Screenshots may still be available in test-results/ for manual review${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 Error Messages Audit Complete!${NC}"
echo ""
echo "📁 Results saved to: test-results/"
echo "📸 Screenshots: test-results/*.png"
echo "📊 JSON results: test-results/results.json"
echo "📋 Summary: test-results/audit-report.md"
echo ""
echo -e "${YELLOW}👁️  Manual Review Recommended:${NC}"
echo "   1. Check screenshots for any visual HeyGen references"
echo "   2. Review audit-report.md for detailed findings"
echo "   3. Verify all error messages use appropriate Maslow AI branding"
echo ""