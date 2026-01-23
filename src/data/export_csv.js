import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Simulate __dirname in ESM
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load Full Catalog
const catalogPath = path.join(__dirname, 'full_catalog.json');
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

// Define CSV Columns (Flattened)
const headers = [
    'manufacturer',
    'catalog',
    'component_type',
    'part_number_series',
    'nominal_size',
    'description',
    'specific_length',
    'catalog_bore_min',
    'catalog_bore_max',
    'sct_bore_min',
    'sct_bore_max',
    'sct_bore_note',
    'clamping_type',
    'clamping_quantity',
    'clamping_screw_size',
    'clamping_bolt_circle'
];

// Helper to escape CSV fields
const escape = (val) => {
    if (val === undefined || val === null) return '';
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
};

// Map JSON items to Rows
const rows = catalog.map(item => {
    // Flatten Boring Specs
    const catBore = item.boring_specs?.catalog_bore || item.boring_specs?.catalog_bore_mm || {};
    const sctBore = item.boring_specs?.sct_bore || item.boring_specs?.punch_holder_bushing_bore_sct || {};

    // Flatten Clamping
    let cType = 'N/A', cQty = '', cScrew = '', cBC = '';
    if (typeof item.clamping === 'object') {
        cType = item.clamping.clamp_type || '';
        cQty = item.clamping.quantity || '';
        cScrew = item.clamping.screw_size || '';
        cBC = item.clamping.bolt_circle_diameter || item.clamping.bolt_circle || item.clamping.bolt_circle_mm || '';
    } else if (item.clamping) {
        cType = item.clamping;
    }

    return [
        item.manufacturer,
        item.catalog,
        item.component_type,
        item.part_number_series,
        item.nominal_size,
        item.description,
        item.specific_length,
        catBore.min,
        catBore.max,
        sctBore.min,
        sctBore.max,
        sctBore.note,
        cType,
        cQty,
        cScrew,
        cBC
    ].map(escape).join(',');
});

// Write CSV
const csvContent = headers.join(',') + '\n' + rows.join('\n');
const outputPath = path.join(__dirname, 'catalog_template.csv');
fs.writeFileSync(outputPath, csvContent);

console.log(`Exported ${rows.length} rows to ${outputPath}`);
