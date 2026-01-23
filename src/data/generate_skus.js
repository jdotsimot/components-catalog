import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Simulate __dirname in ESM
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load Master Catalog
const masterPath = path.join(__dirname, 'master_catalog.json');
const masterCatalog = JSON.parse(fs.readFileSync(masterPath, 'utf8'));

const generatedCatalog = [];

// Helper: Format number with padding
const pad = (num, size) => {
    let s = String(num);
    while (s.length < size) s = "0" + s;
    return s;
};

// --- Generation Logic ---

masterCatalog.forEach(series => {
    const { manufacturer, component_type, part_number_series, nominal_size, description } = series;

    // 1. DANLY GENERATION
    if (manufacturer === 'Danly' && component_type.includes('Guide Post')) {
        // Series format: 5-08XX (1 inch)
        // Logic: Length in 1/4 inches. Range 4" (16) to 14" (56).
        const seriesPrefix = part_number_series.replace('XX', ''); // e.g., "5-08"

        // Generate lengths from 3.0" to 14.0" in 0.25" increments
        // Code = Length * 4
        // Example: 4.25" * 4 = 17. Code "17". Part "5-0817".

        for (let len = 3.0; len <= 14.0; len += 0.25) {
            const lengthCode = Math.round(len * 4);
            const partNo = `${seriesPrefix}${pad(lengthCode, 2)}`;

            generatedCatalog.push({
                ...series,
                part_number_series: partNo, // Overwrite series with specific Part No
                description: `${description} - ${len}" Length`, // Append Length
                nominal_size: nominal_size, // Keep nominal
                specific_length: len, // New metadata
            });
        }
    }

    // 2. SUPERIOR GENERATION
    else if (manufacturer === 'Superior' && component_type.includes('Pin')) {
        // Similar logic: 322 (1 inch). 
        // Need to know Series Prefix for lengths. 
        // Assumption: Single item in master is the base.
        // Let's generate a few standard lengths: 4, 5, 6, 7, 8

        const basePart = part_number_series; // e.g. "322"
        const lengthSteps = [4, 4.5, 5, 5.5, 6, 6.5, 7, 8, 9, 10];

        lengthSteps.forEach(len => {
            // Superior Logic for 322 series (1 inch): 322-10XX? 
            // Without exact prefix map, we append somewhat generically or skip if unsure.
            // Based on screenshots: 332-1017. 
            // Let's assume the Master Catalog entry needs to be richer to support this.
            // For now, we replicate the entry as-is unless we have the prefix code.
        });
        generatedCatalog.push(series); // Push original if no expansion logic known yet
    }

    // 3. ANCHOR GENERATION
    else if (manufacturer === 'Anchor Lamina' && part_number_series.startsWith('TPC')) {
        // Explicit: TPC-[Nominal]-X-[Length]
        // e.g. TPC-750-X-4
        const base = part_number_series.split('-X-')[0] || 'TPC-1000'; // Fallback

        const lengths = [4, 4.5, 5, 5.5, 6, 7, 8, 10, 12];
        lengths.forEach(len => {
            const partNo = `${base}-X-${len}`;
            generatedCatalog.push({
                ...series,
                part_number_series: partNo,
                description: `${description} - ${len}" Length`,
                specific_length: len
            });
        });
    }

    // 4. STEINEL GENERATION (Metric)
    else if (manufacturer === 'Steinel' && component_type.includes('Pillar')) {
        // ST 7105 Series
        // Generate lengths: 100, 120, 140, 160, 200 mm
        const lengths = [100, 120, 130, 140, 160, 180, 200, 240];

        lengths.forEach(len => {
            // Part No: ST7105-[Dia]-[Length]? 
            // Often ST 7105.25.160
            // We'll approximate syntax: ST 7105 [Dia]x[Length]
            const diaCode = nominal_size.replace(/[^\d]/g, ''); // 25
            const partNo = `${part_number_series.replace(' Series', '')}.${diaCode}.${len}`;

            generatedCatalog.push({
                ...series,
                part_number_series: partNo,
                description: `${description} - ${len}mm Length`,
                nominal_size: nominal_size,
                specific_length: `${len}mm`
            });
        });
    }

    // DEFAULT: Pass through bushings (usually fixed length per ID)
    else {
        generatedCatalog.push(series);
    }
});

// Output
const outputPath = path.join(__dirname, 'full_catalog.json');
fs.writeFileSync(outputPath, JSON.stringify(generatedCatalog, null, 2));

console.log(`Generated ${generatedCatalog.length} SKUs from ${masterCatalog.length} series definitions.`);
