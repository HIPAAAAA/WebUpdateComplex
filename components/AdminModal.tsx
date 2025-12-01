import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, Image as ImageIcon, Check, Lock, Plus, Trash2, Type, Heading, Bold, Italic, LogOut, Edit2, User, Key, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { UpdateFeature, TagType, ContentBlock } from '../types';
import { saveUpdate, updateUpdate, deleteUpdate, fileToBase64, getStoredUpdates, getUpdateDetails } from '../services/storage';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateAdded: () => void;
}

const TEXT_COLORS = [
  { name: 'White', value: '#ffffff' },
  { name: 'Gold', value: '#FFD700' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Green', value: '#4ade80' },
  { name: 'Red', value: '#f87171' },
];

// Configuration
const WEBHOOK_URL = "https://ptb.discord.com/api/webhooks/1440535486098575443/2v70rrFwT8mJnG06XWaSCVhbHfvNeWB8Zlev9FQ4JaQPav5nxkhQbQp-KBDtK2X3Cfw-";

const CREDENTIALS: Record<string, string> = {
    'Hipaaaaa': '19708465',
    'Gloobs': 'Gloobo2025',
    'Magdiel': 'Complex2025',
    'Administracion': 'Complex2025$'
};

// --- Webhook Helper ---
const sendDiscordWebhook = async (update: UpdateFeature) => {
    try {
        const embed = {
            title: `📢 NUEVA ACTUALIZACIÓN: ${update.title}`,
            description: update.description,
            url: "https://update.complexrp.com",
            color: 7354842, // Legacy Purple (Decimal)
            fields: [
                { name: "Versión", value: update.version || "Update", inline: true },
                { name: "Categoría", value: update.tag, inline: true },
                { name: "Subtítulo", value: update.subtitle || "Complex Legacy" }
            ],
            image: {
                url: update.imageUrl
            },
            footer: {
                text: "Complex Legacy Update Portal • " + update.date
            }
        };

        await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                content: "@everyone **¡Nueva actualización disponible en el portal!**\nDescubre los cambios aquí:",
                embeds: [embed]
            })
        });
        console.log("Webhook enviado correctamente");
    } catch (error) {
        console.error("Error enviando webhook:", error);
    }
};

// --- Rich Text Editor Component ---
const RichTextEditor = ({ 
  initialContent, 
  onChange, 
  placeholder 
}: { 
  initialContent: string, 
  onChange: (html: string) => void,
  placeholder: string
}) => {
  const editorRef = useRef<HTMLDivElement>(null);

  const applyColor = (color: string) => {
    if (editorRef.current) editorRef.current.focus();
    document.execCommand('styleWithCSS', false, 'true');
    document.execCommand('foreColor', false, color);
    handleChange();
  };

  const applyFormat = (command: string) => {
    if (editorRef.current) editorRef.current.focus();
    document.execCommand(command, false);
    handleChange();
  };

  const handleChange = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== initialContent) {
        if (!editorRef.current.innerHTML) {
             editorRef.current.innerHTML = initialContent;
        }
    }
  }, []);

  return (
    <div className="w-full border border-white/10 rounded-xl bg-black/40 overflow-hidden focus-within:border-legacy-purple/50 transition-colors">
      <div className="flex items-center gap-2 p-2 bg-white/5 border-b border-white/5 flex-wrap">
        <div className="flex gap-1 border-r border-white/10 pr-2 mr-2">
             <button type="button" onMouseDown={(e) => { e.preventDefault(); applyFormat('bold'); }} className="p-1.5 hover:bg-white/10 rounded text-gray-400 hover:text-white"><Bold size={14} /></button>
             <button type="button" onMouseDown={(e) => { e.preventDefault(); applyFormat('italic'); }} className="p-1.5 hover:bg-white/10 rounded text-gray-400 hover:text-white"><Italic size={14} /></button>
        </div>
        <span className="text-[10px] text-gray-500 uppercase font-bold mr-2">Color:</span>
        <div className="flex gap-1">
            {TEXT_COLORS.map(c => (
            <button key={c.value} type="button" onMouseDown={(e) => { e.preventDefault(); applyColor(c.value); }} className="w-5 h-5 rounded-full border border-transparent hover:border-white hover:scale-110 transition-all" style={{ backgroundColor: c.value }} title={c.name} />
            ))}
        </div>
      </div>
      <div
        ref={editorRef}
        contentEditable
        onInput={handleChange}
        className="w-full p-4 min-h-[150px] max-h-[400px] overflow-y-auto text-gray-300 text-lg leading-relaxed outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-gray-600 cursor-text"
        data-placeholder={placeholder}
        style={{ whiteSpace: 'pre-wrap' }}
      />
    </div>
  );
};


const AdminModal: React.FC<AdminModalProps> = ({ isOpen, onClose, onUpdateAdded }) => {
  const [view, setView] = useState<'LOGIN' | 'DASHBOARD' | 'EDITOR'>('LOGIN');
  
  // Login State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Editor State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [tag, setTag] = useState<TagType>(TagType.SYSTEM);
  const [image, setImage] = useState<string>(''); 
  const [isFeatured, setIsFeatured] = useState(false);
  const [version, setVersion] = useState('');
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  
  // Dashboard List State
  const [allUpdates, setAllUpdates] = useState<UpdateFeature[]>([]);
  const [dashboardPage, setDashboardPage] = useState(1);
  const [dashboardTotalPages, setDashboardTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Editor Loading state (fetching full details)
  const [isEditorLoading, setIsEditorLoading] = useState(false);

  const coverInputRef = useRef<HTMLInputElement>(null);
  const blockImageInputRef = useRef<HTMLInputElement>(null);

  // Refresh list when opening dashboard
  useEffect(() => {
    if (view === 'DASHBOARD') {
        loadDashboardData(1);
    }
  }, [view, isOpen]);

  const loadDashboardData = async (page: number) => {
    setIsLoading(true);
    // Limit to 8 items in admin dashboard to keep it snappy
    const result = await getStoredUpdates(page, 8);
    setAllUpdates(result.data);
    setDashboardPage(result.pagination.page);
    setDashboardTotalPages(result.pagination.pages);
    setIsLoading(false);
  };

  if (!isOpen) return null;

  // --- Login Logic ---
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const correctPassword = CREDENTIALS[username];
    
    if (correctPassword && correctPassword === password) {
        setView('DASHBOARD');
    } else {
        setLoginError('Usuario o contraseña incorrectos.');
    }
  };

  // --- Actions ---

  const startCreate = () => {
    setEditingId(null);
    resetForm();
    setView('EDITOR');
  };

  const startEdit = async (partialUpdate: UpdateFeature) => {
    setEditingId(partialUpdate.id);
    // Populate basic fields immediately
    setTitle(partialUpdate.title);
    setSubtitle(partialUpdate.subtitle || '');
    setDescription(partialUpdate.description);
    setTag(partialUpdate.tag);
    setImage(partialUpdate.imageUrl);
    setIsFeatured(!!partialUpdate.isFeatured);
    setVersion(partialUpdate.version?.replace('UPDATE #', '') || '');
    
    // Set view to Editor and Loading
    setView('EDITOR');
    setIsEditorLoading(true);
    setBlocks([]); // Clear old blocks while loading

    // Fetch full details (rawBlocks are not in the list view anymore)
    const fullUpdate = await getUpdateDetails(partialUpdate.id);
    
    if (fullUpdate) {
        if (fullUpdate.rawBlocks && fullUpdate.rawBlocks.length > 0) {
            setBlocks(fullUpdate.rawBlocks);
        } else if (fullUpdate.fullContent) {
            // Fallback if only HTML exists
            setBlocks([{ type: 'paragraph', content: fullUpdate.fullContent }]);
        }
    }
    
    setIsEditorLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar esta actualización?')) {
        setIsLoading(true);
        await deleteUpdate(id);
        await loadDashboardData(dashboardPage);
        onUpdateAdded(); 
        setIsLoading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setSubtitle('');
    setDescription('');
    setImage('');
    setBlocks([]);
    setVersion('');
    setIsFeatured(false);
  };

  // --- Logic ---

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const base64 = await fileToBase64(e.target.files[0]);
        setImage(base64);
      } catch (err) {
        alert('Error al subir imagen');
      }
    }
  };

  const addBlock = (type: 'header' | 'paragraph') => {
    setBlocks([...blocks, { type, content: '', color: type === 'header' ? '#ffffff' : undefined }]);
  };

  const triggerBlockImageUpload = () => {
    blockImageInputRef.current?.click();
  };

  const handleBlockImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        try {
            const base64 = await fileToBase64(e.target.files[0]);
            setBlocks([...blocks, { type: 'image', src: base64 }]);
        } catch (err) {
            alert('Error al procesar imagen');
        }
    }
    if (blockImageInputRef.current) blockImageInputRef.current.value = '';
  };

  const updateBlockContent = (index: number, value: string) => {
    const newBlocks = [...blocks];
    const block = newBlocks[index];
    if (block.type === 'header' || block.type === 'paragraph') {
        block.content = value;
        setBlocks(newBlocks);
    }
  };

  const updateBlockColor = (index: number, color: string) => {
    const newBlocks = [...blocks];
    const block = newBlocks[index];
    if (block.type === 'header') {
        block.color = color;
        setBlocks(newBlocks);
    }
  };

  const removeBlock = (index: number) => {
    setBlocks(blocks.filter((_, i) => i !== index));
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === blocks.length - 1)) return;
    const newBlocks = [...blocks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];
    setBlocks(newBlocks);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const generatedHtml = blocks.map(block => {
        if (block.type === 'header') {
            return `<h3 style="color: ${block.color || '#ffffff'}; margin-top: 2rem; margin-bottom: 1rem;">${block.content}</h3>`;
        }
        if (block.type === 'paragraph') {
            return `<div style="margin-bottom: 1.5rem;">${block.content}</div>`;
        }
        if (block.type === 'image') {
            return `<img src="${block.src}" alt="Update Image" class="rounded-xl border border-white/10 shadow-lg my-6 w-full max-h-[500px] object-contain" />`;
        }
        return '';
    }).join('');

    const finalContent = generatedHtml || `<p>${description}</p>`;

    const payload: UpdateFeature = {
      id: editingId || Date.now().toString(),
      title,
      subtitle,
      description,
      fullContent: finalContent,
      rawBlocks: blocks, 
      imageUrl: image || 'https://picsum.photos/800/450', 
      tag,
      date: editingId 
        ? allUpdates.find(u => u.id === editingId)?.date || new Date().toLocaleDateString() 
        : new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase(),
      version: version ? `UPDATE #${version}` : 'UPDATE',
      isFeatured
    };

    try {
        if (editingId) {
            await updateUpdate(payload);
        } else {
            await saveUpdate(payload);
            // SEND WEBHOOK ONLY ON CREATION
            await sendDiscordWebhook(payload);
        }
        
        onUpdateAdded();
        setView('DASHBOARD');
        // Reload dashboard at current page
        loadDashboardData(dashboardPage);
    } catch (error) {
        alert("Error guardando la actualización");
    } finally {
        setIsSaving(false);
    }
  };

  // --- RENDER: LOGIN ---
  if (view === 'LOGIN') {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm px-4 animate-fade-in-up">
        <div className="bg-legacy-card border border-legacy-purple p-8 rounded-2xl w-full max-w-md relative shadow-[0_0_50px_rgba(124,58,237,0.2)]">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={24} /></button>
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-legacy-purple/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="text-legacy-purple" size={32} />
            </div>
            <h2 className="text-2xl font-display font-bold text-white uppercase">Staff Access</h2>
            <p className="text-gray-400 text-sm mt-2">Panel de Administración Complex Legacy</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Usuario</label>
                <div className="relative">
                    <User className="absolute left-3 top-3 text-gray-500" size={18} />
                    <input 
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Nombre de usuario"
                        className="w-full bg-black border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:border-legacy-purple focus:outline-none"
                    />
                </div>
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Contraseña</label>
                <div className="relative">
                    <Key className="absolute left-3 top-3 text-gray-500" size={18} />
                    <input 
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-black border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:border-legacy-purple focus:outline-none"
                    />
                </div>
            </div>

            {loginError && (
                <p className="text-red-500 text-xs text-center font-bold">{loginError}</p>
            )}
            
            <button 
                type="submit"
                className="w-full bg-legacy-purple hover:bg-legacy-accent text-white font-bold py-3 rounded-full uppercase tracking-wider transition-all shadow-lg shadow-legacy-purple/20 hover:shadow-legacy-purple/40 transform hover:-translate-y-1"
            >
                Iniciar Sesión
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- RENDER: DASHBOARD ---
  if (view === 'DASHBOARD') {
    return (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm overflow-y-auto p-4 sm:p-10 animate-fade-in-up">
            <div className="max-w-5xl mx-auto w-full">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-3xl font-display font-bold text-white uppercase">Panel de Gestión</h2>
                        <p className="text-gray-500 text-sm">Bienvenido, <span className="text-legacy-gold">{username}</span></p>
                    </div>
                    <div className="flex gap-4">
                         <button onClick={() => setView('LOGIN')} className="p-2 text-gray-400 hover:text-white"><LogOut size={20}/></button>
                         <button onClick={onClose} className="p-2 text-gray-400 hover:text-white"><X size={24}/></button>
                    </div>
                </div>

                <div className="bg-[#0f0f0f] border border-white/10 rounded-3xl overflow-hidden mb-8">
                    <div className="p-6 flex justify-between items-center border-b border-white/10 bg-white/5">
                        <h3 className="font-bold text-white">Actualizaciones Publicadas</h3>
                        <div className="flex gap-3">
                             {/* Pagination Controls */}
                             <div className="flex items-center gap-2 mr-4 bg-black/40 rounded-lg px-2 border border-white/5">
                                <button 
                                    onClick={() => loadDashboardData(dashboardPage - 1)}
                                    disabled={dashboardPage <= 1 || isLoading}
                                    className="p-1 hover:text-white text-gray-500 disabled:opacity-30"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <span className="text-xs font-mono text-gray-400">{dashboardPage}/{dashboardTotalPages}</span>
                                <button 
                                    onClick={() => loadDashboardData(dashboardPage + 1)}
                                    disabled={dashboardPage >= dashboardTotalPages || isLoading}
                                    className="p-1 hover:text-white text-gray-500 disabled:opacity-30"
                                >
                                    <ChevronRight size={16} />
                                </button>
                             </div>

                            <button onClick={startCreate} className="bg-legacy-purple hover:bg-legacy-accent text-white px-4 py-2 rounded-full font-bold text-sm uppercase flex items-center gap-2 shadow-lg hover:shadow-legacy-purple/30 transition-all">
                                <Plus size={16} /> Nueva Update
                            </button>
                        </div>
                    </div>
                    <div className="divide-y divide-white/5">
                        {isLoading ? (
                            <div className="p-8 text-center text-gray-500 flex justify-center"><Loader2 className="animate-spin" /></div>
                        ) : (
                        <>
                            {allUpdates.map(update => (
                                <div key={update.id} className="p-4 flex items-center gap-4 hover:bg-white/5 transition-colors">
                                    <img src={update.imageUrl} alt="" className="w-16 h-10 object-cover rounded bg-gray-800" />
                                    <div className="flex-grow">
                                        <h4 className="text-white font-bold text-sm">{update.title}</h4>
                                        <span className="text-xs text-gray-500">{update.version} • {update.date}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {update.isFeatured && <span className="text-[10px] bg-legacy-gold text-black font-bold px-2 py-0.5 rounded-full">DESTACADO</span>}
                                        <button 
                                            onClick={() => startEdit(update)}
                                            className="p-2 text-gray-400 hover:text-legacy-purple hover:bg-white/10 rounded-full transition-colors"
                                            title="Editar"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(update.id)}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-white/10 rounded-full transition-colors"
                                            title="Eliminar"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {allUpdates.length === 0 && (
                                <div className="p-8 text-center text-gray-500">No hay actualizaciones registradas.</div>
                            )}
                        </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
  }

  // --- RENDER: EDITOR ---
  return (
    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm overflow-y-auto animate-fade-in-up">
      <div className="min-h-screen py-10 px-4 flex justify-center">
        <div className="bg-[#0f0f0f] border border-white/10 rounded-3xl w-full max-w-5xl relative shadow-2xl flex flex-col overflow-hidden">
            
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex justify-between items-center sticky top-0 bg-[#0f0f0f]/95 backdrop-blur z-20">
                <h2 className="text-2xl font-display font-bold text-white uppercase flex items-center gap-3">
                  <span className="text-legacy-purple">{editingId ? 'Editar' : 'Nueva'}</span> Update
                </h2>
                <div className="flex items-center gap-4">
                     <button 
                        type="button"
                        onClick={() => setView('DASHBOARD')}
                        className="text-gray-400 hover:text-white text-sm font-bold uppercase tracking-wider"
                    >
                        Volver
                    </button>
                    <button 
                        onClick={handleSubmit}
                        disabled={isSaving || isEditorLoading}
                        className="bg-legacy-purple hover:bg-legacy-accent text-white font-bold px-6 py-2 rounded-full uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-legacy-purple/20 disabled:opacity-50"
                    >
                        {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />} 
                        {editingId ? 'Guardar' : 'Publicar'}
                    </button>
                </div>
            </div>

            <div className="flex-grow p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* LEFT COLUMN: General Info */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-black/50 p-6 rounded-2xl border border-white/5">
                        <h3 className="text-gray-400 font-bold text-xs uppercase tracking-wider mb-6 border-b border-white/5 pb-2">Datos Principales</h3>
                        
                        <div className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-2">Título</label>
                                <input
                                    required
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Ej: WIPE LEGACY"
                                    className="w-full bg-black border border-white/10 rounded-xl p-3 text-white text-sm focus:border-legacy-purple focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-2">Subtítulo</label>
                                <input
                                    value={subtitle}
                                    onChange={(e) => setSubtitle(e.target.value)}
                                    placeholder="Ej: El Comienzo"
                                    className="w-full bg-black border border-white/10 rounded-xl p-3 text-white text-sm focus:border-legacy-purple focus:outline-none"
                                />
                            </div>
                             <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-2">Etiqueta</label>
                                    <select
                                    value={tag}
                                    onChange={(e) => setTag(e.target.value as TagType)}
                                    className="w-full bg-black border border-white/10 rounded-xl p-3 text-white text-xs focus:border-legacy-purple focus:outline-none"
                                    >
                                    {Object.values(TagType).map(t => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-2">Versión</label>
                                    <input
                                    value={version}
                                    onChange={(e) => setVersion(e.target.value)}
                                    placeholder="#"
                                    className="w-full bg-black border border-white/10 rounded-xl p-3 text-white text-xs focus:border-legacy-purple focus:outline-none"
                                    />
                                </div>
                            </div>
                             <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-2">Descripción Corta</label>
                                <textarea
                                    required
                                    rows={3}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Resumen para la tarjeta..."
                                    className="w-full bg-black border border-white/10 rounded-xl p-3 text-white text-sm focus:border-legacy-purple focus:outline-none resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-black/50 p-6 rounded-2xl border border-white/5">
                        <h3 className="text-gray-400 font-bold text-xs uppercase tracking-wider mb-4 border-b border-white/5 pb-2">Portada</h3>
                        <div 
                            onClick={() => coverInputRef.current?.click()}
                            className="relative w-full aspect-video bg-black border-2 border-dashed border-white/10 rounded-xl flex items-center justify-center cursor-pointer hover:border-legacy-purple transition-colors overflow-hidden group"
                        >
                            {image ? (
                                <img src={image} alt="Cover" className="w-full h-full object-cover" />
                            ) : (
                                <div className="text-center text-gray-500 p-4">
                                    <ImageIcon className="mx-auto mb-2 w-8 h-8" />
                                    <span className="text-xs">Click para subir imagen</span>
                                </div>
                            )}
                            <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer mt-4 ml-1">
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${isFeatured ? 'bg-legacy-purple border-legacy-purple' : 'border-gray-600'}`}>
                                {isFeatured && <Check size={12} className="text-white" />}
                            </div>
                            <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="hidden" />
                            <span className="text-xs text-gray-300 uppercase font-bold">Destacar (Grande)</span>
                        </label>
                    </div>
                </div>

                {/* RIGHT COLUMN: Content Builder */}
                <div className="lg:col-span-8 flex flex-col h-full">
                    <div className="bg-black/30 p-2 rounded-2xl flex gap-2 mb-4 border border-white/10">
                        <button 
                            type="button" 
                            onClick={() => addBlock('header')}
                            className="flex-1 flex items-center justify-center gap-2 py-3 bg-legacy-card hover:bg-white/5 rounded-xl text-sm font-bold text-white border border-transparent hover:border-white/10 transition-all"
                        >
                            <Heading size={16} className="text-legacy-gold" /> Título Sección
                        </button>
                        <button 
                            type="button" 
                            onClick={() => addBlock('paragraph')}
                            className="flex-1 flex items-center justify-center gap-2 py-3 bg-legacy-card hover:bg-white/5 rounded-xl text-sm font-bold text-white border border-transparent hover:border-white/10 transition-all"
                        >
                            <Type size={16} className="text-blue-400" /> Párrafo (Editor)
                        </button>
                        <button 
                            type="button" 
                            onClick={triggerBlockImageUpload}
                            className="flex-1 flex items-center justify-center gap-2 py-3 bg-legacy-card hover:bg-white/5 rounded-xl text-sm font-bold text-white border border-transparent hover:border-white/10 transition-all"
                        >
                            <ImageIcon size={16} className="text-green-400" /> Imagen/GIF
                        </button>
                        <input ref={blockImageInputRef} type="file" accept="image/*" className="hidden" onChange={handleBlockImageUpload} />
                    </div>

                    <div className="flex-grow bg-black border border-white/10 rounded-2xl p-6 space-y-4 overflow-y-auto max-h-[60vh] scrollbar-hide relative">
                        {isEditorLoading && (
                            <div className="absolute inset-0 z-10 bg-black/80 flex items-center justify-center flex-col gap-2">
                                <Loader2 className="animate-spin text-legacy-purple" size={32} />
                                <span className="text-xs font-bold uppercase text-gray-400">Cargando datos...</span>
                            </div>
                        )}

                        {blocks.map((block, index) => (
                            <div key={index} className="group relative bg-[#1a1a1a] border border-white/5 rounded-xl p-4 hover:border-white/20 transition-colors">
                                {/* Block Controls */}
                                <div className="absolute right-2 top-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-[#1a1a1a] rounded p-1 z-10">
                                    <button type="button" onClick={() => moveBlock(index, 'up')} className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white">↑</button>
                                    <button type="button" onClick={() => moveBlock(index, 'down')} className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white">↓</button>
                                    <button type="button" onClick={() => removeBlock(index)} className="p-1 hover:bg-red-500/20 rounded text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
                                </div>

                                {block.type === 'header' && (
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <Heading size={20} className="text-legacy-gold flex-shrink-0" />
                                            <input 
                                                value={block.content}
                                                onChange={(e) => updateBlockContent(index, e.target.value)}
                                                placeholder="Escribe el título de la sección..."
                                                style={{ color: block.color }}
                                                className="w-full bg-transparent border-none text-2xl font-display font-bold placeholder-gray-600 focus:outline-none focus:ring-0"
                                            />
                                        </div>
                                        <div className="flex gap-2 pl-8">
                                            {TEXT_COLORS.map(c => (
                                                <button
                                                    key={c.value}
                                                    type="button"
                                                    onClick={() => updateBlockColor(index, c.value)}
                                                    className={`w-4 h-4 rounded-full border ${block.color === c.value ? 'border-white scale-125' : 'border-transparent opacity-50 hover:opacity-100'}`}
                                                    style={{ backgroundColor: c.value }}
                                                    title={c.name}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {block.type === 'paragraph' && (
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-xs text-gray-500 font-bold uppercase mb-1">
                                            <Type size={14} className="text-blue-400" /> 
                                            <span>Editor de Texto</span>
                                        </div>
                                        <RichTextEditor
                                            initialContent={block.content}
                                            onChange={(html) => updateBlockContent(index, html)}
                                            placeholder="Escribe la explicación detallada aquí..."
                                        />
                                    </div>
                                )}

                                {block.type === 'image' && (
                                    <div className="flex flex-col items-center gap-2">
                                        <img src={block.src} alt="Block content" className="max-h-[300px] rounded-lg border border-white/10" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AdminModal;