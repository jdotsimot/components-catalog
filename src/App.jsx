import React, { useState, useMemo, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import PartDisplay from './components/PartDisplay';
import CamBar from './components/CamBar';
import masterCatalog from './data/full_catalog.json';
import { Search, X, LayoutGrid } from 'lucide-react';

function App() {
  const [selectedMan, setSelectedMan] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPart, setSelectedPart] = useState(null);
  const [unit, setUnit] = useState('in');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Extract unique values for filters
  const manufacturers = useMemo(() => [...new Set(masterCatalog.map(p => p.manufacturer))], []);
  const itemTypes = useMemo(() => [...new Set(masterCatalog.map(p => p.component_type))], []);

  // Filter Data
  const filteredParts = useMemo(() => {
    return masterCatalog.filter(part => {
      const matchMan = selectedMan ? part.manufacturer === selectedMan : true;
      const matchType = selectedType ? part.component_type === selectedType : true;
      const matchSize = selectedSize ? part.nominal_size === selectedSize : true;
      const matchSearch = searchQuery
        ? part.part_number_series.toLowerCase().includes(searchQuery.toLowerCase()) ||
        part.description.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      return matchMan && matchType && matchSize && matchSearch;
    });
  }, [selectedMan, selectedType, selectedSize, searchQuery]);

  // Handle Search Selection
  const handleSelectPart = (part) => {
    setSelectedPart(part);
    setSearchQuery('');
    setIsSearchFocused(false);
  };

  // Reset Function
  const handleReset = () => {
    setSelectedMan(null);
    setSelectedType(null);
    setSelectedSize(null);
    setSearchQuery('');
    setSelectedPart(null);
    // keep unit preference
  };

  // Check if any filter is active
  const isFiltering = selectedMan || selectedType || selectedSize || searchQuery;

  // Escape key to go back from part detail view
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && selectedPart) {
        setSelectedPart(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPart]);

  // Limit search dropdown results
  const MAX_SEARCH_RESULTS = 25;
  const displayedResults = filteredParts.slice(0, MAX_SEARCH_RESULTS);
  const hasMoreResults = filteredParts.length > MAX_SEARCH_RESULTS;

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans selection:bg-cyan-500/30">

      {/* Sidebar - Filters */}
      <Sidebar
        manufacturers={manufacturers}
        itemTypes={itemTypes}
        filteredParts={masterCatalog}
        selectedMan={selectedMan}
        setSelectedMan={setSelectedMan}
        selectedType={selectedType}
        setSelectedType={setSelectedType}
        selectedSize={selectedSize}
        setSelectedSize={setSelectedSize}
        onReset={handleReset}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">

        {/* Header: Search + Unit Toggle */}
        <div className="p-6 pb-2 border-b border-transparent z-30 flex-shrink-0 relative flex items-center gap-4">

          {/* Search Bar - Centered Max Width */}
          <div className="flex-1 max-w-2xl mx-auto relative group">
            <Search className={`absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${isSearchFocused ? 'text-cyan-400' : 'text-slate-500'}`} />

            <input
              type="text"
              placeholder="Search by Part Number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              className={`w-full bg-slate-900 border text-white rounded-2xl py-4 pl-12 pr-10 text-lg transition-all shadow-inner ${isSearchFocused ? 'border-cyan-500/50 ring-1 ring-cyan-500/50 bg-slate-800' : 'border-slate-800'}`}
            />

            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Dynamic Results Dropdown */}
            {isSearchFocused && searchQuery && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-h-96 overflow-y-auto z-50 divide-y divide-slate-800">
                {filteredParts.length > 0 ? (
                  <>
                    {displayedResults.map((part, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSelectPart(part)}
                        className="w-full text-left px-6 py-4 hover:bg-slate-800 transition-colors flex items-center justify-between group"
                      >
                        <div>
                          <div className="font-bold text-slate-200 group-hover:text-cyan-400">{part.part_number_series}</div>
                          <div className="text-xs text-slate-500">{part.description}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-bold text-slate-400 uppercase">{part.manufacturer}</div>
                          <div className="text-xs text-slate-600">{part.nominal_size}</div>
                        </div>
                      </button>
                    ))}
                    {hasMoreResults && (
                      <div className="px-6 py-3 text-center text-slate-500 text-sm bg-slate-800/50">
                        ...and {filteredParts.length - MAX_SEARCH_RESULTS} more results. Refine your search.
                      </div>
                    )}
                  </>
                ) : (
                  <div className="p-6 text-center text-slate-500">
                    No components found.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Unit Toggle - Top Right */}
          <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-800 absolute right-6">
            <button
              onClick={() => setUnit('in')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${unit === 'in' ? 'bg-cyan-500 text-slate-950 shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              IN
            </button>
            <button
              onClick={() => setUnit('mm')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${unit === 'mm' ? 'bg-cyan-500 text-slate-950 shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              MM
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto relative scroll-smooth">
          {/* Background Texture */}
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-b from-cyan-500/5 to-transparent rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/2"></div>

          {!selectedPart ? (
            <div className="p-10 max-w-7xl mx-auto min-h-full flex flex-col">

              {/* Landing State: Shows only if NOT filtering and no search query */}
              {!isFiltering ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center opacity-60 pb-20">
                  <div className="w-24 h-24 bg-slate-900 rounded-full flex items-center justify-center mb-6 shadow-2xl border border-slate-800">
                    <LayoutGrid className="w-10 h-10 text-cyan-500" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Welcome to Components Catalog</h2>
                  <p className="text-slate-400 max-w-md">
                    Select a manufacturer on the left or search for a part number above to get started.
                  </p>
                </div>
              ) : (
                /* Filter Results Grid */
                <>
                  <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">
                      {filteredParts.length} Results
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredParts.length > 0 ? filteredParts.map((part, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedPart(part)}
                        className="bg-slate-900 border border-slate-800 p-6 rounded-2xl hover:border-cyan-500/50 hover:bg-slate-800 transition-all text-left group relative overflow-hidden"
                      >
                        <div className="absolute top-0 left-0 w-1 h-full bg-slate-800 group-hover:bg-cyan-500 transition-colors"></div>
                        <h3 className="font-bold text-lg text-slate-200 group-hover:text-cyan-400 mb-1">{part.part_number_series.replace('XX', '')}</h3>
                        <p className="text-xs text-slate-500 uppercase tracking-widest">{part.manufacturer}</p>
                        <div className="mt-4 pt-4 border-t border-slate-800/50 flex justify-between items-end">
                          <span className="text-xs text-slate-400 truncate pr-2">{part.component_type}</span>
                          <span className="font-mono text-xs font-bold text-slate-300">{part.nominal_size}</span>
                        </div>
                      </button>
                    )) : (
                      <div className="col-span-full text-center text-slate-600 py-20 bg-slate-900/50 rounded-2xl border border-dashed border-slate-800">
                        <p className="mb-2">No components match your filters.</p>
                        <button onClick={handleReset} className="text-cyan-400 hover:text-cyan-300 font-bold text-sm">Clear Filters</button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ) : (
            <PartDisplay part={selectedPart} unit={unit} onBack={() => setSelectedPart(null)} />
          )}
        </div>

        {/* Floating Cam Bar - Centered */}
        <div className="absolute bottom-6 left-0 right-0 flex justify-center pointer-events-none">
          <div className="pointer-events-auto">
            <CamBar part={selectedPart} unit={unit} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
