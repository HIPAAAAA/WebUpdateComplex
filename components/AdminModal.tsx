
import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, Image as ImageIcon, Check, Lock, Plus, Trash2, Type, Heading, Bold, Italic, LogOut, Edit2, Disc } from 'lucide-react';
import { UpdateFeature, TagType, ContentBlock } from '../types';
import { saveUpdate, updateUpdate, deleteUpdate, fileToBase64, getStoredUpdates } from '../services/storage';
import { LEGACY_UPDATE_DATA } from '../constants';

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
        // Only update if significantly different to avoid cursor jumping, 
        // or if initial load (empty editor vs content)
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
  // Views: 'LOGIN' | 'DASHBOARD' | 'EDITOR'
  const [view, setView] = useState<'LOGIN' | 'DASHBOARD' | 'EDITOR'>('LOGIN');
  
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

  const coverInputRef = useRef<HTMLInputElement>(null);
  const blockImageInputRef = useRef<HTMLInputElement>(null);

  // Refresh list when opening dashboard
  useEffect(() => {
    if (view === 'DASHBOARD') {
        const local = getStoredUpdates();
        // Combine local and static, prioritizing local if ID matches (though IDs shouldn't clash ideally)
        // For this simple demo, we just show local ones as "Editable" and static ones as "Read only" visually or just list them all
        // To enable editing static ones, we would treat them as new entries once saved.
        setAllUpdates([...local, ...LEGACY_UPDATE_DATA]);
    }
  }, [view, isOpen]);

  if (!isOpen) return null;

  // --- Actions ---

  const handleDiscordLogin = () => {
    // In a real app, this redirects. 
    // window.location.href = "https://discord.com/oauth2/authorize?client_id=1440464799250124970&response_type=code&redirect_uri=https%3A%2F%2Fupdate.complexrp.com%2Fapi%2Fauth%2Fcallback&scope=identify%20guilds.channels.read%20guilds%20guilds.members.read";
    
    // For this Frontend Demo:
    setView('DASHBOARD');
  };

  const startCreate = () => {
    setEditingId(null);
    resetForm();
    setView('EDITOR');
  };

  const startEdit = (update: UpdateFeature) => {
    setEditingId(update.id);
    setTitle(update.title);
    setSubtitle(update.subtitle || '');
    setDescription(update.description);
    setTag(update.tag);
    setImage(update.imageUrl);
    setIsFeatured(!!update.isFeatured);
    setVersion(update.version?.replace('UPDATE #', '') || '');
    
    // Restore blocks if they exist, otherwise try to preserve content in a single block
    if (update.rawBlocks && update.rawBlocks.length > 0) {
        setBlocks(update.rawBlocks);
    } else {
        // Fallback for legacy updates without block structure
        setBlocks([{ type: 'paragraph', content: update.fullContent }]);
    }
    
    setView('EDITOR');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar esta actualización?')) {
        deleteUpdate(id);
        // Refresh list
        const local = getStoredUpdates();
        setAllUpdates([...local, ...LEGACY_UPDATE_DATA.filter(u => u.id !== id)]); // Visual fix for list
        onUpdateAdded(); // Refresh main app
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

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
      rawBlocks: blocks, // Save state!
      imageUrl: image || 'https://picsum.photos/800/450', 
      tag,
      date: editingId 
        ? allUpdates.find(u => u.id === editingId)?.date || new Date().toLocaleDateString() 
        : new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase(),
      version: version ? `UPDATE #${version}` : 'UPDATE',
      isFeatured
    };

    if (editingId) {
        updateUpdate(payload);
    } else {
        saveUpdate(payload);
    }
    
    onUpdateAdded();
    setView('DASHBOARD');
  };

  // --- RENDER: LOGIN ---
  if (view === 'LOGIN') {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm px-4">
        <div className="bg-legacy-card border border-legacy-purple p-8 rounded-2xl w-full max-w-md relative shadow-[0_0_50px_rgba(124,58,237,0.2)]">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={24} /></button>
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-legacy-purple/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="text-legacy-purple" size={32} />
            </div>
            <h2 className="text-2xl font-display font-bold text-white uppercase">Staff Access</h2>
            <p className="text-gray-400 text-sm mt-2">Identifícate con tu cuenta administrativa</p>
          </div>
          <div className="space-y-4">
            {/* Real Button Link requested */}
            <a 
                href="https://discord.com/oauth2/authorize?client_id=1440464799250124970&response_type=code&redirect_uri=https%3A%2F%2Fupdate.complexrp.com%2Fapi%2Fauth%2Fcallback&scope=identify%20guilds.channels.read%20guilds%20guilds.members.read"
                className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold py-3 rounded-full uppercase tracking-wider transition-all flex items-center justify-center gap-2"
            >
                <Disc size={20} /> Login con Discord
            </a>
            
            {/* Dev Bypass for Demo Purposes */}
            <button 
                onClick={handleDiscordLogin}
                className="w-full bg-white/5 hover:bg-white/10 text-gray-400 font-bold py-3 rounded-full uppercase tracking-wider transition-all text-xs"
            >
                (Demo: Simular Acceso Staff)
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER: DASHBOARD ---
  if (view === 'DASHBOARD') {
    return (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm overflow-y-auto p-4 sm:p-10">
            <div className="max-w-5xl mx-auto w-full">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-3xl font-display font-bold text-white uppercase">Panel de Gestión</h2>
                        <p className="text-gray-500 text-sm">Administra las notas del parche visibles</p>
                    </div>
                    <div className="flex gap-4">
                         <button onClick={() => setView('LOGIN')} className="p-2 text-gray-400 hover:text-white"><LogOut size={20}/></button>
                         <button onClick={onClose} className="p-2 text-gray-400 hover:text-white"><X size={24}/></button>
                    </div>
                </div>

                <div className="bg-[#0f0f0f] border border-white/10 rounded-3xl overflow-hidden mb-8">
                    <div className="p-6 flex justify-between items-center border-b border-white/10 bg-white/5">
                        <h3 className="font-bold text-white">Actualizaciones Publicadas</h3>
                        <button onClick={startCreate} className="bg-legacy-purple hover:bg-legacy-accent text-white px-4 py-2 rounded-full font-bold text-sm uppercase flex items-center gap-2">
                            <Plus size={16} /> Nueva Update
                        </button>
                    </div>
                    <div className="divide-y divide-white/5">
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
                    </div>
                </div>
            </div>
        </div>
    );
  }

  // --- RENDER: EDITOR ---
  return (
    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm overflow-y-auto">
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
                        className="bg-legacy-purple hover:bg-legacy-accent text-white font-bold px-6 py-2 rounded-full uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-legacy-purple/20"
                    >
                        <Upload size={16} /> {editingId ? 'Guardar' : 'Publicar'}
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

                    <div className="flex-grow bg-black border border-white/10 rounded-2xl p-6 space-y-4 overflow-y-auto max-h-[60vh] scrollbar-hide">
                        {blocks.length === 0 && (
                            <div className="text-center py-20 text-gray-600 border-2 border-dashed border-white/5 rounded-xl">
                                <Plus size={48} className="mx-auto mb-4 opacity-20" />
                                <p>Usa los botones de arriba para agregar contenido.</p>
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
                                                autoFocus
                                            />
                                        </div>
                                        {/* Color Picker for Header (Line color) */}
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
