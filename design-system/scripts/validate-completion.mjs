import path from 'node:path';
import completionAudit from './completion-audit.cjs';

export const { auditDesignSystem } = completionAudit;

function main() {
const violations = auditDesignSystem(process.cwd(), {
  requireApprovals: !process.argv.includes('--allow-pending-approvals'),
});
  if (violations.length > 0) {
    console.error(`Design-system completion audit failed with ${violations.length} violation(s):`);
    for (const violation of violations) console.error(` - ${violation}`);
    process.exitCode = 1;
    return;
  }
  console.log('Design-system completion audit passed.');
}

if (path.extname(process.argv[1]) === '.mjs') main();
