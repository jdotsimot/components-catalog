import React, { useMemo } from 'react';
import { Layers, ChevronDown, RotateCcw } from 'lucide-react';

const Sidebar = ({
    manufacturers,
    itemTypes,
    filteredParts,
    selectedMan,
    setSelectedMan,
    selectedType,
    setSelectedType,
    selectedSize,
    setSelectedSize,
    onReset
}) => {

    const availableSizes = useMemo(() => {
        const sizes = new Set(filteredParts.map(p => p.nominal_size));
        return Array.from(sizes).sort();
    }, [filteredParts]);

    return (
        <div className="w-80 h-screen bg-slate-950 border-r border-slate-900 flex flex-col p-6 flex-shrink-0 relative z-20">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                    <Layers className="w-6 h-6 text-cyan-400" />
                    Components Catalog
                </h1>
            </div>

            <div className="space-y-6">
                {/* Reset Button */}
                <button
                    onClick={onReset}
                    className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white py-3 rounded-xl border border-slate-800 transition-all font-medium text-sm group"
                >
                    <RotateCcw className="w-4 h-4 group-hover:-rotate-180 transition-transform duration-500" />
                    Start Over
                </button>

                <div className="h-px bg-slate-900 my-4"></div>

                {/* Manufacturer Dropdown */}
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Manufacturer</label>
                    <div className="relative">
                        <select
                            value={selectedMan || ''}
                            onChange={(e) => setSelectedMan(e.target.value || null)}
                            className="w-full appearance-none bg-slate-900 border border-slate-800 text-slate-200 text-sm rounded-lg px-4 py-3 pr-8 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all hover:bg-slate-800 cursor-pointer"
                        >
                            <option value="">All Manufacturers</option>
                            {manufacturers.map(man => (
                                <option key={man} value={man}>{man}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                    </div>
                </div>

                {/* Component Type Dropdown */}
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Component Type</label>
                    <div className="relative">
                        <select
                            value={selectedType || ''}
                            onChange={(e) => setSelectedType(e.target.value || null)}
                            className="w-full appearance-none bg-slate-900 border border-slate-800 text-slate-200 text-sm rounded-lg px-4 py-3 pr-8 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all hover:bg-slate-800 cursor-pointer"
                        >
                            <option value="">All Types</option>
                            {itemTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                    </div>
                </div>

                {/* Size Dropdown */}
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Nominal Size</label>
                    <div className="relative">
                        <select
                            value={selectedSize || ''}
                            onChange={(e) => setSelectedSize(e.target.value || null)}
                            className="w-full appearance-none bg-slate-900 border border-slate-800 text-slate-200 text-sm rounded-lg px-4 py-3 pr-8 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all hover:bg-slate-800 cursor-pointer"
                        >
                            <option value="">All Sizes</option>
                            {availableSizes.map(size => (
                                <option key={size} value={size}>{size}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                    </div>
                </div>
            </div>

            <div className="mt-auto pt-6 border-t border-slate-900">
                <p className="text-xs text-slate-600 text-center">
                    SCT CAM Tools v1.2
                </p>
            </div>
        </div>
    );
};

export default Sidebar;
