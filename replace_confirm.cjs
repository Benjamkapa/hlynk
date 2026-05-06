const fs = require('fs');
const path = require('path');

function replaceConfirm(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let changed = false;

  // Add import if not present
  if (!content.includes('ConfirmModal')) {
    content = content.replace(/import.*?from 'lucide-react'/, "$&\nimport { ConfirmModal } from '../../components/shared/ConfirmModal'");
  }

  // Add state if not present
  if (!content.includes('confirmDeleteId')) {
    // find a good place for state, usually after queryClient
    content = content.replace(/(const queryClient = useQueryClient\(\))/, "$1\n  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)");
  }

  // Handle ProductsPage
  if (filePath.includes('ProductsPage.tsx')) {
    content = content.replace(/confirmDelete\((p\.id)\)/g, "setConfirmDeleteId($1)");
    content = content.replace(/const confirmDelete =.*?\}\n/gs, ""); // Remove old confirmDelete function
  }

  // Handle CustomersPage
  if (filePath.includes('CustomersPage.tsx')) {
    content = content.replace(/if \(window\.confirm\('Delete this customer\?'\)\) \{\s*deleteMutation\.mutate\(c\.id\)\s*\}/g, "setConfirmDeleteId(c.id)");
  }

  // Handle SalesHistoryPage
  if (filePath.includes('SalesHistoryPage.tsx')) {
    content = content.replace(/if \(window\.confirm\('Are you sure you want to void this sale\?'\)\) \{\s*voidMutation\.mutate\(s\.id\)\s*\}/g, "setConfirmDeleteId(s.id)");
  }

  // Handle SettingsPage
  if (filePath.includes('SettingsPage.tsx')) {
    // For deactivation
    content = content.replace(/if \(confirm\('Are you absolutely sure you want to deactivate your account\? This action cannot be undone\.'\)\) \{\s*deactivateMutation\.mutate\(\)\s*\}/g, "setConfirmDeleteId('deactivate')");
    // For staff deletion
    content = content.replace(/confirm\('Delete staff member\?'\) && deleteMutation\.mutate\(staff\.id\)/g, "setConfirmDeleteId(staff.id)");
    
    // Add ConfirmModal to SettingsPage at the end of return inside the main div
    if (!content.includes('title="Confirm Action"')) {
      content = content.replace(/<\/div>\s*\)\s*}\s*function InputGroup/g, `      <ConfirmModal\n        isOpen={!!confirmDeleteId}\n        title="Confirm Action"\n        message={confirmDeleteId === 'deactivate' ? "Are you sure you want to deactivate your account? This action cannot be undone." : "Are you sure you want to delete this staff member?"}\n        confirmText="Confirm"\n        onConfirm={() => {\n          if (confirmDeleteId === 'deactivate') deactivateMutation.mutate();\n          else if (confirmDeleteId) deleteMutation.mutate(confirmDeleteId);\n        }}\n        onCancel={() => setConfirmDeleteId(null)}\n      />\n    </div>\n  )\n}\n\nfunction InputGroup`);
    }
  }

  // Add ConfirmModal for Products, Customers, SalesHistory
  if (!filePath.includes('SettingsPage') && !content.includes('<ConfirmModal')) {
    const componentEndRegex = /<\/div>\s*\)\s*}\s*(?:function|export)/g;
    
    let deleteFn = 'deleteMutation';
    if (filePath.includes('SalesHistoryPage')) deleteFn = 'voidMutation';

    content = content.replace(componentEndRegex, (match) => {
      return `      <ConfirmModal\n        isOpen={!!confirmDeleteId}\n        title="Confirm Action"\n        message="Are you sure you want to proceed? This action cannot be undone."\n        confirmText="Confirm"\n        onConfirm={() => confirmDeleteId && ${deleteFn}.mutate(confirmDeleteId)}\n        onCancel={() => setConfirmDeleteId(null)}\n      />\n${match}`;
    });
  }

  fs.writeFileSync(filePath, content);
}

replaceConfirm('src/pages/provider/ProductsPage.tsx');
replaceConfirm('src/pages/provider/CustomersPage.tsx');
replaceConfirm('src/pages/provider/SalesHistoryPage.tsx');
replaceConfirm('src/pages/provider/SettingsPage.tsx');
