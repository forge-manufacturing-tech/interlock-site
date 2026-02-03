import React from 'react';

interface MetadataEditorProps {
    metadata: any;
    onChange: (newMetadata: any) => void;
    readOnly?: boolean;
}

export function MetadataEditor({ metadata, onChange, readOnly = false }: MetadataEditorProps) {

    if (!metadata) return <div className="text-industrial-steel-500 font-mono text-xs">No Metadata Loaded</div>;

    const updateField = (path: string[], value: any) => {
        if (readOnly) return;
        const newMeta = JSON.parse(JSON.stringify(metadata));
        let current = newMeta;
        for (let i = 0; i < path.length - 1; i++) {
            if (!current[path[i]]) current[path[i]] = {};
            current = current[path[i]];
        }
        current[path[path.length - 1]] = value;
        onChange(newMeta);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">

            {/* Product Definition Section */}
            <div className="industrial-panel p-6">
                <h3 className="text-xs font-bold text-industrial-copper-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span className="text-lg">❖</span> Product Definition
                </h3>

                <div className="space-y-4">
                    <div>
                        <label className="block text-[10px] font-mono text-industrial-steel-400 uppercase tracking-widest mb-2">Description</label>
                        <textarea
                            value={metadata.product_definition?.description || ''}
                            onChange={(e) => updateField(['product_definition', 'description'], e.target.value)}
                            disabled={readOnly}
                            className="w-full h-24 industrial-input p-3 text-sm font-mono rounded-sm resize-none focus:border-industrial-copper-500 transition-colors bg-black/40"
                            placeholder="Enter product description..."
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-mono text-industrial-steel-400 uppercase tracking-widest mb-2">Specifications</label>
                        <div className="bg-black/20 border border-industrial-concrete rounded-sm p-4 space-y-2">
                            {Object.entries(metadata.product_definition?.specifications || {}).map(([key, value], idx) => (
                                <div key={idx} className="flex gap-2 items-center">
                                    <input
                                        type="text"
                                        value={key}
                                        disabled={true}
                                        className="w-1/3 bg-transparent text-[10px] font-mono text-industrial-steel-500 uppercase text-right px-2 border-r border-industrial-concrete"
                                    />
                                    <input
                                        type="text"
                                        value={value as string}
                                        onChange={(e) => {
                                            const newSpecs = { ...metadata.product_definition.specifications };
                                            newSpecs[key] = e.target.value;
                                            updateField(['product_definition', 'specifications'], newSpecs);
                                        }}
                                        disabled={readOnly}
                                        className="flex-1 bg-transparent text-sm font-mono text-industrial-steel-300 focus:text-white focus:outline-none px-2"
                                    />
                                    {!readOnly && (
                                        <button
                                            onClick={() => {
                                                const newSpecs = { ...metadata.product_definition.specifications };
                                                delete newSpecs[key];
                                                updateField(['product_definition', 'specifications'], newSpecs);
                                            }}
                                            className="text-industrial-alert hover:text-red-500 px-2"
                                        >×</button>
                                    )}
                                </div>
                            ))}
                            {!readOnly && (
                                <div className="flex gap-2 items-center pt-2 border-t border-industrial-concrete/30 mt-2">
                                    <input id="new-spec-key" placeholder="NEW PARAM" className="w-1/3 industrial-input py-1 px-2 text-[10px]" />
                                    <input id="new-spec-val" placeholder="VALUE" className="flex-1 industrial-input py-1 px-2 text-[10px]" />
                                    <button
                                        onClick={() => {
                                            const keyInput = document.getElementById('new-spec-key') as HTMLInputElement;
                                            const valInput = document.getElementById('new-spec-val') as HTMLInputElement;
                                            if (keyInput.value && valInput.value) {
                                                const newSpecs = { ...metadata.product_definition?.specifications, [keyInput.value]: valInput.value };
                                                updateField(['product_definition', 'specifications'], newSpecs);
                                                keyInput.value = '';
                                                valInput.value = '';
                                            }
                                        }}
                                        className="text-industrial-copper-500 hover:text-white px-2 text-lg font-bold"
                                    >+</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* BOM Summary Section */}
            <div className="industrial-panel p-6">
                <h3 className="text-xs font-bold text-industrial-steel-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span className="text-lg">⚙</span> BOM Summary
                </h3>
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-[10px] font-mono text-industrial-steel-400 uppercase tracking-widest mb-2">Total Parts</label>
                        <input
                            type="number"
                            value={metadata.bom_summary?.total_parts || 0}
                            onChange={(e) => updateField(['bom_summary', 'total_parts'], parseInt(e.target.value))}
                            disabled={readOnly}
                            className="w-full industrial-input p-2 font-mono text-sm"
                        />
                    </div>
                     <div>
                        <label className="block text-[10px] font-mono text-industrial-steel-400 uppercase tracking-widest mb-2">Critical Items</label>
                        <div className="space-y-1">
                            {(metadata.bom_summary?.critical_items || []).map((item: string, idx: number) => (
                                <div key={idx} className="flex gap-2">
                                     <input
                                        value={item}
                                        onChange={(e) => {
                                            const newItems = [...metadata.bom_summary.critical_items];
                                            newItems[idx] = e.target.value;
                                            updateField(['bom_summary', 'critical_items'], newItems);
                                        }}
                                        disabled={readOnly}
                                        className="flex-1 industrial-input py-1 px-2 text-xs font-mono"
                                    />
                                     {!readOnly && (
                                        <button
                                            onClick={() => {
                                                const newItems = metadata.bom_summary.critical_items.filter((_: any, i: number) => i !== idx);
                                                updateField(['bom_summary', 'critical_items'], newItems);
                                            }}
                                            className="text-industrial-alert hover:text-red-500"
                                        >×</button>
                                    )}
                                </div>
                            ))}
                             {!readOnly && (
                                <button
                                    onClick={() => {
                                        const newItems = [...(metadata.bom_summary?.critical_items || []), "New Item"];
                                        updateField(['bom_summary', 'critical_items'], newItems);
                                    }}
                                    className="text-[10px] text-industrial-copper-500 hover:underline mt-1"
                                >+ Add Item</button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Risk Assessment Section */}
            <div className="industrial-panel p-6 border-l-4 border-l-industrial-alert">
                 <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span className="text-lg text-industrial-alert">⚠</span> Risk Assessment
                </h3>
                <div className="space-y-2">
                    {(metadata.risk_assessment?.issues || []).map((issue: any, idx: number) => (
                         <div key={idx} className="bg-red-900/10 border border-red-500/20 p-3 rounded-sm flex gap-4 items-start">
                             <div className="w-24">
                                 <select
                                    value={issue.severity || 'Low'}
                                    onChange={(e) => {
                                        const newIssues = [...metadata.risk_assessment.issues];
                                        newIssues[idx] = { ...issue, severity: e.target.value };
                                        updateField(['risk_assessment', 'issues'], newIssues);
                                    }}
                                    disabled={readOnly}
                                    className="w-full bg-black/40 text-[10px] text-red-400 font-bold uppercase border border-red-500/30 rounded-sm px-1 py-1"
                                 >
                                     <option value="Low">Low</option>
                                     <option value="Medium">Medium</option>
                                     <option value="High">High</option>
                                     <option value="Critical">Critical</option>
                                 </select>
                             </div>
                             <textarea
                                value={issue.description || issue}
                                onChange={(e) => {
                                    const newIssues = [...metadata.risk_assessment.issues];
                                    newIssues[idx] = { ...issue, description: e.target.value };
                                    updateField(['risk_assessment', 'issues'], newIssues);
                                }}
                                disabled={readOnly}
                                className="flex-1 bg-transparent text-xs text-neutral-300 font-mono resize-none focus:outline-none border-b border-transparent focus:border-red-500/50"
                                rows={2}
                            />
                            {!readOnly && (
                                <button
                                    onClick={() => {
                                        const newIssues = metadata.risk_assessment.issues.filter((_: any, i: number) => i !== idx);
                                        updateField(['risk_assessment', 'issues'], newIssues);
                                    }}
                                    className="text-industrial-steel-600 hover:text-red-500"
                                >×</button>
                            )}
                         </div>
                    ))}
                    {!readOnly && (
                        <button
                            onClick={() => {
                                const newIssues = [...(metadata.risk_assessment?.issues || []), { severity: "Medium", description: "New Risk Identified" }];
                                updateField(['risk_assessment', 'issues'], newIssues);
                            }}
                            className="w-full py-2 border border-dashed border-red-500/30 text-red-500/50 hover:text-red-500 hover:border-red-500 text-[10px] uppercase font-mono transition-all"
                        >+ Add Risk</button>
                    )}
                </div>
            </div>
        </div>
    );
}
