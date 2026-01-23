import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { formatDimension, padNumber } from '../utils/units';

const CamBar = ({ part, unit = 'in' }) => {
    const [copied, setCopied] = useState(false);

    if (!part) return null;

    // Determine Source Unit for Conversion
    const isMetricSource = part.manufacturer === 'Steinel' || part.manufacturer === 'MDL-Metric';
    const sourceUnit = isMetricSource ? 'mm' : 'in';
    const conv = (val) => formatDimension(val, sourceUnit, unit);

    // Formatting Logic - Show full bore range (SCT if available, else catalog)
    const getBoreString = () => {
        const sct = part.boring_specs?.sct_bore || part.boring_specs?.punch_holder_bushing_bore_sct;
        const cat = part.boring_specs?.catalog_bore || part.boring_specs?.punch_holder_bushing_bore_catalog || part.boring_specs?.catalog_bore_mm;
        const target = sct || cat;

        if (!target) return '';

        // Convert and pad the range values
        const min = padNumber(conv(target.min), unit);
        const max = padNumber(conv(target.max), unit);

        return `Bore ${min}-${max}`;
    };

    const getClampString = () => {
        if (!part.clamping || part.clamping === 'N/A' || part.clamping === 'None (Press Fit)' || typeof part.clamping === 'string') return '';

        const c = part.clamping;
        const bcRaw = c.bolt_circle_diameter || c.bolt_circle || c.bolt_circle_mm;
        const bcDisp = padNumber(conv(bcRaw), unit);

        return `| ${c.quantity}x ${c.screw_size} on ${bcDisp} BC`;
    };

    const baseString = `${part.part_number_series.replace('XX', '')} | ${part.component_type} | ${getBoreString()} ${getClampString()}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(baseString);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex items-center gap-0 bg-slate-800 rounded-full p-2 pl-6 shadow-2xl border border-slate-700/50 backdrop-blur-xl">
            <span className="font-mono text-sm text-slate-300 mr-4 tracking-tight select-all">
                {baseString}
            </span>
            <button
                onClick={handleCopy}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold transition-all text-sm ${copied
                        ? 'bg-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.4)]'
                        : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400 hover:shadow-[0_0_15px_rgba(34,211,238,0.4)]'
                    }`}
            >
                {copied ? (
                    <>
                        <Check className="w-4 h-4" /> COPIED
                    </>
                ) : (
                    <>
                        <Copy className="w-4 h-4" /> COPY
                    </>
                )}
            </button>
        </div>
    );
};

export default CamBar;
