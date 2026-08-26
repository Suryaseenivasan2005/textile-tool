const fs = require('fs');
const path = require('path');

const controllersDir = path.join(__dirname, '..', 'backend', 'src', 'controllers');

const files = [
  'purchaseController.ts',
  'saleController.ts',
  'paymentController.ts',
  'returnController.ts'
];

files.forEach(file => {
  const filePath = path.join(controllersDir, file);
  if (!fs.existsSync(filePath)) {
    console.log(`Skipping ${file} - not found`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Add import if missing
  if (!content.includes('withDemoQuery')) {
    const importMatch = content.match(/import.*?from '\.\.\/validators\/.*?';/);
    if (importMatch) {
      content = content.replace(importMatch[0], `${importMatch[0]}\nimport { withDemoQuery, withDemoData } from '../utils/demo';`);
    } else {
      const typeImportMatch = content.match(/import {.*?}.*?from '\.\.\/types';/);
      if (typeImportMatch) {
        content = content.replace(typeImportMatch[0], `import { withDemoQuery, withDemoData } from '../utils/demo';\n${typeImportMatch[0]}`);
      }
    }
  }

  // Find operations
  content = content.replace(/\.find\(query\)/g, '.find(withDemoQuery(req, query))');
  content = content.replace(/\.find\(\{ vendor_id:/g, '.find(withDemoQuery(req, { vendor_id:');
  content = content.replace(/\.find\(\{ customer_id:/g, '.find(withDemoQuery(req, { customer_id:');
  content = content.replace(/\.find\(\{\s+reference_type/g, '.find(withDemoQuery(req, {\n      reference_type');
  content = content.replace(/\.find\(\{ purchase_id/g, '.find(withDemoQuery(req, { purchase_id');
  content = content.replace(/\.find\(\{ sale_id/g, '.find(withDemoQuery(req, { sale_id');
  content = content.replace(/\.find\(\{ return_id/g, '.find(withDemoQuery(req, { return_id');
  
  // FindOne operations
  content = content.replace(/\.findOne\(\{ _id:/g, '.findOne(withDemoQuery(req, { _id:');
  content = content.replace(/\.findOne\(\{ product_id:/g, '.findOne(withDemoQuery(req, { product_id:');
  content = content.replace(/\.findOne\(\{ invoice_no:/g, '.findOne(withDemoQuery(req, { invoice_no:');
  // close the brackets properly for findOne
  // This is tricky for regex if there are nested objects.
  // We can instead replace `.findOne(withDemoQuery(req, { _id: new ObjectId(id) }))` where possible, or just use a replace function.
  let findOneRegex = /\.findOne\(\{ (.*?)\}( \})?/g;
  
  // Since AST parsing is hard, let's use carefully crafted replace rules for .findOne:
  content = content.replace(/\.findOne\(\{ _id: new ObjectId\((.*?)\) \}\)/g, '.findOne(withDemoQuery(req, { _id: new ObjectId($1) }))');
  content = content.replace(/\.findOne\(\{ _id: item\.product_id \}\)/g, '.findOne(withDemoQuery(req, { _id: item.product_id }))');
  content = content.replace(/\.findOne\(\{ _id: purchase\.vendor_id \}\)/g, '.findOne(withDemoQuery(req, { _id: purchase.vendor_id }))');
  content = content.replace(/\.findOne\(\{ _id: sale\.customer_id \}\)/g, '.findOne(withDemoQuery(req, { _id: sale.customer_id }))');
  content = content.replace(/\.findOne\(\{ _id: ret\.customer_id \}\)/g, '.findOne(withDemoQuery(req, { _id: ret.customer_id }))');
  content = content.replace(/\.findOne\(\{ product_id: productId \}\)/g, '.findOne(withDemoQuery(req, { product_id: productId }))');
  
  // Insert operations
  content = content.replace(/\.insertOne\(purchaseDoc\)/g, '.insertOne(withDemoData(req, purchaseDoc))');
  content = content.replace(/\.insertOne\(saleDoc\)/g, '.insertOne(withDemoData(req, saleDoc))');
  content = content.replace(/\.insertOne\(returnDoc\)/g, '.insertOne(withDemoData(req, returnDoc))');
  content = content.replace(/\.insertOne\(\{\n\s+reference_type/g, '.insertOne(withDemoData(req, {\n    reference_type');
  content = content.replace(/\.insertOne\(\{\n\s+purchase_id/g, '.insertOne(withDemoData(req, {\n        purchase_id');
  content = content.replace(/\.insertOne\(\{\n\s+sale_id/g, '.insertOne(withDemoData(req, {\n        sale_id');
  content = content.replace(/\.insertOne\(\{\n\s+return_id/g, '.insertOne(withDemoData(req, {\n        return_id');
  // for the multi-line inserts, we need to make sure we close the bracket correctly.
  // Actually, for purchaseItemsCollection.insertOne({ ... }), it ends with `      });`
  content = content.replace(/      \}\);(\n\n\s+\/\/ Update inventory)/g, '      }));$1');
  
  // Update operations
  content = content.replace(/\.updateOne\(\n\s+\{ _id: new ObjectId\((.*?)\) \}/g, '.updateOne(\n    withDemoQuery(req, { _id: new ObjectId($1) })');
  content = content.replace(/\.updateOne\(\n\s+\{ product_id: productId \}/g, '.updateOne(\n        withDemoQuery(req, { product_id: productId })');

  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`Updated ${file}`);
});
