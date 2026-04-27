import React, { useState, useEffect } from 'react';
import { Ruler, ArrowRightLeft, CircleDot, ArrowLeft, Search } from 'lucide-react';
import { formatDimension, padNumber } from '../utils/units';
import masterCatalog from '../data/full_catalog.json';

const PartDisplay = ({ part, unit, onBack, setSelectedPart }) => {
    const [showAlternatives, setShowAlternatives] = useState(false);
    const [alternatives, setAlternatives] = useState([]);

    if (!part) return (
        <div className="flex flex-col items-center justify-center h-full text-slate-600 animate-in fade-in duration-500">
            <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center mb-4">
                <Ruler className="w-8 h-8 opacity-20" />
            </div>
            <p className="text-lg font-medium">Select a component to view details</p>
            <p className="text-sm opacity-50 mt-2">Use search or filters to begin</p>
        </div>
    );

    // Reset alternatives when part changes
    useEffect(() => {
        setShowAlternatives(false);
        setAlternatives([]);
    }, [part]);

    const hasSctOverride = part.boring_specs?.sct_bore || part.boring_specs?.punch_holder_bushing_bore_sct;

    const getFunctionalType = (type) => {
        const t = type.toLowerCase();
        let normalized = "";

        // Determine Base Type
        if (t.includes("pin") || t.includes("post")) normalized += "pin_";
        else if (t.includes("bushing") || t.includes("bearing") || t.includes("sleeve")) normalized += "bushing_";
        else return t; // fallback

        // Determine Fit Type
        if (t.includes("demountable") || t.includes("removable")) normalized += "demountable_";
        else if (t.includes("press fit") || t.includes("straight") || t.includes("tap fit")) normalized += "pressfit_";

        // Determine Precision / Feature
        if (t.includes("ball bearing") || t.includes("maxicage")) normalized += "ballbearing";
        else normalized += "plain";

        return normalized;
    };

    const findAlternatives = () => {
        const currentFunctionalType = getFunctionalType(part.component_type);

        const results = masterCatalog.filter(candidate => {
            // Must be a different manufacturer
            if (candidate.manufacturer === part.manufacturer) return false;

            // Must match major dimensions (Size and Length)
            if (candidate.nominal_size !== part.nominal_size) return false;
            if (candidate.specific_length !== part.specific_length) return false;

            // Functional Component Type Match (ignore minor naming differences)
            const candidateFunctionalType = getFunctionalType(candidate.component_type);
            if (currentFunctionalType !== candidateFunctionalType) return false;

            return true;
        });

        setAlternatives(results);
        setShowAlternatives(true);
    };

    // Determine Source Unit
    const isMetricSource = part.manufacturer === 'Steinel' || part.manufacturer === 'MDL-Metric'; // Logic can be improved with metadata
    const sourceUnit = isMetricSource ? 'mm' : 'in';

    // Helper to convert ranges
    const conv = (val) => formatDimension(val, sourceUnit, unit);

    // Normalize bore data for display
    const catalogBoreRaw = part.boring_specs?.catalog_bore || part.boring_specs?.punch_holder_bushing_bore_catalog || part.boring_specs?.catalog_bore_mm;
    const sctBoreRaw = part.boring_specs?.sct_bore || part.boring_specs?.punch_holder_bushing_bore_sct;
    const mountDiaRaw = part.boring_specs?.nominal_mounting_dia || part.boring_specs?.nominal_mount_dia_mm;

    // Converted Values
    const catalogBore = catalogBoreRaw ? { min: conv(catalogBoreRaw.min), max: conv(catalogBoreRaw.max) } : null;
    const sctBore = sctBoreRaw ? { min: conv(sctBoreRaw.min), max: conv(sctBoreRaw.max), note: sctBoreRaw.note } : null;
    const mountDia = conv(mountDiaRaw);

    // Clamping Display Helper
    const renderClamping = () => {
        if (!part.clamping || part.clamping === 'N/A' || part.clamping === 'None (Press Fit)' || part.clamping === 'None (Straight)') {
            return <span className="text-slate-500 italic">No clamps required</span>;
        }

        // Check if clamping is an object
        if (typeof part.clamping === 'object') {
            const info = part.clamping;

            // Handle BC conversion if necessary (BC is usually specific to the unit system of the catalog)
            // But we should display it relative to user pref if possible, OR keep it strict.
            // For safety, let's keep clamp hardware NATIVE to the component to avoid finding non-existent screws.
            // But Bolt Circle Diameter can be converted.

            const bcRaw = info.bolt_circle_diameter || info.bolt_circle || info.bolt_circle_mm;
            const bcDisp = conv(bcRaw);

            return (
                <div className="flex items-center gap-6 text-sm">
                    <div className="flex flex-col">
                        <span className="text-slate-400 text-xs uppercase tracking-wider mb-1">Clamp Type</span>
                        <span className="text-slate-200 font-medium bg-slate-900 px-3 py-1 rounded border border-slate-800">{info.clamp_type || 'Standard'}</span>
                    </div>
                    {bcDisp && (
                        <div className="flex flex-col">
                            <span className="text-slate-400 text-xs uppercase tracking-wider mb-1">Bolt Circle</span>
                            <span className="text-cyan-400 font-bold font-mono text-lg">{bcDisp}<span className="text-xs ml-0.5 text-slate-500">{unit}</span></span>
                        </div>
                    )}
                    <div className="flex flex-col">
                        <span className="text-slate-400 text-xs uppercase tracking-wider mb-1">Screws</span>
                        <span className="text-slate-200">{info.quantity}x {info.screw_size}</span>
                    </div>
                </div>
            );
        }
        return <span className="text-slate-300">{part.clamping}</span>;
    };

    // Format nominal size with proper padding
    const nominalSizeDisplay = padNumber(parseFloat(part.nominal_size) || part.nominal_size, unit);

    return (
        <div className={`flex flex-col h-full max-w-5xl mx-auto w-full pt-6 pb-24`}>
            {/* Back Button */}
            {onBack && (
                <div className="px-8 mb-4">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-slate-500 hover:text-cyan-400 transition-colors text-sm group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Results
                    </button>
                </div>
            )}

            {/* Header Section */}
            <div className="px-8 pb-8">
                <div className="flex items-start justify-between">
                    <div>
                        <h4 className="text-cyan-400 text-sm font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                            <div className="w-1 h-4 bg-cyan-400 rounded-full"></div>
                            {part.manufacturer}
                        </h4>
                        <h2 className="text-5xl font-bold text-white mb-3 tracking-tight">{part.part_number_series.replace('XX', '')} <span className="opacity-40 text-3xl font-light">Series</span></h2>
                        <p className="text-slate-400 text-xl font-light">{part.description}</p>
                        <button
                            onClick={findAlternatives}
                            className="mt-4 flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 px-4 py-2 rounded-lg transition-colors text-sm font-bold"
                        >
                            <Search className="w-4 h-4" /> Find Alternatives
                        </button>
                    </div>

                    <div className="bg-slate-900 px-6 py-4 rounded-2xl border border-slate-800 shadow-xl group hover:border-slate-700 transition-colors">
                        <span className="text-xs text-slate-500 block uppercase tracking-wider mb-1">Nominal Size</span>
                        <span className="text-2xl font-bold text-white font-mono">{nominalSizeDisplay || part.nominal_size}</span>
                    </div>
                </div>
            </div>

            <div className="px-8 space-y-12">
                {/* Alternatives Section */}
                {showAlternatives && (
                    <div className="p-6 rounded-3xl bg-slate-800/30 border border-slate-700">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <ArrowRightLeft className="w-5 h-5 text-cyan-400" /> Interchangeable Parts
                        </h3>
                        {alternatives.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {alternatives.map((alt, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedPart(alt)}
                                        className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col justify-between hover:border-cyan-500/50 hover:bg-slate-800 transition-all text-left text-inherit group"
                                    >
                                        <div className="text-sm text-slate-400 uppercase tracking-wider mb-1 group-hover:text-slate-300 transition-colors">{alt.manufacturer}</div>
                                        <div className="text-lg font-bold text-cyan-400 mb-1 group-hover:text-cyan-300 transition-colors">{alt.part_number_series.replace('XX', '')}</div>
                                        <div className="text-xs text-slate-500 line-clamp-1 group-hover:text-slate-400 transition-colors">{alt.description}</div>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <p className="text-slate-400 italic">No exact cross-reference found.</p>
                        )}
                    </div>
                )}
                {/* Dimensions Row if needed */}
                {mountDia && (
                    <div className="flex gap-4">
                        <div className="inline-flex items-center gap-3 bg-slate-900/50 px-4 py-2 rounded-lg border border-slate-800 text-slate-400 text-sm">
                            <CircleDot className="w-4 h-4" />
                            <span>Mounting Dia (OD): <span className="text-white font-mono font-bold ml-2">{mountDia}<span className="text-xs ml-0.5 text-slate-500">{unit}</span></span></span>
                        </div>
                    </div>
                )}

                {/* Bore Specifications Logic */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

                    {/* 1. Catalog Spec */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold text-yellow-500 uppercase tracking-widest flex items-center gap-2 border border-yellow-500/20 bg-yellow-500/10 px-3 py-1.5 rounded-full w-fit">
                            <Ruler className="w-3 h-3" /> Catalog Boring Specifications
                        </h3>
                        <div className="p-6 rounded-3xl bg-slate-800/50 border border-slate-700 backdrop-blur-sm">
                            <div className="flex justify-between items-center mb-4 opacity-50">
                                <span className="text-sm font-medium text-slate-300 uppercase tracking-wider">Catalog Spec</span>
                                {part.boring_specs?.catalog_bore_iso && <span className="text-xs bg-slate-700 px-2 py-1 rounded text-slate-300">{part.boring_specs.catalog_bore_iso}</span>}
                            </div>
                            <div className="text-4xl font-mono text-slate-200 tracking-tight">
                                {catalogBore?.min} <span className="text-slate-600 mx-2 font-thin">to</span> {catalogBore?.max} <span className="text-base text-slate-600 ml-1">{unit}</span>
                            </div>
                            <div className="mt-4 text-xs text-slate-500 italic">Standard manufacturer fit</div>
                        </div>
                    </div>

                    {/* 2. SCT Override Spec */}
                    <div className="space-y-4 mt-6 lg:mt-0">
                        {/* Added margin top on mobile stack, removed on large screens */}
                        {hasSctOverride ? (
                            <>
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2 border border-cyan-500/20 bg-cyan-500/10 px-3 py-1.5 rounded-full w-fit shadow-[0_0_10px_rgba(34,211,238,0.2)]">
                                        <ArrowRightLeft className="w-3 h-3" /> SCT Adjusted Specifications
                                    </h3>
                                </div>

                                <div className="relative p-1 rounded-3xl bg-gradient-to-br from-cyan-500 to-cyan-900 shadow-[0_0_40px_rgba(34,211,238,0.15)] group">
                                    <div className="bg-slate-950 rounded-[22px] p-6 h-full relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

                                        <div className="flex justify-between items-center mb-4">
                                            <span className="text-sm font-bold text-cyan-500 uppercase tracking-wider flex items-center gap-2">
                                                Program This Bore
                                            </span>
                                        </div>
                                        <div className="text-5xl font-mono text-white tracking-tight flex items-center gap-3 relative z-10">
                                            {sctBore?.min} <span className="text-slate-700 font-thin text-3xl">-</span> {sctBore?.max} <span className="text-lg text-cyan-500/50">{unit}</span>
                                        </div>
                                        <div className="mt-4 text-xs text-cyan-200/50 border-t border-cyan-900/30 pt-3 flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full"></div>
                                            {sctBore?.note}
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="h-full flex flex-col justify-end opacity-30 mt-10">
                                <div className="p-6 rounded-3xl border border-dashed border-slate-700 text-center">
                                    <p className="text-sm text-slate-400">No SCT Adjustment Required</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Clamping Section - Centered Card */}
                <div className="flex justify-center pt-4">
                    <div className="p-6 rounded-2xl bg-slate-900/60 border border-fuchsia-500/30 shadow-lg min-w-[320px]">
                        <h3 className="text-xs font-bold text-fuchsia-400 uppercase tracking-widest mb-4 text-center">Mounting & Clamping</h3>
                        <div className="flex justify-center">
                            {renderClamping()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PartDisplay;
