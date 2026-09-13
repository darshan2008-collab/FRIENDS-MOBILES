const { execSync } = require('child_process');

try {
  execSync('git add -A', { stdio: 'inherit' });
  execSync('git commit -m "feat: admin order excel export, remove user order excel, enforce free shipping above 1000, COD above 300, and expand coupon redeem codes"', { stdio: 'inherit' });
  console.log('Committed successfully.');
  execSync('git push origin main', { stdio: 'inherit' });
  console.log('Pushed to origin main successfully.');
} catch (err) {
  console.error('Git error:', err.message);
  process.exit(1);
}
