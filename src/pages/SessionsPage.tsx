import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ControllersSessionsService, ControllersProjectsService, ControllersChatService, ControllersBlobsService, SessionResponse, ProjectResponse, BlobResponse } from '../api/generated';
import { useAuth } from '../contexts/AuthContext';
import { ChatInterface } from '../components/ChatInterface';
import { LifecycleTracker } from '../components/LifecycleTracker';
import { MetadataEditor } from '../components/MetadataEditor';

type WorkflowStage = 'ingestion' | 'preparation' | 'verification' | 'complete';


const SYSTEM_PROMPT = `
[SYSTEM: MANUFACTURING_AGENT]
You are a helpful industrial manufacturing assistant specialized in Tech Transfer.

CENTRAL METADATA OBJECT:
- There is a file named 'metadata.json' which acts as the 'Source of Truth' for this Tech Transfer session.
- Your PRIMARY GOAL is to populate and refine this 'metadata.json' file based on the documents you read.
- This JSON object is what the manufacturer will use to validate the project.
    - IMPORTANT: The JSON MUST contain a root key 'project_data' which holds CSV-friendly tabular data.
    - 'project_data' should be a dictionary where keys are table names (e.g. "Bill_Of_Materials", "Specifications") and values are objects representing columns.
    - Example structure:
      {
        "project_data": {
           "Bill_Of_Materials": {
              "Part_Number": ["A1", "B2"],
              "Description": ["Screw", "Plate"],
              "Quantity": ["10", "1"]
           },
           "Specifications": {
              "Property": ["Weight", "Material"],
              "Value": ["10kg", "Steel"]
           }
        },
        "lifecycle": { ... },
        "risk_assessment": { ... }
      }
- ALWAYS try to keep 'metadata.json' up to date. If you find new information, update 'metadata.json' using 'create_text_file'.

GUIDELINES:
1. FILE MANAGEMENT: If you upload or generate a file with the same name as an existing one, it will automatically overwrite the old version.
2. DATA ENRICHMENT: You can use "Magic Fill" to automatically populate missing CSV data based on best-guess estimates.
3. VERIFICATION: The user can force-override verification checks. Be pragmatic in your "Risk Scans".
`;

const serializeCsv = (rows: string[][]): string => {
    return rows.map(row =>
        row.map(cell => {
            if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
                return `"${cell.replace(/"/g, '""')}"`;
            }
            return cell;
        }).join(',')
    ).join('\n');
};

const ProjectDataEditor = ({ data, onUpdate, readOnly }: { data: any, onUpdate?: (d: any) => void, readOnly?: boolean }) => {
    if (!data) return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="w-16 h-16 border-2 border-dashed border-industrial-steel-700 rounded-full flex items-center justify-center mb-4">
                <span className="text-industrial-steel-600">?</span>
            </div>
            <h4 className="text-industrial-steel-400 font-mono text-xs uppercase tracking-widest mb-2">No Metadata Found</h4>
            <p className="text-[10px] text-industrial-steel-600 max-w-xs uppercase leading-relaxed">
                The AI agent has not yet generated a metadata.json file.
            </p>
        </div>
    );

    // Fallback if no project_data but other data exists
    if (!data.project_data) {
        return (
            <div className="p-6 text-industrial-steel-400 font-mono text-xs h-full flex flex-col">
                <div className="mb-4 flex items-center gap-2 p-3 bg-yellow-900/20 border border-yellow-500/30 rounded text-yellow-500">
                    <span>⚠</span>
                    <span>Standard 'project_data' table structure not found. Viewing raw JSON:</span>
                </div>
                <div className="bg-black/40 p-4 rounded border border-industrial-concrete overflow-auto flex-1 custom-scrollbar">
                    <pre>{JSON.stringify(data, null, 2)}</pre>
                </div>
            </div>
        );
    }

    const tables = data.project_data;
    const tableNames = Object.keys(tables);

    if (tableNames.length === 0) {
        return <div className="p-6 text-industrial-steel-500 italic font-mono text-xs">Project Data is empty.</div>;
    }

    const handleCellChange = (tableName: string, colName: string, rowIndex: number, value: string) => {
        if (readOnly || !onUpdate) return;

        const newData = JSON.parse(JSON.stringify(data));
        if (!newData.project_data[tableName]) return;
        if (!newData.project_data[tableName][colName]) return;

        newData.project_data[tableName][colName][rowIndex] = value;
        onUpdate(newData);
    };

    return (
        <div className="flex flex-col h-full overflow-hidden custom-scrollbar">
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {tableNames.map((tableName) => {
                    const columns = tables[tableName];
                    const colNames = Object.keys(columns);
                    if (colNames.length === 0) return null;
                    const rowCount = columns[colNames[0]]?.length || 0;

                    return (
                        <div key={tableName} className="industrial-panel p-0 border border-industrial-concrete bg-industrial-steel-900/30 overflow-hidden">
                            <div className="bg-industrial-steel-900 border-b border-industrial-concrete px-4 py-2 flex items-center gap-2">
                                <span className="text-industrial-copper-500">❖</span>
                                <h4 className="text-xs font-bold text-industrial-steel-200 uppercase tracking-widest">
                                    {tableName.replace(/_/g, ' ')}
                                </h4>
                            </div>
                            <div className="overflow-x-auto custom-scrollbar">
                                <table className="w-full text-xs font-mono text-left bg-industrial-steel-950/50">
                                    <thead>
                                        <tr>
                                            {colNames.map(col => (
                                                <th key={col} className="p-2 border-b border-r border-industrial-concrete text-industrial-steel-500 whitespace-nowrap bg-industrial-steel-900/50 font-normal uppercase tracking-wider text-[10px]">
                                                    {col}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Array.from({ length: rowCount }).map((_, rowIndex) => (
                                            <tr key={rowIndex} className="border-b border-industrial-concrete/20 hover:bg-white/5 transition-colors group">
                                                {colNames.map(col => (
                                                    <td key={col} className="p-0 border-r border-industrial-concrete/20 min-w-[120px] relative">
                                                        <input
                                                            type="text"
                                                            readOnly={readOnly}
                                                            value={columns[col][rowIndex] || ''}
                                                            onChange={(e) => handleCellChange(tableName, col, rowIndex, e.target.value)}
                                                            className={`w-full h-full bg-transparent p-2 text-industrial-steel-300 font-mono text-xs focus:outline-none transition-colors border-none ${readOnly ? 'cursor-default' : 'focus:bg-industrial-steel-800 focus:text-white focus:ring-1 focus:ring-inset focus:ring-industrial-copper-500'}`}
                                                        />
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export function SessionsPage() {
    const { projectId } = useParams<{ projectId: string }>();
    const [searchParams] = useSearchParams();
    const [project, setProject] = useState<ProjectResponse | null>(null);
    const [sessions, setSessions] = useState<SessionResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newSessionTitle, setNewSessionTitle] = useState('');
    const [selectedSession, setSelectedSession] = useState<SessionResponse | null>(null);

    const { viewMode } = useAuth();
    const [comments, setComments] = useState<Record<string, string[]>>({});

    // Lifecycle State
    const [lifecycleSteps, setLifecycleSteps] = useState<string[]>([]);
    const [lifecycleCurrentStep, setLifecycleCurrentStep] = useState(0);
    const [isGeneratingLifecycle, setIsGeneratingLifecycle] = useState(false);

    // Workflow State
    const [workflowStage, setWorkflowStage] = useState<WorkflowStage>('ingestion');

    // State
    const [blobs, setBlobs] = useState<BlobResponse[]>([]);
    const [chatRefreshTrigger, setChatRefreshTrigger] = useState(0);
    const [uploading, setUploading] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [processingStatus, setProcessingStatus] = useState('');
    const [wizardStep, setWizardStep] = useState(1);
    const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
    const [targetColumns] = useState('Part Number, Description, Quantity, Manufacturer, Price');
    const [wizardStartType, setWizardStartType] = useState<'bom' | 'description' | 'sketch' | null>(null);
    const [productDescription, setProductDescription] = useState('');

    // Verification State
    const [metadataJson, setMetadataJson] = useState<any>(null);
    const [metadataBlobId, setMetadataBlobId] = useState<string | null>(null);
    const [isSavingMetadata, setIsSavingMetadata] = useState(false);
    const [isSyncingMetadata, setIsSyncingMetadata] = useState(false);

    // Manual Text Entry State
    const [showTextEntryModal, setShowTextEntryModal] = useState(false);
    const [textEntryTitle, setTextEntryTitle] = useState('');
    const [textEntryContent, setTextEntryContent] = useState('');
    const [isSavingTextEntry, setIsSavingTextEntry] = useState(false);

    // Ref to track current session ID for async operations
    const selectedSessionIdRef = useRef<string | null>(null);
    // Ref to prevent double-submit race conditions
    const processingRef = useRef(false);

    // Chat panel resize state
    const [chatPanelWidth, setChatPanelWidth] = useState(() => {
        const saved = localStorage.getItem('chatPanelWidth');
        return saved ? parseInt(saved, 10) : 400;
    });
    const [isResizing, setIsResizing] = useState(false);
    const resizeRef = useRef<HTMLDivElement>(null);



    const DOC_PROMPTS: Record<string, string> = {
        "Production": `
[SYSTEM: DOC_GENERATION]
Generate a "Mass_Production_Plan.docx".
CRITICAL: This is a manufacturing execution plan.
SECTIONS:
- Scaling Strategy: Transition from pilot to mass production.
- Quality Control Points: Specific inspection criteria for high volume.
- Line Balancing: Takt time analysis and station assignments.
- Supply Chain: Bulk material handling and logistics.
`,
        "Pilot Runs": `
[SYSTEM: DOC_GENERATION]
Generate a "Pilot_Run_Report.docx".
CRITICAL: Focus on validation and initial data gathering.
SECTIONS:
- Pilot Objectives: What are we trying to prove? (Yield, speed, quality).
- Batch Configuration: Setups used for the pilot.
- Measurement Plan: Key metrics to track during the run.
- Failure Mode Prediction: What is likely to go wrong and how to monitor it.
`,
        "Installation & Testing": `
[SYSTEM: DOC_GENERATION]
Generate an "Installation_and_SAT_Protocol.docx".
CRITICAL: Field work instructions.
SECTIONS:
- Site Prep: Power, air, floor space requirements.
- Rigging & Handling: How to move the equipment.
- IQ/OQ/PQ Protocols: Detailed steps for acceptance testing.
- Safety Lockout/Tagout procedures specific to this machine.
`,
        "Process Development": `
[SYSTEM: DOC_GENERATION]
Generate a "Process_Development_Study.docx".
CRITICAL: Engineering parameter optimization.
SECTIONS:
- DOE (Design of Experiments) Setup: Variables tested (Temp, Pressure, Speed).
- Process Window: Upper and lower control limits.
- Optimization Results: Theoretical best settings.
- Material Interaction Analysis.
`,
        "Design for manufacturing": `
[SYSTEM: DOC_GENERATION]
Generate a "DFM_Analysis_Report.docx".
CRITICAL: Design critique for cost and ease of assembly.
SECTIONS:
- Tolerance Analysis: Are specs achievable?
- Part Simplification: Opportunities to combine or remove parts.
- Material Selection: Cost vs Performance trade-offs.
- Assembly Access: Tool clearance and ergonomic review.
`,
        "Review & Capabilities Analysis": `
[SYSTEM: DOC_GENERATION]
Generate a "Capabilities_Gap_Analysis.docx".
CRITICAL: Vendor vs Requirement match.
SECTIONS:
- Requirement Matrix: Detailed breakdown of specs vs current vendor capabilities.
- Gap Identification: Where do we fall short?
- Risk Assessment: Scoring of identified gaps.
- Correction Plan: Steps to close the gaps (Training, new equipment, outsourcing).
`,
        "Visual Aids": `
[SYSTEM: VISUAL_GENERATION]
INSTRUCTION: Use the 'generate_image' tool to create 3 distinct technical diagrams.
1. "assembly_exploded_view.png": An exploded view showing part relationships.
2. "process_flow_diagram.png": A block diagram of the manufacturing process steps.
3. "finished_product_render.png": High-fidelity photorealistic render of the final output.
Ensure these are high-resolution and technical in style (blueprint or clean CAD style).
`
    };

    // CSV Data State
    const [csvData, setCsvData] = useState<Record<string, string[][]>>({});

    const { logout } = useAuth();
    const navigate = useNavigate();

    // Initial Load
    useEffect(() => {
        if (projectId) {
            loadProjectAndSessions();
        }
    }, [projectId]);

    // Session Switch
    // Session Switch with Cleanup and Abort Logic
    useEffect(() => {
        selectedSessionIdRef.current = selectedSession?.id || null;
        setWizardStartType(null);
        setProductDescription('');

        // AGGRESSIVE CLEANUP: Wipe all session-specific state
        setBlobs([]);
        setCsvData({});
        setComments({});
        setLifecycleSteps([]);
        setLifecycleCurrentStep(0);
        setProcessing(false);
        setProcessingStatus('');
        setMetadataJson(null);
        setMetadataBlobId(null);

        if (selectedSession) {
            console.log(`[SessionsPage] Switching to session ${selectedSession.id}`);
            loadSessionData(selectedSession.id);

            // Check if lifecycle already exists to bypass wizard
            let hasLifecycle = false;
            if (selectedSession.content) {
                try {
                    const parsed = JSON.parse(selectedSession.content);
                    hasLifecycle = parsed.lifecycle && parsed.lifecycle.steps && parsed.lifecycle.steps.length > 0;
                } catch (e) { }
            }

            // If already processing, start polling
            if ((selectedSession as any).status === 'processing') {
                startPolling(selectedSession.id);
            } else if ((selectedSession as any).status === 'completed' || hasLifecycle) {
                // If completed OR has lifecycle defined, skip to "Done/Review" state (Step 4)
                setWizardStep(4);
            } else {
                setWizardStep(1);
            }
        } else {
            console.log(`[SessionsPage] Cleared session selection`);
            setWizardStep(1);
        }
    }, [selectedSession?.id]); // Use ID to avoid re-triggering when status changes via setPoll

    // Load Comments from Session Content
    useEffect(() => {
        if (selectedSession?.content) {
            try {
                const parsed = JSON.parse(selectedSession.content);
                if (parsed.comments) {
                    setComments(parsed.comments);
                }
            } catch (e) {
                // Ignore if not JSON or invalid format
            }
        } else {
            setComments({});
        }
    }, [selectedSession?.id, selectedSession?.content]);

    // Load Lifecycle from Session Content
    useEffect(() => {
        if (selectedSession?.content) {
            try {
                const parsed = JSON.parse(selectedSession.content);
                if (parsed.lifecycle) {
                    setLifecycleSteps(parsed.lifecycle.steps || []);
                    setLifecycleCurrentStep(parsed.lifecycle.currentStep || 0);
                } else {
                    setLifecycleSteps([]);
                    setLifecycleCurrentStep(0);
                }
            } catch (e) {
                // Ignore
            }
        } else {
            setLifecycleSteps([]);
            setLifecycleCurrentStep(0);
        }
    }, [selectedSession?.id, selectedSession?.content]);

    const handleStageChange = async (newStage: WorkflowStage) => {
        if (!selectedSession) return;
        setWorkflowStage(newStage);

        try {
            let existingContent: any = {};
            try {
                existingContent = selectedSession.content ? JSON.parse(selectedSession.content) : {};
            } catch (e) { }

            const payloadObj = {
                ...existingContent,
                workflow_stage: newStage
            };
            const contentPayload = JSON.stringify(payloadObj);

            await ControllersSessionsService.update(selectedSession.id, { content: contentPayload });

            // Optimistically update
            setSelectedSession(prev => prev ? { ...prev, content: contentPayload } : null);
        } catch (error) {
            console.error('Failed to update stage:', error);
        }
    };

    // Load Workflow Stage
    useEffect(() => {
        if (selectedSession?.content) {
            try {
                const parsed = JSON.parse(selectedSession.content);
                setWorkflowStage(parsed.workflow_stage || 'ingestion');
            } catch (e) {
                setWorkflowStage('ingestion');
            }
        }
    }, [selectedSession?.id, selectedSession?.content]);

    // Sync processing ref with state
    useEffect(() => {
        processingRef.current = processing;
    }, [processing]);

    const handleLifecycleUpdate = async (steps: string[], currentStep: number) => {
        if (!selectedSession) return;

        setLifecycleSteps(steps);
        setLifecycleCurrentStep(currentStep);

        try {
            let existingContent: any = {};
            try {
                existingContent = selectedSession.content ? JSON.parse(selectedSession.content) : {};
            } catch (e) { }

            const payloadObj = {
                ...existingContent,
                lifecycle: { steps, currentStep }
            };
            const contentPayload = JSON.stringify(payloadObj);

            await ControllersSessionsService.update(selectedSession.id, { content: contentPayload });

            // Optimistically update local session content
            setSelectedSession(prev => prev ? { ...prev, content: contentPayload } : null);
        } catch (error) {
            console.error('Failed to update lifecycle:', error);
        }
    };

    const handleLifecycleGenerate = async () => {
        if (!selectedSession) return;
        setIsGeneratingLifecycle(true);
        try {
            const prompt = `${SYSTEM_PROMPT}\n\n[SYSTEM: LIFECYCLE_GENERATION] Generate a sequential product lifecycle plan for this project as a JSON list of strings. Example: ["Design Review", "Prototyping", "Testing", "Production"]. Do not include any other text.`;

            const response = await ControllersChatService.chat(selectedSession.id, { message: prompt });

            if (response && response.role !== 'user') {
                try {
                    const content = response.content;
                    let steps: string[] = [];

                    // 1. Try to find a JSON array pattern [ ... ]
                    const jsonMatch = content.match(/\[[\s\S]*?\]/);
                    if (jsonMatch) {
                        try {
                            const parsed = JSON.parse(jsonMatch[0]);
                            if (Array.isArray(parsed)) steps = parsed;
                        } catch (e) {
                            // continued below
                        }
                    }

                    // 2. If simple regex failed, try cleaning "Final Answer:" prefix common in some models
                    if (steps.length === 0) {
                        const cleanContent = content.replace(/^Final Answer:\s*/i, '').trim();
                        try {
                            const parsed = JSON.parse(cleanContent);
                            if (Array.isArray(parsed)) steps = parsed;
                        } catch (e) { }
                    }

                    if (steps.length > 0 && steps.every(s => typeof s === 'string')) {
                        handleLifecycleUpdate(steps, 0);
                    } else {
                        console.error("AI Response content:", content);
                        throw new Error("Could not extract valid string array from response");
                    }
                } catch (e) {
                    console.error("Failed to parse AI response for lifecycle", e);
                    // Fallback to default lifecycle if AI fails
                    const defaultSteps = ["Design Review", "Engineering", "Prototyping", "Validation", "Production Launch"];
                    handleLifecycleUpdate(defaultSteps, 0);
                    // Optional: Notify user we used defaults
                    console.log("Used default lifecycle steps due to parse error.");
                }
            }
        } catch (error) {
            console.error('Failed to generate lifecycle:', error);
            alert('Failed to generate lifecycle steps');
        } finally {
            setIsGeneratingLifecycle(false);
        }
    };



    const handleGenerateCritique = async () => {
        if (!selectedSession) return;
        try {
            const prompt = `${SYSTEM_PROMPT}\n\n[SYSTEM: CRITIQUE_GENERATION] Analyze the currently generated assets (documents, images, data) in this session. Provide a critical review of how they align with the original request and the overall tech transfer goals. Identify any gaps, inconsistencies, or areas for improvement.`;

            await ControllersChatService.chat(selectedSession.id, { message: prompt });
            setChatRefreshTrigger(prev => prev + 1);
            await loadSessionData(selectedSession.id);
        } catch (error) {
            console.error('Failed to generate critique:', error);
            alert('Failed to generate critique');
        }
    };

    const handleAddComment = async (blobId: string, text: string) => {
        if (!selectedSession || !text.trim()) return;

        const newComments = {
            ...comments,
            [blobId]: [...(comments[blobId] || []), text.trim()]
        };
        setComments(newComments);

        // Persist to backend
        try {
            // Merge with existing content to prevent data loss
            let existingContent: any = {};
            try {
                existingContent = selectedSession.content ? JSON.parse(selectedSession.content) : {};
            } catch (e) {
                // If existing content is not JSON, preserve it in _raw field if needed, or assume empty object if it was just a string we can overwrite safely
                // For this app, we assume content is either empty or JSON.
                console.warn('Session content was not valid JSON, initializing new structure');
            }

            const payloadObj = { ...existingContent, comments: newComments };
            const contentPayload = JSON.stringify(payloadObj);

            // Update backend
            await ControllersSessionsService.update(selectedSession.id, { content: contentPayload });

            // Optimistically update local session content to avoid effect reverting changes if session obj updates
            setSelectedSession(prev => prev ? { ...prev, content: contentPayload } : null);
        } catch (error) {
            console.error('Failed to save comment:', error);
            alert('Failed to save comment');
        }
    };

    // Chat panel resize handlers
    const handleResizeStart = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        setIsResizing(true);
    }, []);

    useEffect(() => {
        const handleResizeMove = (e: MouseEvent) => {
            if (!isResizing) return;
            const newWidth = window.innerWidth - e.clientX;
            const clampedWidth = Math.min(Math.max(newWidth, 280), 800);
            setChatPanelWidth(clampedWidth);
        };

        const handleResizeEnd = () => {
            if (isResizing) {
                setIsResizing(false);
                localStorage.setItem('chatPanelWidth', chatPanelWidth.toString());
            }
        };

        if (isResizing) {
            document.addEventListener('mousemove', handleResizeMove);
            document.addEventListener('mouseup', handleResizeEnd);
        }

        return () => {
            document.removeEventListener('mousemove', handleResizeMove);
            document.removeEventListener('mouseup', handleResizeEnd);
        };
    }, [isResizing, chatPanelWidth]);

    // Load metadata.json
    useEffect(() => {
        const metadataBlob = blobs.find(b => b.file_name === 'metadata.json');
        if (metadataBlob) {
            setMetadataBlobId(metadataBlob.id);
            const token = localStorage.getItem('token');
            fetch(`${import.meta.env.VITE_API_URL}/api/blobs/${metadataBlob.id}/download`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(res => {
                    if (!res.ok) throw new Error("Metadata not found");
                    return res.json();
                })
                .then(data => {
                    setMetadataJson(data);
                })
                .catch(err => console.error('Failed to load metadata.json', err));
        } else {
            setMetadataJson(null);
            setMetadataBlobId(null);
        }
    }, [blobs]);

    // Load CSV Content
    useEffect(() => {
        blobs.forEach(blob => {
            const isCsv = blob.content_type === 'text/csv' || blob.file_name.toLowerCase().endsWith('.csv');
            if (isCsv && !csvData[blob.id]) {
                const token = localStorage.getItem('token');
                fetch(`${import.meta.env.VITE_API_URL}/api/blobs/${blob.id}/download`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                    .then(res => res.text())
                    .then(text => {
                        // Simple CSV Parse
                        const rows = text.split('\n').map(row => row.split(','));
                        setCsvData(prev => ({ ...prev, [blob.id]: rows }));
                    })
                    .catch(err => console.error('Failed to load CSV', err));
            }
        });
    }, [blobs, csvData]);

    const loadProjectAndSessions = async () => {
        if (!projectId) return;
        try {
            setLoading(true);
            const [projectData, sessionsData] = await Promise.all([
                ControllersProjectsService.getOne(projectId),
                ControllersSessionsService.list(projectId),
            ]);
            setProject(projectData);
            setSessions(sessionsData);

            // Auto-select session from URL if present
            const targetSessionId = searchParams.get('sessionId');
            if (targetSessionId) {
                const target = sessionsData.find(s => s.id === targetSessionId);
                if (target) {
                    setSelectedSession(target);
                }
            }
        } catch (error: any) {
            if (error.status === 401) logout();
            else if (error.status === 403 || error.status === 404) navigate('/dashboard');
        } finally {
            setLoading(false);
        }
    };

    const loadSessionData = async (sessionId: string) => {
        try {
            console.log(`[SessionsPage] Loading blobs for ${sessionId}`);
            const blobsData = await ControllersBlobsService.list(sessionId);

            // Re-check Ref to ensure we are still on the same session
            if (selectedSessionIdRef.current === sessionId) {
                console.log(`[SessionsPage] Setting ${blobsData.length} blobs for ${sessionId}`);
                setBlobs(blobsData.filter(b => b.session_id === sessionId));
            } else {
                console.warn(`[SessionsPage] Ignored stale blobs for ${sessionId} (Current: ${selectedSessionIdRef.current})`);
            }
        } catch (error) {
            console.error('Failed to load session data:', error);
        }
    };

    const handleDeleteSession = async (e: React.MouseEvent, sessionId: string) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this session?')) {
            try {
                await ControllersSessionsService.remove(sessionId);
                if (selectedSession?.id === sessionId) {
                    setSelectedSession(null);
                }
                loadProjectAndSessions();
            } catch (error) {
                console.error('Failed to delete session:', error);
                alert('Failed to delete session');
            }
        }
    };

    const handleSaveTextEntry = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSession || !textEntryTitle.trim() || !textEntryContent.trim()) return;

        try {
            setIsSavingTextEntry(true);

            // Ensure filename has .txt extension
            let fileName = textEntryTitle.trim();
            if (!fileName.toLowerCase().endsWith('.txt') && !fileName.toLowerCase().endsWith('.md')) {
                fileName += '.txt';
            }

            const file = new File([textEntryContent], fileName, { type: 'text/plain' });

            // Check for existing file with same name
            const existing = blobs.find(b => b.file_name === fileName);
            if (existing) {
                if (!window.confirm(`File "${fileName}" already exists. Overwrite?`)) {
                    setIsSavingTextEntry(false);
                    return;
                }
                try {
                    await ControllersBlobsService.remove(existing.id);
                } catch (err) {
                    console.warn('Failed to remove existing blob:', err);
                }
            }

            await ControllersBlobsService.upload(selectedSession.id, { file });

            // Refresh blobs
            const newBlobs = await ControllersBlobsService.list(selectedSession.id);
            setBlobs(newBlobs.filter(b => b.session_id === selectedSession.id));

            // Reset and close
            setShowTextEntryModal(false);
            setTextEntryTitle('');
            setTextEntryContent('');

        } catch (error) {
            console.error('Failed to save text entry:', error);
            alert('Failed to save text note');
        } finally {
            setIsSavingTextEntry(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0 || !selectedSession) return;

        const files = Array.from(e.target.files);

        try {
            setUploading(true);
            let updatedComments = { ...comments };
            let commentsModified = false;

            for (const file of files) {
                // Check for existing file with same name to overwrite
                const existingList = blobs.filter(b => b.file_name === file.name);
                let preservedComments: string[] | undefined;

                if (existingList.length > 0) {
                    console.log(`Overwriting existing file(s): ${file.name}`);
                    const firstExisting = existingList[0];
                    if (updatedComments[firstExisting.id]) {
                        preservedComments = updatedComments[firstExisting.id];
                        // Cleanup comments
                        existingList.forEach(b => {
                            if (updatedComments[b.id]) delete updatedComments[b.id];
                        });
                        commentsModified = true;
                    }

                    for (const existing of existingList) {
                        try {
                            await ControllersBlobsService.remove(existing.id);
                        } catch (err) {
                            console.warn('Failed to remove existing blob (may have been removed already):', err);
                        }
                    }
                }

                // Upload new
                const newBlob = await ControllersBlobsService.upload(selectedSession.id, { file });

                if (preservedComments && newBlob?.id) {
                    updatedComments[newBlob.id] = preservedComments;
                    commentsModified = true;
                }
            }

            // Sync comments to backend if needed
            if (commentsModified) {
                setComments(updatedComments);
                try {
                    const existingContent = selectedSession.content ? JSON.parse(selectedSession.content) : {};
                    const payloadObj = { ...existingContent, comments: updatedComments };
                    const contentPayload = JSON.stringify(payloadObj);
                    await ControllersSessionsService.update(selectedSession.id, { content: contentPayload });
                    setSelectedSession(prev => prev ? { ...prev, content: contentPayload } : null);
                } catch (e) {
                    console.error("Failed to sync preserved comments", e);
                }
            }

            // Refresh
            const newBlobs = await ControllersBlobsService.list(selectedSession.id);
            setBlobs(newBlobs.filter(b => b.session_id === selectedSession.id));

            if (wizardStartType === 'bom' || wizardStartType === 'sketch') {
                await handleConvert();
            } else {
                alert('Upload complete');
            }
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Upload failed');
        } finally {
            setUploading(false);
            if (e.target) e.target.value = '';
        }
    };


    const handleCancel = async () => {
        if (!selectedSession) return;
        const token = localStorage.getItem('token');
        try {
            await fetch(`${import.meta.env.VITE_API_URL}/api/sessions/${selectedSession.id}/cancel`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            // Status will be updated on next poll
        } catch (error) {
            console.error('Failed to cancel:', error);
        }
    };

    const handleRetry = async () => {
        if (!selectedSession || processingRef.current) return;
        processingRef.current = true;
        const token = localStorage.getItem('token');
        try {
            await fetch(`${import.meta.env.VITE_API_URL}/api/sessions/${selectedSession.id}/retry`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            startPolling(selectedSession.id);
        } catch (error) {
            console.error('Failed to retry:', error);
            processingRef.current = false;
        }
    };

    const handleGenerateMetadata = async () => {
        if (!selectedSession || (selectedSession as any).status === 'processing' || processing || processingRef.current) return;

        processingRef.current = true;
        const token = localStorage.getItem('token');
        setProcessing(true);
        setProcessingStatus("Initializing Metadata Analysis...");

        const prompts = [
            `${SYSTEM_PROMPT}\n\n[SYSTEM: METADATA_INIT] Initialize (or reset) the 'metadata.json' file structure. Ensure all fields (product_definition, bom_summary, lifecycle, risk_assessment) are present and empty/default.`,
            `${SYSTEM_PROMPT}\n\n[SYSTEM: METADATA_SPECS] Analyze all uploaded documents and extracted text. Populate 'product_definition' in 'metadata.json' with detailed description and specifications found.`,
            `${SYSTEM_PROMPT}\n\n[SYSTEM: METADATA_BOM] Analyze any BOM files (Excel/CSV) and technical documents. Update 'bom_summary' in 'metadata.json' with total part counts and identify critical items.`,
            `${SYSTEM_PROMPT}\n\n[SYSTEM: METADATA_RISK] Perform a risk assessment based on the known specifications and complexity. Update 'risk_assessment' in 'metadata.json'.`,
            `${SYSTEM_PROMPT}\n\n[SYSTEM: METADATA_LIFECYCLE] Define a recommended product lifecycle for this project. Update 'lifecycle' in 'metadata.json'.`
        ];

        try {
            const queueRes = await fetch(`${import.meta.env.VITE_API_URL}/api/sessions/${selectedSession.id}/queue`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ tasks: prompts })
            });

            if (!queueRes.ok) throw new Error("Failed to queue metadata tasks");

            startPolling(selectedSession.id, prompts.length);

        } catch (error) {
            console.error('Metadata generation failed:', error);
            alert('Failed to start metadata generation');
            setProcessing(false);
            setProcessingStatus('');
            processingRef.current = false;
        }
    };

    const handleConvert = async () => {
        if (!selectedSession || (selectedSession as any).status === 'processing' || processing || processingRef.current) return;

        processingRef.current = true;
        const token = localStorage.getItem('token');

        setProcessing(true);
        setWizardStep(3); // Show processing state

        // 1. Prepare Prompts
        const prompts: string[] = [];

        // Initial Metadata creation
        const initialMetadata = {
            projectId: project?.id,
            revision: "A.1",
            status: "DRAFT",
            product_definition: {
                description: productDescription || "Extracted from assets",
                specifications: {}
            },
            lifecycle: {
                stage: "Ingestion",
                steps: []
            },
            bom_summary: {
                total_parts: 0,
                critical_items: []
            },
            risk_assessment: {
                score: "Pending",
                issues: []
            }
        };

        prompts.push(`${SYSTEM_PROMPT}\n\n[SYSTEM: METADATA_INIT] Create the initial 'metadata.json' file with the following content: ${JSON.stringify(initialMetadata)}. This file will be the Source of Truth for the project.`);

        // Core Analysis & Initialization
        let analysisPrompt = `[SYSTEM: TECH_TRANSFER_INIT]\nGOAL: ${targetColumns}\nINSTRUCTION:\n`;

        if (wizardStartType === 'description' && productDescription) {
            analysisPrompt += `1. Use the following PRODUCT DESCRIPTION as the source of truth:\n"${productDescription}"\n`;
            analysisPrompt += `2. Architect a plausible 'BOM_Standardized.csv' with columns: ${targetColumns} based on this description.\n`;
        } else if (wizardStartType === 'sketch') {
            analysisPrompt += `1. Analyze the uploaded image(s)/sketch(es) to understand the product structure.\n`;
            analysisPrompt += `2. Brainstorm and architect a 'BOM_Standardized.csv' with columns: ${targetColumns} based on visual analysis.\n`;
        } else {
            analysisPrompt += `1. Analyze the uploaded technical file(s) (BOM, specifications).\n`;
            analysisPrompt += `2. Create a 'BOM_Standardized.csv' with columns: ${targetColumns}.\n`;
        }

        analysisPrompt += `3. Sync all extracted information into 'metadata.json'. Ensure the product_definition, lifecycle, and bom_summary fields in 'metadata.json' are fully populated.\n`;
        analysisPrompt += `4. Create a 'data_summary.csv' of the main parts list.\n`;
        analysisPrompt += `5. Extract key technical parameters and manufacturing requirements.\n`;
        analysisPrompt += `6. NOTE: If you generate a file with the same name as an existing one, it will overwrite the old version. Maintain consistent filenames for updates.\n`;

        prompts.push(analysisPrompt);

        // Selected Documents
        for (const docType of selectedDocs) {
            const specificInstruction = DOC_PROMPTS[docType] || `[SYSTEM: DOC_GENERATION] Generate a detailed report for ${docType}.`;
            const docPrompt = `
${specificInstruction}

CRITICAL GENERAL INSTRUCTIONS FOR WORD DOCS (Ignore for Images):
1. FILE MANAGEMENT: If a file with the same name exists, it will be overwritten. Use this to update documents.
2. Create a "FULL, DETAILED PROFESSIONAL REPORT" (3-4 pages min).
3. DO NOT use placeholders. Approximate values based on context.
4. Use professional formatting (headers, bullet points).
`;
            prompts.push(docPrompt);
        }

        // Final Wrap Up
        prompts.push("Generate a 'Summary_Report.docx' listing all generated assets and next steps.");

        try {
            // 2. Submit Queue
            setProcessingStatus("Initiating Batch Process...");

            const queueRes = await fetch(`${import.meta.env.VITE_API_URL}/api/sessions/${selectedSession.id}/queue`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ tasks: prompts })
            });

            if (!queueRes.ok) throw new Error("Failed to queue tasks");

            // 3. Start Polling
            startPolling(selectedSession.id, prompts.length);

        } catch (error) {
            console.error('Conversion failed:', error);
            alert('Failed to complete conversion sequence');
            setProcessing(false);
            setProcessingStatus('');
            processingRef.current = false;
        }
    };

    const startPolling = async (sessionId: string, totalTasksCount?: number) => {
        const token = localStorage.getItem('token');
        let attempts = 0;
        const maxAttempts = 900;

        setProcessing(true);
        setWizardStep(3);

        while (attempts < maxAttempts) {
            if (selectedSessionIdRef.current !== sessionId) break;
            try {
                const [sessionData, newBlobs] = await Promise.all([
                    fetch(`${import.meta.env.VITE_API_URL}/api/sessions/${sessionId}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }).then(r => r.json()),
                    ControllersBlobsService.list(sessionId)
                ]);

                setBlobs(newBlobs.filter(b => b.session_id === sessionId));

                // Trigger chat refresh
                setChatRefreshTrigger(prev => prev + 1);

                // Update selected session with newest data
                setSelectedSession(sessionData);

                const status = (sessionData as any).status;
                const pendingCount = (sessionData as any).pending_tasks?.length || 0;

                if (status === 'completed') {
                    setProcessingStatus("Completed.");
                    setProcessing(false);
                    setWizardStep(4);
                    break;
                } else if (status === 'cancelled') {
                    setProcessingStatus("Process Cancelled.");
                    setProcessing(false);
                    setWizardStep(2); // Back to deliverables
                    break;
                } else if (status === 'error') {
                    setProcessingStatus("Execution Error.");
                    setProcessing(false);
                    setWizardStep(2);
                    break;
                }

                // Estimate progress
                if (totalTasksCount) {
                    const done = totalTasksCount - pendingCount;
                    setProcessingStatus(`Processing: ${done}/${totalTasksCount} tasks completed...`);
                } else {
                    setProcessingStatus(`Processing... ${pendingCount} tasks remaining`);
                }

                attempts++;
                await new Promise(r => setTimeout(r, 2000));
            } catch (e) {
                console.error("Polling error:", e);
                await new Promise(r => setTimeout(r, 5000));
            }
        }
    };

    const handleCellChange = (blobId: string, rowIndex: number, colIndex: number, value: string) => {
        setCsvData(prev => {
            const currentRows = prev[blobId];
            if (!currentRows) return prev;

            const newRows = [...currentRows];
            newRows[rowIndex] = [...newRows[rowIndex]];
            newRows[rowIndex][colIndex] = value;

            return {
                ...prev,
                [blobId]: newRows
            };
        });
    };

    const handleSaveCsv = async (blob: BlobResponse) => {
        const data = csvData[blob.id];
        if (!data || !selectedSession) return;

        const csvContent = serializeCsv(data);
        const file = new File([csvContent], blob.file_name, { type: 'text/csv' });

        const formData = new FormData();
        formData.append('file', file);
        const token = localStorage.getItem('token');

        try {
            // 1. Upload new blob
            const uploadRes = await fetch(`${import.meta.env.VITE_API_URL}/api/sessions/${selectedSession.id}/blobs`, {
                method: 'POST',
                body: formData,
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!uploadRes.ok) throw new Error("Failed to upload new CSV version");

            const newBlob: BlobResponse = await uploadRes.json();

            // 2. Migrate comments
            const oldComments = comments[blob.id] || [];
            if (oldComments.length > 0) {
                const newCommentsMap = { ...comments };
                delete newCommentsMap[blob.id];
                newCommentsMap[newBlob.id] = oldComments;

                setComments(newCommentsMap);

                let existingContent: any = {};
                try {
                    existingContent = selectedSession.content ? JSON.parse(selectedSession.content) : {};
                } catch (e) { }

                const payloadObj = { ...existingContent, comments: newCommentsMap };
                await ControllersSessionsService.update(selectedSession.id, { content: JSON.stringify(payloadObj) });
                setSelectedSession(prev => prev ? { ...prev, content: JSON.stringify(payloadObj) } : null);
            }

            // 3. Delete old blob
            await ControllersBlobsService.remove(blob.id);

            // 4. Update local state
            setCsvData(prev => {
                const next = { ...prev };
                delete next[blob.id];
                next[newBlob.id] = data;
                return next;
            });

            const newBlobs = await ControllersBlobsService.list(selectedSession.id);
            setBlobs(newBlobs.filter(b => b.session_id === selectedSession.id));

            alert("CSV Saved successfully");

        } catch (e) {
            console.error("Save failed", e);
            alert("Failed to save CSV");
        }
    };

    const handleSyncMetadata = async () => {
        if (!selectedSession) return;
        setIsSyncingMetadata(true);
        try {
            const prompt = `${SYSTEM_PROMPT}\n\n[SYSTEM: METADATA_SYNC] Analyze all available files (blobs) in the session. Update 'metadata.json' to reflect the latest information found in these files. Ensure product_definition, lifecycle, and bom_summary are accurate.`;
            await ControllersChatService.chat(selectedSession.id, { message: prompt });
            setChatRefreshTrigger(prev => prev + 1);
            await loadSessionData(selectedSession.id);
        } catch (error) {
            console.error('Failed to sync metadata:', error);
            alert('Failed to sync metadata');
        } finally {
            setIsSyncingMetadata(false);
        }
    };

    const handleSaveMetadata = async () => {
        if (!selectedSession || !metadataJson) return;

        setIsSavingMetadata(true);
        try {
            const content = JSON.stringify(metadataJson, null, 2);
            const file = new File([content], 'metadata.json', { type: 'application/json' });

            const formData = new FormData();
            formData.append('file', file);
            const token = localStorage.getItem('token');

            // 1. Upload new blob (backend handles overwrites if we delete old one, but actually the storage might just overwrite)
            // The controller upload() creates a NEW blob record. 
            // The instructions say "overwrites existing files with same name" but the controller doesn't seem to do that automatically yet?
            // Wait, Conversation a0e55f93 says user wanted to update logic to overwrite. 
            // Let me check if I should delete the old one first.

            const uploadRes = await fetch(`${import.meta.env.VITE_API_URL}/api/sessions/${selectedSession.id}/blobs`, {
                method: 'POST',
                body: formData,
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!uploadRes.ok) throw new Error("Failed to save metadata.json");

            // 2. Delete old blob(s) if they exist (cleanup all duplicates)
            const oldMetadataBlobs = blobs.filter(b => b.file_name === 'metadata.json');
            for (const b of oldMetadataBlobs) {
                try {
                    await ControllersBlobsService.remove(b.id);
                } catch (e) {
                    console.warn("Failed to delete old metadata blob, might already be removed", e);
                }
            }

            const newBlobs = await ControllersBlobsService.list(selectedSession.id);
            setBlobs(newBlobs.filter(b => b.session_id === selectedSession.id));

            alert("Metadata saved successfully");
        } catch (error) {
            console.error('Failed to save metadata:', error);
            alert('Failed to save metadata');
        } finally {
            setIsSavingMetadata(false);
        }
    };


    const handleDownload = async (blob: BlobResponse) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/blobs/${blob.id}/download`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Download failed');
            const blobData = await response.blob();
            const url = window.URL.createObjectURL(blobData);
            const a = document.createElement('a');
            a.href = url;
            a.download = blob.file_name;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Download failed:', error);
        }
    };

    const renderEmptyState = () => {
        if (!wizardStartType) {
            return (
                <div className="flex flex-col items-center justify-center min-h-[60vh] p-12">
                    <div className="text-center mb-12">
                        <h3 className="industrial-headline text-3xl mb-4 uppercase tracking-widest text-white">Initialize Tech Transfer</h3>
                        <p className="text-industrial-steel-400 font-mono text-sm uppercase tracking-widest">Select your starting point to begin the conversion process</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
                        <button
                            onClick={() => setWizardStartType('bom')}
                            className="industrial-panel p-8 group hover:border-industrial-copper-500 transition-all flex flex-col items-center text-center relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-industrial-steel-800 group-hover:bg-industrial-copper-500 transition-colors"></div>
                            <svg className="w-16 h-16 text-industrial-steel-600 mb-6 group-hover:text-industrial-copper-500 transition-colors group-hover:scale-110 duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className="font-mono text-[10px] uppercase text-industrial-steel-500 mb-2 tracking-[0.2em]">Structured Data</span>
                            <span className="text-xl font-bold text-neutral-200">UPLOAD BOM</span>
                            <p className="text-xs text-industrial-steel-400 mt-4 leading-relaxed font-mono">Start with an existing Bill of Materials. Supports .xlsx, .csv, and legacy reports.</p>
                        </button>

                        <button
                            onClick={() => setWizardStartType('description')}
                            className="industrial-panel p-8 group hover:border-industrial-copper-500 transition-all flex flex-col items-center text-center relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-industrial-steel-800 group-hover:bg-industrial-copper-500 transition-colors"></div>
                            <svg className="w-16 h-16 text-industrial-steel-600 mb-6 group-hover:text-industrial-copper-500 transition-colors group-hover:scale-110 duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            <span className="font-mono text-[10px] uppercase text-industrial-steel-500 mb-2 tracking-[0.2em]">Ideation Phase</span>
                            <span className="text-xl font-bold text-neutral-200">DESCRIBE PRODUCT</span>
                            <p className="text-xs text-industrial-steel-400 mt-4 leading-relaxed font-mono">No documentation? No problem. Describe your product and let AI architect the BOM.</p>
                        </button>

                        <button
                            onClick={() => setWizardStartType('sketch')}
                            className="industrial-panel p-8 group hover:border-industrial-copper-500 transition-all flex flex-col items-center text-center relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-industrial-steel-800 group-hover:bg-industrial-copper-500 transition-colors"></div>
                            <svg className="w-16 h-16 text-industrial-steel-600 mb-6 group-hover:text-industrial-copper-500 transition-colors group-hover:scale-110 duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="font-mono text-[10px] uppercase text-industrial-steel-500 mb-2 tracking-[0.2em]">Visual Input</span>
                            <span className="text-xl font-bold text-neutral-200">UPLOAD SKETCH</span>
                            <p className="text-xs text-industrial-steel-400 mt-4 leading-relaxed font-mono">Analyze physical drawings, 2D blueprints, or whiteboard photos.</p>
                        </button>
                    </div>
                </div>
            );
        }

        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-12">
                <button
                    onClick={() => setWizardStartType(null)}
                    className="mb-8 text-industrial-steel-500 hover:text-industrial-copper-500 flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest transition-colors group"
                >
                    <span className="group-hover:-translate-x-1 transition-transform">←</span> Return to Selection
                </button>

                <div className="industrial-panel p-12 max-w-2xl w-full border border-industrial-concrete bg-industrial-steel-900/20 rounded-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                        <div className="text-[120px] font-black font-mono leading-none">{wizardStartType.toUpperCase()}</div>
                    </div>

                    <div className="flex flex-col items-center text-center relative z-10">
                        {wizardStartType === 'bom' && (
                            <>
                                <div className="w-20 h-20 rounded-full border border-industrial-copper-500/30 flex items-center justify-center mb-6">
                                    <svg className="w-10 h-10 text-industrial-copper-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                </div>
                                <h3 className="industrial-headline text-2xl mb-2">Upload Technical BOM</h3>
                                <p className="text-industrial-steel-400 font-mono text-xs mb-8 max-w-md uppercase tracking-wide">Supported formats: .xlsx, .csv, .xls</p>
                                <label className="industrial-btn px-12 py-4 cursor-pointer flex items-center gap-3">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                    <span>SELECT FILE</span>
                                    <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} accept=".csv,.xlsx,.xls" />
                                </label>
                            </>
                        )}

                        {wizardStartType === 'sketch' && (
                            <>
                                <div className="w-20 h-20 rounded-full border border-industrial-copper-500/30 flex items-center justify-center mb-6">
                                    <svg className="w-10 h-10 text-industrial-copper-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <h3 className="industrial-headline text-2xl mb-2">Process Sketch</h3>
                                <p className="text-industrial-steel-400 font-mono text-xs mb-8 max-w-md uppercase tracking-wide">Upload a drawing or photo of your product concept.</p>
                                <label className="industrial-btn px-12 py-4 cursor-pointer flex items-center gap-3">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                    <span>UPLOAD MEDIA</span>
                                    <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} accept="image/*" />
                                </label>
                            </>
                        )}

                        {wizardStartType === 'description' && (
                            <>
                                <div className="w-20 h-20 rounded-full border border-industrial-copper-500/30 flex items-center justify-center mb-6">
                                    <svg className="w-10 h-10 text-industrial-copper-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                </div>
                                <h3 className="industrial-headline text-2xl mb-2">Product Description</h3>
                                <p className="text-industrial-steel-400 font-mono text-xs mb-6 max-w-md uppercase tracking-wide">Enter the technical specifications and components manually.</p>
                                <textarea
                                    value={productDescription}
                                    onChange={(e) => setProductDescription(e.target.value)}
                                    className="w-full h-48 industrial-input p-4 mb-8 text-sm rounded-sm resize-none focus:border-industrial-copper-500 transition-colors bg-black/40 font-mono"
                                    placeholder="e.g. A portable medical ventilator with a brushless DC motor, aluminum housing, and integrated LCD display..."
                                />
                                <button
                                    onClick={handleConvert}
                                    className="industrial-btn px-12 py-4 w-full flex items-center justify-center gap-3"
                                >
                                    <span>INITIALIZE SYSTEM</span>
                                    <span className="text-xl">⚡</span>
                                </button>
                            </>
                        )}

                        {uploading && (
                            <div className="mt-8 flex flex-col items-center">
                                <div className="w-48 h-1 bg-industrial-steel-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-industrial-copper-500 animate-[progress_2s_infinite]"></div>
                                </div>
                                <div className="mt-2 text-industrial-copper-500 font-mono text-[10px] uppercase tracking-widest animate-pulse">
                                    INGESTING SYSTEM ASSETS...
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const renderVerificationPanel = () => {
        return (
            <div className="flex flex-col h-full max-w-6xl mx-auto w-full p-6 gap-6">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="industrial-headline text-2xl">Verification Station</h2>
                    <div className="flex gap-4">
                        <button
                            onClick={() => handleStageChange('ingestion')}
                            className="bg-industrial-steel-800 text-industrial-steel-400 border border-industrial-concrete hover:bg-industrial-steel-700 hover:text-white px-6 py-2 flex items-center gap-2 rounded-sm text-xs font-mono uppercase transition-colors"
                        >
                            <span>←</span>
                            <span>Back to Ingestion</span>
                        </button>
                        <button
                            onClick={() => handleStageChange('complete')}
                            className="industrial-btn px-6 py-2 flex items-center gap-2"
                        >
                            <span>FINAL APPROVAL</span>
                            <span>→</span>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                    {/* Metadata JSON Editor */}
                    <div className="lg:col-span-2 space-y-6 flex flex-col min-h-0">
                        {/* Phase Management */}
                        <div className="industrial-panel p-6">
                            <h3 className="text-xs font-bold text-industrial-copper-500 uppercase tracking-widest mb-4">Phase Management</h3>
                            <LifecycleTracker
                                steps={lifecycleSteps}
                                currentStep={lifecycleCurrentStep}
                                isEditable={true}
                                onUpdate={handleLifecycleUpdate}
                                onGenerate={handleLifecycleGenerate}
                                isGenerating={isGeneratingLifecycle}
                            />
                        </div>

                        <div className="industrial-panel flex flex-col flex-1 min-h-[400px]">
                            <div className="p-4 border-b border-industrial-concrete bg-industrial-steel-900 flex justify-between items-center">
                                <div>
                                    <h3 className="text-xs font-bold text-industrial-copper-500 uppercase tracking-widest">Central Metadata Definition</h3>
                                    <p className="text-[10px] text-industrial-steel-500 font-mono mt-0.5">Source of Truth for Tech Transfer</p>
                                </div>
                                <button
                                    onClick={handleSaveMetadata}
                                    disabled={isSavingMetadata || !metadataJson}
                                    className="px-4 py-1.5 bg-industrial-copper-500 hover:bg-industrial-copper-400 disabled:opacity-50 text-black font-bold text-[10px] uppercase tracking-widest rounded-sm transition-colors flex items-center gap-2"
                                >
                                    {isSavingMetadata ? 'Saving...' : 'Save Metadata'}
                                    {!isSavingMetadata && <span>💾</span>}
                                </button>
                            </div>
                            <div className="flex-1 relative overflow-hidden bg-black/40 flex flex-col">
                                <ProjectDataEditor
                                    data={metadataJson}
                                    onUpdate={(newData) => {
                                        setMetadataJson(newData);
                                    }}
                                />
                            </div>
                        </div>

                        {/* Side Info / Recommendations */}
                        <div className="space-y-6 overflow-y-auto custom-scrollbar pr-2">
                            <div className="industrial-panel p-6 border-l-4 border-l-industrial-copper-500">
                                <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-4">AI Recommendations</h3>
                                <div className="space-y-4">
                                    {metadataJson?.risk_assessment?.issues?.map((issue: any, idx: number) => (
                                        <div key={idx} className="p-3 bg-red-900/10 border border-red-500/20 rounded-sm">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-red-500">⚠</span>
                                                <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">{issue.severity || 'Risk'}</span>
                                            </div>
                                            <p className="text-[10px] text-neutral-300 font-mono leading-relaxed">{issue.description || issue}</p>
                                        </div>
                                    )) || (
                                            <div className="text-[10px] text-industrial-steel-500 italic font-mono">No critical issues identified.</div>
                                        )}
                                </div>
                                <button
                                    onClick={handleGenerateCritique}
                                    className="w-full mt-6 py-2 border border-industrial-copper-500/30 text-industrial-copper-500 hover:bg-industrial-copper-500/10 text-[10px] font-mono uppercase tracking-widest transition-all"
                                >
                                    Run System Audit
                                </button>
                            </div>

                            {/* Quick View Stats */}
                            <div className="industrial-panel p-6">
                                <h3 className="text-xs font-bold text-industrial-steel-400 uppercase tracking-widest mb-6">Asset Health</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center text-[10px] font-mono">
                                        <span className="text-industrial-steel-500 uppercase">Total Assets</span>
                                        <span className="text-white">{blobs.length}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[10px] font-mono">
                                        <span className="text-industrial-steel-500 uppercase">Revision</span>
                                        <span className="text-industrial-copper-500">{metadataJson?.revision || 'PRE-RELEASE'}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[10px] font-mono">
                                        <span className="text-industrial-steel-500 uppercase">Status</span>
                                        <span className="text-green-500">{metadataJson?.status || 'INGESTING'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-industrial-steel-950/50 border border-industrial-concrete rounded-sm">
                                <h4 className="text-[9px] font-bold text-industrial-steel-500 uppercase tracking-widest mb-2">Usage Note</h4>
                                <p className="text-[10px] font-mono text-industrial-steel-400 leading-relaxed italic">
                                    Modifications made here will update the core metadata.json. Ensure all technical specifications match the source documentation.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderSharedProductView = () => {
        return (
            <div className="flex flex-col h-full max-w-6xl mx-auto w-full p-6 overflow-y-auto custom-scrollbar">
                <div className="flex justify-between items-center mb-8 border-b border-industrial-concrete pb-4">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h2 className="industrial-headline text-3xl">{project?.name || 'Product'} <span className="text-industrial-copper-500">REV. A</span></h2>
                            <span className="px-2 py-0.5 bg-green-900/30 text-green-500 border border-green-500/30 text-[10px] font-mono uppercase tracking-widest rounded-sm">
                                PRODUCTION READY
                            </span>
                        </div>
                        <p className="font-mono text-xs text-industrial-steel-400 uppercase tracking-widest">
                            Authorized Shared Definition • {new Date().toLocaleDateString()}
                        </p>
                    </div>
                    {viewMode === 'manufacturer' && (
                        <button
                            onClick={() => handleStageChange('verification')}
                            className="text-xs font-mono text-industrial-steel-500 hover:text-white flex items-center gap-2 px-3 py-1 border border-industrial-concrete rounded-sm hover:border-industrial-copper-500/50 transition-colors"
                        >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                            </svg>
                            <span>UNLOCK REVISION</span>
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Col: Specs */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="industrial-panel p-6">
                            <h3 className="text-xs font-bold text-industrial-copper-500 uppercase tracking-widest mb-6">Product Definition</h3>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <h4 className="text-[10px] text-industrial-steel-500 font-mono uppercase mb-2">Primary Description</h4>
                                    <p className="text-sm font-mono text-neutral-200 leading-relaxed">
                                        {productDescription || "Full technical specification defined in attached documentation."}
                                    </p>
                                </div>
                                <div className="space-y-4">
                                    {lifecycleSteps.length > 0 && (
                                        <div>
                                            <h4 className="text-[10px] text-industrial-steel-500 font-mono uppercase mb-2">Current Phase</h4>
                                            <div className="flex items-center justify-between gap-4">
                                                <div className="text-sm font-bold text-white border-l-2 border-industrial-copper-500 pl-3 flex-1">
                                                    {lifecycleSteps[lifecycleCurrentStep]}
                                                </div>

                                                {viewMode === 'manufacturer' && (
                                                    <div className="flex gap-1">
                                                        <button
                                                            onClick={() => handleLifecycleUpdate(lifecycleSteps, Math.max(0, lifecycleCurrentStep - 1))}
                                                            disabled={lifecycleCurrentStep === 0}
                                                            className="p-1 px-2 border border-industrial-concrete bg-industrial-steel-900 text-industrial-steel-400 hover:text-white hover:border-industrial-copper-500 disabled:opacity-30 disabled:hover:text-industrial-steel-400 disabled:hover:border-industrial-concrete rounded-sm transition-all"
                                                        >
                                                            ←
                                                        </button>
                                                        <button
                                                            onClick={() => handleLifecycleUpdate(lifecycleSteps, Math.min(lifecycleSteps.length - 1, lifecycleCurrentStep + 1))}
                                                            disabled={lifecycleCurrentStep === lifecycleSteps.length - 1}
                                                            className="p-1 px-2 border border-industrial-concrete bg-industrial-steel-900 text-industrial-steel-400 hover:text-white hover:border-industrial-copper-500 disabled:opacity-30 disabled:hover:text-industrial-steel-400 disabled:hover:border-industrial-concrete rounded-sm transition-all"
                                                        >
                                                            →
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                            {viewMode === 'manufacturer' && (
                                                <div className="mt-2 w-full h-1 bg-industrial-steel-800 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-industrial-copper-500 transition-all duration-500"
                                                        style={{ width: `${((lifecycleCurrentStep + 1) / lifecycleSteps.length) * 100}%` }}
                                                    ></div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    <div>
                                        <h4 className="text-[10px] text-industrial-steel-500 font-mono uppercase mb-2">Total Components</h4>
                                        <div className="text-sm font-bold text-white">
                                            {Object.values(csvData).reduce((acc, rows) => acc + (rows.length > 1 ? rows.length - 1 : 0), 0) || "N/A"}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Artifacts Download */}
                        <div className="industrial-panel p-6">
                            <h3 className="text-xs font-bold text-industrial-copper-500 uppercase tracking-widest mb-6">Master Records</h3>
                            <div className="space-y-2">
                                {blobs.map(blob => (
                                    <div key={blob.id} className="flex items-center justify-between p-3 hover:bg-white/5 border-b border-industrial-concrete/30 transition-colors group">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-industrial-steel-900 rounded-sm">
                                                <svg className="w-4 h-4 text-industrial-steel-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <div className="text-sm font-mono text-neutral-200 group-hover:text-white">{blob.file_name}</div>
                                                <div className="text-[10px] text-industrial-steel-500 uppercase">
                                                    {(blob.size / 1024).toFixed(1)} KB • {new Date(blob.created_at).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDownload(blob)}
                                            className="px-4 py-2 bg-industrial-steel-800 hover:bg-industrial-copper-500 hover:text-white rounded-sm text-[10px] font-bold uppercase tracking-wider transition-all"
                                        >
                                            Download
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Col: JSON / Structure */}
                    <div className="industrial-panel p-0 overflow-hidden flex flex-col">
                        <div className="p-4 border-b border-industrial-concrete bg-industrial-steel-900">
                            <h3 className="text-xs font-bold text-industrial-copper-500 uppercase tracking-widest">Metadata Source</h3>
                        </div>
                        <div className="flex-1 overflow-auto bg-black/40">
                            <ProjectDataEditor
                                data={metadataJson || {}}
                                readOnly={true}
                            />
                        </div>
                        <div className="p-4 bg-industrial-steel-900 border-t border-industrial-concrete">
                            <button className="w-full py-2 bg-industrial-copper-500 hover:bg-industrial-copper-400 text-black font-bold text-xs uppercase tracking-widest rounded-sm transition-colors">
                                Export Full Package
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const renderDesignerIngestionView = () => {
        return (
            <div className="flex-1 flex">
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="industrial-headline text-2xl">Joint Ingestion Workspace</h2>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="text-[10px] font-mono text-industrial-steel-400 uppercase tracking-widest">Live Session</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        {/* Shared Data List */}
                        <div className="industrial-panel p-6">
                            <h3 className="text-xs font-bold text-industrial-copper-500 uppercase tracking-widest mb-4">Shared Data Repository</h3>
                            {blobs.length === 0 ? (
                                <div className="p-8 border-2 border-dashed border-industrial-concrete rounded-sm flex flex-col items-center justify-center text-center">
                                    <p className="text-industrial-steel-500 text-sm font-mono mb-4">No shared files yet.</p>
                                    <p className="text-xs text-industrial-steel-600 max-w-xs">Upload specifications, drawings, or requirements to begin the collaboration.</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {blobs.map(blob => (
                                        <div key={blob.id} className="flex items-center justify-between p-3 bg-industrial-steel-900 border border-industrial-concrete rounded-sm">
                                            <div className="flex items-center gap-3">
                                                <svg className="w-4 h-4 text-industrial-steel-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                <span className="text-sm font-mono text-neutral-200">{blob.file_name}</span>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="text-[10px] text-industrial-steel-600 uppercase font-mono">{(blob.size / 1024).toFixed(1)} KB</span>
                                                <button onClick={() => handleDownload(blob)} className="text-industrial-copper-500 hover:text-white text-[10px] font-bold uppercase tracking-wider">Download</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="mt-6 pt-6 border-t border-industrial-concrete">
                                <label className="industrial-btn w-full py-4 flex items-center justify-center gap-2 cursor-pointer">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                    <span>UPLOAD NEW ARTIFACT</span>
                                    <input type="file" className="hidden" onChange={handleFileUpload} multiple />
                                </label>
                            </div>
                        </div>

                        {/* Status Card */}
                        <div className="p-4 bg-industrial-steel-900/50 border border-industrial-concrete rounded-sm">
                            <h3 className="text-[10px] font-bold text-industrial-steel-500 uppercase tracking-widest mb-2">Session Status</h3>
                            <p className="text-sm font-mono text-neutral-300">
                                Manufacturer is currently analyzing inputs. Please stay in the chat for clarification requests.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Shared Chat Panel */}
                <div
                    ref={resizeRef}
                    className="border-l border-industrial-concrete bg-industrial-steel-900/50 flex flex-col h-full relative"
                    style={{ width: `${chatPanelWidth}px` }}
                >
                    <div
                        onMouseDown={handleResizeStart}
                        className={`absolute left-0 top-0 bottom-0 w-1 cursor-ew-resize z-10 transition-colors hover:bg-industrial-copper-500/50 ${isResizing ? 'bg-industrial-copper-500' : 'bg-industrial-copper-500/20'}`}
                    />
                    <ChatInterface
                        sessionId={selectedSession!.id}
                        blobs={blobs}
                        onRefreshBlobs={() => loadSessionData(selectedSession!.id)}
                        initialMessage={SYSTEM_PROMPT}
                        refreshTrigger={chatRefreshTrigger}
                    />
                </div>
            </div>
        );
    }

    const renderPreparationView = () => {
        return (
            <div className="flex flex-col h-full max-w-6xl mx-auto w-full p-6 gap-6 animate-in slide-in-from-bottom-4 duration-500">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="industrial-headline text-2xl">Preparation Station</h2>
                    <div className="flex gap-4">
                        <button
                            onClick={() => handleStageChange('ingestion')}
                            className="bg-industrial-steel-800 text-industrial-steel-400 border border-industrial-concrete hover:bg-industrial-steel-700 hover:text-white px-6 py-2 flex items-center gap-2 rounded-sm text-xs font-mono uppercase transition-colors"
                        >
                            <span>←</span>
                            <span>Back to Ingestion</span>
                        </button>
                        <button
                            onClick={() => handleStageChange('verification')}
                            disabled={!metadataJson || processing}
                            className="industrial-btn px-6 py-2 flex items-center gap-2 disabled:opacity-50 disabled:grayscale"
                        >
                            <span>PROCEED TO VERIFICATION</span>
                            <span>→</span>
                        </button>
                    </div>
                </div>

                <div className="industrial-panel p-6 flex-1 min-h-0 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xs font-bold text-industrial-copper-500 uppercase tracking-widest flex items-center gap-2">
                            <span className="text-xl">❖</span> Core Metadata Definition
                        </h3>
                        <div className="flex gap-4">
                            {processing && (
                                <div className="flex items-center gap-2 text-industrial-copper-500">
                                    <span className="animate-spin">⟳</span>
                                    <span className="text-[10px] font-mono uppercase tracking-widest">{processingStatus}</span>
                                </div>
                            )}
                            <button
                                onClick={handleGenerateMetadata}
                                disabled={processing}
                                className="px-4 py-2 border border-industrial-copper-500 text-industrial-copper-500 hover:bg-industrial-copper-500/10 text-[10px] font-mono uppercase tracking-widest rounded-sm transition-colors flex items-center gap-2 disabled:opacity-50"
                            >
                                {metadataJson ? 'Re-Generate Metadata' : 'Initialize Metadata Analysis'}
                                <span className="text-lg">⚡</span>
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar bg-industrial-steel-900/30 border border-industrial-concrete rounded-sm p-4">
                        {processing ? (
                            <div className="flex flex-col items-center justify-center h-full gap-6">
                                <div className="w-24 h-24 relative">
                                    <div className="absolute inset-0 border-4 border-industrial-steel-800 rounded-full"></div>
                                    <div className="absolute inset-0 border-4 border-industrial-copper-500 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                                <div className="text-center">
                                    <h4 className="text-industrial-copper-500 font-mono text-sm uppercase tracking-widest mb-2">AI Agent Working</h4>
                                    <p className="text-industrial-steel-400 font-mono text-xs">{processingStatus}</p>
                                </div>
                            </div>
                        ) : metadataJson ? (
                            <MetadataEditor
                                metadata={metadataJson}
                                onChange={(newMeta) => setMetadataJson(newMeta)}
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center p-12">
                                <div className="w-20 h-20 bg-industrial-steel-800 rounded-full flex items-center justify-center mb-6">
                                    <span className="text-4xl">?</span>
                                </div>
                                <h3 className="text-white text-lg font-bold mb-2">Metadata Not Initialized</h3>
                                <p className="text-industrial-steel-400 max-w-md text-sm mb-8">
                                    The Core Metadata object has not been generated yet.
                                    Click the button above to have the AI analyze your ingested files and construct the initial definition.
                                </p>
                                <button
                                    onClick={handleGenerateMetadata}
                                    className="industrial-btn px-8 py-3 text-sm"
                                >
                                    START ANALYSIS
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Footer Actions */}
                    {metadataJson && !processing && (
                        <div className="mt-6 flex justify-end border-t border-industrial-concrete pt-4">
                            <button
                                onClick={handleSaveMetadata}
                                disabled={isSavingMetadata}
                                className="industrial-btn px-6 py-2 flex items-center gap-2 text-xs"
                            >
                                {isSavingMetadata ? 'SAVING...' : 'SAVE CHANGES'}
                                <span>💾</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderIngestionWorkbench = () => {

        const images = blobs.filter(b => b.content_type.startsWith('image/') || b.file_name.toLowerCase().endsWith('.png') || b.file_name.toLowerCase().endsWith('.jpg'));
        const documents = blobs.filter(b =>
            b.content_type === 'application/pdf' ||
            b.file_name.toLowerCase().endsWith('.pdf') ||
            b.content_type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
            b.file_name.toLowerCase().endsWith('.docx')
        );
        const csvs = blobs.filter(b => b.content_type === 'text/csv' || b.file_name.toLowerCase().endsWith('.csv'));
        const others = blobs.filter(b => !images.includes(b) && !documents.includes(b) && !csvs.includes(b));

        const getToken = () => localStorage.getItem('token');

        const renderComments = (blobId: string) => (
            <div className="p-3 bg-industrial-steel-900/80 border-t border-industrial-concrete">
                {(comments[blobId]?.length || 0) > 0 && (
                    <div className="space-y-2 mb-3">
                        <h5 className="text-[9px] font-mono uppercase text-industrial-steel-500 tracking-wider">Comments</h5>
                        {comments[blobId].map((c, i) => (
                            <div key={i} className="text-[10px] text-industrial-steel-300 font-mono pl-2 border-l-2 border-industrial-copper-500/50">
                                {c}
                            </div>
                        ))}
                    </div>
                )}
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Add comment..."
                        className="flex-1 industrial-input px-2 py-1 text-[10px] rounded-sm font-mono"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleAddComment(blobId, e.currentTarget.value);
                                e.currentTarget.value = '';
                            }
                        }}
                    />
                </div>
            </div>
        );

        return (
            <div className="flex flex-col max-w-6xl mx-auto w-full p-6 gap-6 pb-12">

                <LifecycleTracker
                    steps={lifecycleSteps}
                    currentStep={lifecycleCurrentStep}
                    isEditable={viewMode === 'manufacturer'}
                    onUpdate={handleLifecycleUpdate}
                    onGenerate={handleLifecycleGenerate}
                    isGenerating={isGeneratingLifecycle || processing || selectedSession?.status === 'processing'}
                />

                {/* 1. Results Preview Section (Top for visibility) */}
                {(images.length > 0 || documents.length > 0 || csvs.length > 0) && (
                    <div className="industrial-panel p-6 rounded-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xs font-bold text-industrial-copper-500 uppercase tracking-widest font-mono flex items-center gap-2">
                                <span className="animate-pulse">●</span> Generator Output
                            </h3>
                            <button
                                onClick={handleGenerateCritique}
                                className="px-3 py-1.5 border border-industrial-copper-500/50 text-industrial-copper-500 hover:bg-industrial-copper-500/10 text-[10px] font-mono uppercase tracking-widest rounded-sm transition-colors flex items-center gap-2"
                            >
                                <span className="text-sm">⚠</span> Generate Critique
                            </button>
                        </div>

                        {/* Images Grid */}
                        {images.length > 0 && (
                            <div className="mb-8">
                                <h4 className="text-[10px] text-industrial-steel-500 font-mono uppercase mb-2">Visualizations</h4>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {images.map(img => (
                                        <div key={img.id} className="border border-industrial-concrete bg-black/20 rounded-sm overflow-hidden flex flex-col">
                                            <div className="relative group">
                                                <img
                                                    src={`${import.meta.env.VITE_API_URL}/api/blobs/${img.id}/download?token=${getToken()}`}
                                                    className="w-full h-48 object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                                    alt={img.file_name}
                                                    onError={(e) => {
                                                        const target = e.target as HTMLImageElement;
                                                        fetch(`${import.meta.env.VITE_API_URL}/api/blobs/${img.id}/download`, { headers: { 'Authorization': `Bearer ${getToken()}` } })
                                                            .then(r => r.blob())
                                                            .then(b => target.src = URL.createObjectURL(b));
                                                    }}
                                                />
                                                <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/70 text-[10px] font-mono text-white truncate">
                                                    {img.file_name}
                                                </div>
                                            </div>
                                            {renderComments(img.id)}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* CSV Tables */}
                        {csvs.length > 0 && (
                            <div className="mb-8">
                                <h4 className="text-[10px] text-industrial-steel-500 font-mono uppercase mb-2">Data Tables</h4>
                                <div className="space-y-4">
                                    {csvs.map(csv => (
                                        <div key={csv.id} className="border border-industrial-concrete bg-industrial-steel-900/50 rounded-sm overflow-hidden">
                                            <div className="bg-industrial-steel-800/50 px-3 py-1 flex justify-between items-center border-b border-industrial-concrete">
                                                <span className="text-[10px] font-mono font-bold text-industrial-steel-300">{csv.file_name}</span>
                                                <div className="flex gap-4">
                                                    <button onClick={() => handleSaveCsv(csv)} className="text-[10px] text-industrial-copper-500 hover:underline font-bold">Save Changes</button>
                                                    <button onClick={() => handleDownload(csv)} className="text-[10px] text-industrial-steel-500 hover:underline">Download CSV</button>
                                                </div>
                                            </div>
                                            <div className="overflow-x-auto custom-scrollbar max-h-60">
                                                <table className="w-full text-xs font-mono text-left">
                                                    <thead>
                                                        {csvData[csv.id]?.[0]?.map((header, i) => (
                                                            <th key={i} className="bg-industrial-steel-950 p-2 border-b border-industrial-concrete text-industrial-steel-400 whitespace-nowrap">{header}</th>
                                                        ))}
                                                    </thead>
                                                    <tbody>
                                                        {csvData[csv.id]?.slice(1).map((row, i) => (
                                                            <tr key={i} className="border-b border-industrial-concrete/20 hover:bg-white/5">
                                                                {row.map((cell, j) => (
                                                                    <td key={j} className="p-0 border-r border-industrial-concrete/20 last:border-0 whitespace-nowrap text-industrial-steel-300">
                                                                        <input
                                                                            type="text"
                                                                            value={cell}
                                                                            onChange={(e) => handleCellChange(csv.id, i + 1, j, e.target.value)}
                                                                            className="w-full h-full bg-transparent p-2 text-industrial-steel-300 focus:bg-industrial-steel-800 focus:outline-none focus:text-white transition-colors"
                                                                        />
                                                                    </td>
                                                                ))}
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                            {renderComments(csv.id)}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Documents (PDF & Word) */}
                        {documents.length > 0 && (
                            <div className="mb-8">
                                <h4 className="text-[10px] text-industrial-steel-500 font-mono uppercase mb-2">Documentation</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {documents.map(doc => {
                                        const isPdf = doc.content_type === 'application/pdf' || doc.file_name.toLowerCase().endsWith('.pdf');
                                        return (
                                            <div key={doc.id} className="border border-industrial-concrete bg-industrial-steel-900/50 flex flex-col min-h-96 relative group">
                                                <div className="bg-industrial-steel-800/50 px-3 py-1 flex justify-between items-center border-b border-industrial-concrete">
                                                    <span className="text-[10px] font-mono font-bold text-industrial-steel-300 truncate max-w-[200px]">{doc.file_name}</span>
                                                    <button onClick={() => handleDownload(doc)} className="text-[10px] text-industrial-copper-500 hover:underline">Download</button>
                                                </div>

                                                <div className="flex-1 flex flex-col h-96">
                                                    {isPdf ? (
                                                        <iframe
                                                            src={`${import.meta.env.VITE_API_URL}/api/blobs/${doc.id}/download?token=${getToken()}`}
                                                            className="w-full flex-1"
                                                            title={doc.file_name}
                                                            onLoad={(e) => {
                                                                const iframe = e.target as HTMLIFrameElement;
                                                                if (!iframe.src || iframe.src === 'about:blank') {
                                                                    fetch(`${import.meta.env.VITE_API_URL}/api/blobs/${doc.id}/download`, { headers: { 'Authorization': `Bearer ${getToken()}` } })
                                                                        .then(r => r.blob())
                                                                        .then(b => iframe.src = URL.createObjectURL(b));
                                                                }
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="flex-1 flex flex-col items-center justify-center gap-4 bg-industrial-steel-950/30">
                                                            <div className="w-16 h-16 rounded bg-blue-900/20 flex items-center justify-center border border-blue-500/30">
                                                                <span className="text-2xl">W</span>
                                                            </div>
                                                            <div className="text-center px-4">
                                                                <p className="text-xs text-industrial-steel-400 font-mono mb-2">Word Document Preview Unavailable</p>
                                                                <button
                                                                    onClick={() => handleDownload(doc)}
                                                                    className="px-4 py-2 bg-industrial-steel-800 hover:bg-industrial-steel-700 border border-industrial-concrete rounded-sm text-xs text-industrial-copper-500 font-mono"
                                                                >
                                                                    Download to View
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                                {renderComments(doc.id)}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                    </div>
                )}


                {/* 2. Control & Input Panel */}
                <div className="industrial-panel p-6 rounded-sm relative overflow-hidden">
                    {/* ... (Existing Control Panel Content) ... */}
                    <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                        <div className="text-[80px] font-black font-mono leading-none">TRANSFER</div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
                        {/* Source Files List (Filtered to Others/Inputs) */}
                        <div className="flex-1 w-full">
                            <h3 className="text-xs font-bold text-industrial-steel-400 uppercase tracking-widest mb-4 font-mono">Raw Input Files</h3>
                            <div className="space-y-2 mb-4">
                                {others.length === 0 && <div className="text-xs text-industrial-steel-600 italic">No raw documents found.</div>}
                                {others.map(blob => (
                                    <div key={blob.id} className="flex items-center justify-between p-3 bg-industrial-steel-950/50 border border-industrial-concrete rounded-sm">
                                        <div className="flex items-center gap-3">
                                            <svg className="w-5 h-5 text-industrial-copper-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            <div>
                                                <div className="text-sm font-bold text-neutral-200">{blob.file_name}</div>
                                                <div className="text-[10px] text-industrial-steel-500 font-mono uppercase">{(blob.size / 1024).toFixed(1)} KB</div>
                                            </div>
                                        </div>
                                        <button onClick={() => handleDownload(blob)} className="text-industrial-steel-500 hover:text-industrial-copper-500">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                        </button>
                                    </div>
                                ))}
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    <label className="flex items-center justify-center p-3 border border-dashed border-industrial-concrete hover:border-industrial-copper-500/50 rounded-sm cursor-pointer transition-colors group">
                                        <span className="text-xs font-mono text-industrial-steel-500 group-hover:text-industrial-copper-500 uppercase">+ Add File</span>
                                        <input type="file" className="hidden" onChange={handleFileUpload} multiple />
                                    </label>
                                    <button
                                        onClick={() => setShowTextEntryModal(true)}
                                        className="flex items-center justify-center p-3 border border-dashed border-industrial-concrete hover:border-industrial-copper-500/50 rounded-sm cursor-pointer transition-colors group"
                                    >
                                        <span className="text-xs font-mono text-industrial-steel-500 group-hover:text-industrial-copper-500 uppercase">+ Add Note</span>
                                    </button>
                                </div>
                            </div>
                        </div>


                        {/* 3. Status Panel */}
                        <div className="flex-1 w-full border-l border-industrial-concrete md:pl-8 flex flex-col">
                            <div className="flex-1 flex flex-col items-center justify-center gap-6">
                                {(wizardStep === 3 || selectedSession?.status === 'processing') ? (
                                    <>
                                        <div className="relative w-24 h-24 flex items-center justify-center">
                                            <div className="absolute inset-0 border-4 border-industrial-steel-800 rounded-full"></div>
                                            <div className="absolute inset-0 border-4 border-industrial-copper-500 border-t-transparent rounded-full animate-spin"></div>
                                            <span className="text-2xl animate-pulse">⟳</span>
                                        </div>
                                        <div className="text-center">
                                            <h3 className="text-lg industrial-headline text-industrial-copper-500 mb-2">PROCESSING</h3>
                                            <p className="text-sm font-mono text-industrial-steel-400 max-w-[200px]">{processingStatus || "Analyzing System Inputs..."}</p>
                                        </div>
                                        <button
                                            onClick={handleCancel}
                                            className="mt-4 px-6 py-2 bg-red-900/20 hover:bg-red-900/40 border border-red-500/50 text-red-500 text-[10px] font-mono uppercase tracking-widest rounded-sm transition-all"
                                        >
                                            Abort Process
                                        </button>
                                    </>
                                ) : selectedSession?.status === 'cancelled' ? (
                                    <>
                                        <div className="w-16 h-16 rounded-full bg-yellow-900/20 border-2 border-yellow-500/50 flex items-center justify-center mb-2">
                                            <span className="text-2xl text-yellow-500">!</span>
                                        </div>
                                        <div className="text-center mb-6">
                                            <h3 className="text-lg industrial-headline text-yellow-500 mb-1">CANCELLED</h3>
                                            <p className="text-xs font-mono text-industrial-steel-400">Operation was terminated by user.</p>
                                        </div>
                                        <button
                                            onClick={() => { setWizardStep(1); setSelectedDocs([]); }}
                                            className="px-6 py-2 industrial-btn text-xs"
                                        >
                                            RETRY BATCH
                                        </button>
                                    </>
                                ) : (selectedSession?.status === 'error' && wizardStep !== 4) ? (
                                    <>
                                        <div className="w-16 h-16 rounded-full bg-red-900/20 border-2 border-red-500/50 flex items-center justify-center mb-2">
                                            <span className="text-2xl text-red-500">!</span>
                                        </div>
                                        <div className="text-center mb-6">
                                            <h3 className="text-lg industrial-headline text-red-500 mb-1">EXECUTION ERROR</h3>
                                            <p className="text-xs font-mono text-industrial-steel-400">The agent encountered a failure.</p>
                                        </div>
                                        <div className="flex flex-col gap-3 w-full max-w-xs">
                                            <button
                                                onClick={() => setWizardStep(4)}
                                                className="px-6 py-2 bg-industrial-steel-800 border border-industrial-copper-500/30 hover:bg-industrial-copper-500/10 hover:text-white text-industrial-copper-500 text-xs font-mono uppercase transition-all"
                                            >
                                                IGNORE & CONTINUE
                                            </button>
                                            <div className="flex gap-3 justify-center">
                                                <button
                                                    onClick={handleRetry}
                                                    className="px-6 py-2 industrial-btn text-xs flex-1"
                                                >
                                                    RETRY
                                                </button>
                                                <button
                                                    onClick={() => { setWizardStep(1); setSelectedDocs([]); }}
                                                    className="px-6 py-2 bg-industrial-steel-800 hover:bg-industrial-steel-700 border border-industrial-concrete rounded-sm text-xs font-mono uppercase flex-1"
                                                >
                                                    RESET
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-16 h-16 rounded-full bg-green-900/20 border-2 border-green-500/50 flex items-center justify-center mb-2">
                                            <span className="text-2xl text-green-500">✓</span>
                                        </div>
                                        <div className="text-center mb-6">
                                            <h3 className="text-lg industrial-headline text-white mb-1">STATUS: {(selectedSession?.status || 'IDLE').toUpperCase()}</h3>
                                            <p className="text-xs font-mono text-industrial-steel-400">System Ready.</p>
                                        </div>
                                        <button
                                            onClick={() => handleStageChange('preparation')}
                                            className="px-6 py-2 industrial-btn text-xs mb-3 w-full group relative"
                                        >
                                            PROCEED TO PREPARATION
                                        </button>
                                        <button
                                            onClick={() => setShowCreateModal(true)}
                                            className="text-[10px] text-industrial-steel-500 hover:text-white uppercase tracking-widest"
                                        >
                                            START NEW SESSION
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Status Bar (replaces system log) */}
                {processing && (
                    <div className="fixed bottom-0 left-0 right-0 bg-industrial-steel-900/90 border-t border-industrial-copper-500/50 p-2 z-50 flex items-center justify-between px-6 backdrop-blur">
                        <div className="flex items-center gap-4">
                            <span className="w-2 h-2 bg-industrial-copper-500 animate-pulse rounded-full"></span>
                            <span className="font-mono text-xs text-industrial-copper-500 uppercase tracking-widest">{processingStatus}</span>
                        </div>
                        <div className="flex gap-1">
                            {selectedDocs.map((doc, i) => (
                                <div key={i} className={`w-2 h-2 rounded-full ${processingStatus.includes(doc) ? 'bg-industrial-copper-500 animate-bounce' : 'bg-industrial-steel-800'}`}></div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-industrial-steel-950 flex items-center justify-center">
                <div className="text-industrial-steel-400 font-mono uppercase tracking-wider animate-pulse">Initializing Core...</div>
            </div>
        );
    }

    return (
        <div className="h-screen bg-industrial-steel-950 text-neutral-100 flex flex-col metal-texture overflow-hidden">
            {/* Header */}
            <header className="border-b border-industrial-concrete bg-industrial-steel-900/80 backdrop-blur-sm sticky top-0 z-50">
                <div className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => {
                                if (selectedSession && window.innerWidth < 1024) {
                                    setSelectedSession(null);
                                } else {
                                    navigate('/dashboard');
                                }
                            }}
                            className="text-industrial-steel-400 hover:text-industrial-copper-500 transition-colors font-mono text-sm uppercase"
                        >
                            ← {viewMode === 'designer' ? 'All Sessions' : 'Back'}
                        </button>
                        <h1 className="industrial-headline text-xl">{project?.name} <span className="text-industrial-steel-600 mx-2">//</span> TECH TRANSFER SUITE</h1>
                    </div>

                    <div className="flex bg-industrial-steel-900 border border-industrial-concrete rounded-sm p-0.5">
                        <span className="px-4 py-1.5 text-[10px] uppercase font-mono tracking-widest bg-industrial-copper-500/10 text-industrial-copper-500 rounded-sm">
                            {viewMode.charAt(0).toUpperCase() + viewMode.slice(1)} View
                        </span>
                    </div>

                    <button onClick={() => setShowCreateModal(true)} className="px-4 py-2 industrial-btn rounded-sm text-xs">+ New Session</button>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Minimal History Sidebar - Hidden for Designers */}
                <div className={`border-r border-industrial-concrete bg-industrial-steel-900/50 overflow-y-auto scanlines lg:w-64 ${viewMode === 'designer' || selectedSession ? 'hidden lg:block' : 'w-full block'}`}>
                    <div className="p-4">
                        <h2 className="text-[10px] font-bold text-industrial-steel-500 uppercase tracking-widest mb-4 font-mono">History</h2>
                        {sessions.length === 0 ? (
                            <div className="text-center py-8 text-industrial-steel-500 text-xs font-mono italic">
                                No history
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {sessions.map(s => (
                                    <div
                                        key={s.id}
                                        className={`flex items-center justify-between w-full p-2 rounded-sm transition-all group ${selectedSession?.id === s.id
                                            ? 'bg-industrial-copper-500/10 border-l-2 border-industrial-copper-500'
                                            : 'hover:bg-industrial-steel-800'
                                            }`}
                                    >
                                        <button
                                            onClick={() => setSelectedSession(s)}
                                            className={`flex-1 text-left text-xs font-mono truncate ${selectedSession?.id === s.id
                                                ? 'text-industrial-copper-500'
                                                : 'text-industrial-steel-400'
                                                }`}
                                        >
                                            {s.title || 'Untitled Operation'}
                                        </button>
                                        <button
                                            onClick={(e) => handleDeleteSession(e, s.id)}
                                            className="opacity-0 group-hover:opacity-100 text-industrial-steel-600 hover:text-red-500 transition-colors p-1"
                                            title="Delete Session"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Content */}
                <div className={`flex-1 flex flex-col bg-industrial-steel-950 overflow-hidden relative ${selectedSession ? 'flex' : 'hidden lg:flex'}`}>
                    {!selectedSession ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center text-industrial-steel-500">
                                <p className="font-mono uppercase tracking-wide text-sm">Select or Create a Session to Begin</p>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col">
                            {/* DESIGNER VIEW */}
                            {viewMode === 'designer' && (
                                <div className="flex-1 flex overflow-hidden">
                                    {workflowStage === 'ingestion' && renderDesignerIngestionView()}

                                    {workflowStage === 'verification' && (
                                        <div className="flex-1 flex flex-col items-center justify-center p-6 overflow-y-auto">
                                            <div className="w-20 h-20 mb-6 bg-industrial-copper-500/10 rounded-full flex items-center justify-center border border-industrial-copper-500/30">
                                                <span className="text-3xl">🔍</span>
                                            </div>
                                            <h2 className="text-xl industrial-headline text-white mb-2">Verification Phase</h2>
                                            <p className="text-industrial-steel-400 font-mono text-sm max-w-md text-center mb-8">
                                                The manufacturer is verifying the BOM, suppliers, and generated documentation.
                                                <br />
                                                Review will be available shortly.
                                            </p>

                                            {/* Allow chat during verification too? User asked for ingestion, but usually chat is good everywhere. 
                                                For now keeping it restricted as per previous design, unless requested. 
                                                Actually, let's allow chat in a collapsed/minimized way or just keep the focus on status. 
                                                The user specificially asked for chat "during ingestion phase". 
                                            */}
                                        </div>
                                    )}

                                    {workflowStage === 'complete' && (
                                        <div className="flex-1 overflow-y-auto">
                                            {renderSharedProductView()}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* MANUFACTURER VIEW */}
                            {viewMode === 'manufacturer' && (
                                <div className="flex-1 flex overflow-hidden">
                                    <div className="flex-1 flex flex-col min-h-0 overflow-y-auto custom-scrollbar">
                                        {workflowStage === 'ingestion' && (
                                            <>
                                                {(blobs.length === 0 && wizardStep === 1) ? renderEmptyState() : renderIngestionWorkbench()}
                                            </>
                                        )}
                                        {workflowStage === 'preparation' && renderPreparationView()}
                                        {workflowStage === 'verification' && renderVerificationPanel()}
                                        {workflowStage === 'complete' && renderSharedProductView()}
                                    </div>
                                    <div
                                        ref={resizeRef}
                                        className="hidden lg:flex border-l border-industrial-concrete bg-industrial-steel-900/50 flex-col h-full relative"
                                        style={{ width: `${chatPanelWidth}px` }}
                                    >
                                        <div
                                            onMouseDown={handleResizeStart}
                                            className={`absolute left-0 top-0 bottom-0 w-1 cursor-ew-resize z-10 transition-colors hover:bg-industrial-copper-500/50 ${isResizing ? 'bg-industrial-copper-500' : 'bg-industrial-copper-500/20'}`}
                                        />
                                        <ChatInterface
                                            sessionId={selectedSession.id}
                                            blobs={blobs}
                                            onRefreshBlobs={() => loadSessionData(selectedSession.id)}
                                            initialMessage={SYSTEM_PROMPT}
                                            refreshTrigger={chatRefreshTrigger}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50 backdrop-blur-sm" onClick={() => setShowCreateModal(false)}>
                    <div className="industrial-panel rounded-sm p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
                        <h3 className="industrial-headline text-xl mb-4">New Operation</h3>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            if (!projectId) return;
                            ControllersSessionsService.add({ title: newSessionTitle, content: '', project_id: projectId })
                                .then((newSession) => {
                                    setShowCreateModal(false);
                                    setNewSessionTitle('');
                                    loadProjectAndSessions().then(() => {
                                        setSelectedSession(newSession);
                                    });
                                });
                        }} className="space-y-4">
                            <input
                                type="text"
                                value={newSessionTitle}
                                onChange={(e) => setNewSessionTitle(e.target.value)}
                                className="w-full px-4 py-2 industrial-input rounded-sm"
                                placeholder="Operation Name"
                                autoFocus
                            />
                            <div className="flex gap-3">
                                <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 px-4 py-2 bg-industrial-steel-800 hover:bg-industrial-steel-700 rounded-sm font-bold text-xs uppercase">Cancel</button>
                                <button type="submit" className="flex-1 px-4 py-2 industrial-btn rounded-sm text-xs">Initialize</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Text Entry Modal */}
            {showTextEntryModal && (
                <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50 backdrop-blur-sm" onClick={() => setShowTextEntryModal(false)}>
                    <div className="industrial-panel rounded-sm p-6 w-full max-w-2xl" onClick={e => e.stopPropagation()}>
                        <h3 className="industrial-headline text-xl mb-4">Add Manual Note</h3>
                        <form onSubmit={handleSaveTextEntry} className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-mono text-industrial-steel-400 uppercase tracking-widest mb-2">Note Title / Filename</label>
                                <input
                                    type="text"
                                    value={textEntryTitle}
                                    onChange={(e) => setTextEntryTitle(e.target.value)}
                                    className="w-full px-4 py-2 industrial-input rounded-sm font-mono text-sm"
                                    placeholder="e.g. User Requirements"
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-mono text-industrial-steel-400 uppercase tracking-widest mb-2">Content</label>
                                <textarea
                                    value={textEntryContent}
                                    onChange={(e) => setTextEntryContent(e.target.value)}
                                    className="w-full h-64 px-4 py-4 industrial-input rounded-sm font-mono text-xs resize-none leading-relaxed"
                                    placeholder="Enter unstructured text data here..."
                                />
                            </div>
                            <div className="flex gap-3 justify-end pt-4 border-t border-industrial-concrete">
                                <button
                                    type="button"
                                    onClick={() => setShowTextEntryModal(false)}
                                    className="px-6 py-2 bg-industrial-steel-800 hover:bg-industrial-steel-700 rounded-sm font-bold text-xs uppercase transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSavingTextEntry || !textEntryTitle.trim() || !textEntryContent.trim()}
                                    className="px-6 py-2 industrial-btn rounded-sm text-xs flex items-center gap-2"
                                >
                                    {isSavingTextEntry ? 'Saving...' : 'Save Note'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
