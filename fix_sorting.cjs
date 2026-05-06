const fs = require('fs');

function addSorting(filePath, queryKey, validFieldsMap) {
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // 1. Add state hooks
  if (!content.includes('const [sortBy, setSortBy]')) {
    content = content.replace(/const \[page, setPage\] = useState\(1\)/g, `const [page, setPage] = useState(1)\n  const [sortBy, setSortBy] = useState('createdAt')\n  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')`);
  }

  // 2. Update queryKey and queryFn
  const queryRegex = new RegExp(`queryKey:\\s*\\['${queryKey}',\\s*([^]+?)\\],\\s*queryFn:\\s*\\(\\)\\s*=>\\s*([^\\.]+)\\.list\\(\\{\\s*([^\\}]+)\\s*\\}\\)`, 'g');
  content = content.replace(queryRegex, (match, deps, apiName, args) => {
    let newDeps = deps;
    if (!newDeps.includes('sortBy')) {
      newDeps += ', sortBy, sortOrder';
    }
    let newArgs = args;
    if (!newArgs.includes('limit: 10')) {
      newArgs += ', limit: 10';
    }
    if (!newArgs.includes('sortBy')) {
      newArgs += ', sortBy, sortOrder';
    }
    return `queryKey: ['${queryKey}', ${newDeps}],\n    queryFn: () => ${apiName}.list({ ${newArgs} })`;
  });

  // 3. Update table headers
  Object.keys(validFieldsMap).forEach(label => {
    const field = validFieldsMap[label];
    const thRegex = new RegExp(`<th className="([^"]+)">${label}<\\/th>`, 'g');
    content = content.replace(thRegex, `<th className="$1 cursor-pointer hover:text-emerald-600" onClick={() => { setSortBy('${field}'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc') }}>${label} {sortBy === '${field}' && (sortOrder === 'asc' ? '↑' : '↓')}</th>`);
  });

  fs.writeFileSync(filePath, content);
}

// SalesHistoryPage
addSorting('src/pages/provider/SalesHistoryPage.tsx', 'sales', {
  'Date': 'createdAt',
  'Customer': 'customerName',
  'Method': 'paymentMethod',
  'Amount': 'totalAmount',
  'Status': 'status'
});

// CustomersPage
addSorting('src/pages/provider/CustomersPage.tsx', 'customers', {
  'Customer': 'name',
  'Phone': 'phone',
  'Email': 'email',
  'Joined': 'createdAt'
});

// ExpensesPage
addSorting('src/pages/provider/ExpensesPage.tsx', 'expenses', {
  'Date': 'date',
  'Category': 'category',
  'Description': 'description',
  'Amount': 'amount'
});
