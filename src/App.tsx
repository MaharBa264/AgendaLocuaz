import { useEffect, useRef, useState } from 'react';
import { interpretEvent } from './lib/interpretEvent';
import { CalendarDays, CheckCircle2, ListTodo, Mic, Plus, ShoppingBasket, LogIn, LogOut, RefreshCw } from 'lucide-react';

type Tab = 'agenda' | 'tareas' | 'compras';
type CalendarEvent = { id: string; summary?: string; description?: string; location?: string; recurringEventId?: string; start?: { dateTime?: string; date?: string }; end?: { dateTime?: string; date?: string } };
type GoogleProfile = { name?: string; email?: string; picture?: string };
type TokenResponse = { access_token?: string; error?: string };
type TokenClient = { requestAccessToken: (options?: { prompt?: string }) => void };
declare global {
 interface Window { google?: { accounts: { oauth2: { initTokenClient: (options: { client_id: string; scope: string; callback: (response: TokenResponse) => void }) => TokenClient; revoke: (token: string, callback: () => void) => void } } } }
}
const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
const weekdays = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
function localDatetime(date: Date) {
 const pad=(n:number)=>String(n).padStart(2,'0');
 return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
async function googleRequest<T>(token: string, url: string, init?: RequestInit): Promise<T> {
 const response=await fetch(url,{...init,headers:{Authorization:`Bearer ${token}`,...(init?.body?{'Content-Type':'application/json'}:{})}});
 if(!response.ok) { const detail=await response.json().catch(()=>null) as {error?:{message?:string}}|null; throw new Error(detail?.error?.message ?? `Google API: error ${response.status}`); }
 return response.json() as Promise<T>;
}
export default function App() {
 const [tab,setTab]=useState<Tab>('agenda');
 const [token,setToken]=useState<string|null>(null);
 const [profile,setProfile]=useState<GoogleProfile|null>(null);
 const [events,setEvents]=useState<CalendarEvent[]>([]);
 const [busy,setBusy]=useState(false);
 const [message,setMessage]=useState('');
 const [title,setTitle]=useState('');
 const [natural,setNatural]=useState('');
 const [preview,setPreview]=useState<string|null>(null);
 const [selected,setSelected]=useState<CalendarEvent|null>(null);
 const [editTitle,setEditTitle]=useState('');
 const [editStart,setEditStart]=useState('');
 const [editEnd,setEditEnd]=useState('');
 const [editDescription,setEditDescription]=useState('');
 const [start,setStart]=useState(()=>{const d=new Date();d.setHours(d.getHours()+1,0,0,0);return localDatetime(d);});
 const tokenClient=useRef<TokenClient|null>(null);
 const tokenRef=useRef<string|null>(null);
 const today=new Date();
 const days=Array.from({length:7},(_,i)=>{const d=new Date(today);d.setDate(today.getDate()+i);return d;});

 const refresh=async(accessToken: string)=>{
  const now=new Date(); const until=new Date(now);until.setDate(until.getDate()+7);
  const params=new URLSearchParams({timeMin:now.toISOString(),timeMax:until.toISOString(),singleEvents:'true',orderBy:'startTime',maxResults:'100'});
  const data=await googleRequest<{items?:CalendarEvent[]}>(accessToken,`https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`);
  setEvents(data.items??[]);
 };
 const login=()=>{
  if(!clientId){setMessage('Falta configurar VITE_GOOGLE_CLIENT_ID en Cloudflare Pages.');return;}
  if(!window.google?.accounts.oauth2){setMessage('Google todavía no cargó. Recargá la página e intentá nuevamente.');return;}
  if(!tokenClient.current){
   tokenClient.current=window.google.accounts.oauth2.initTokenClient({
    client_id:clientId,scope:'openid email profile https://www.googleapis.com/auth/calendar.events',
    callback:async response=>{
     if(!response.access_token){setMessage(response.error??'No se pudo autorizar el acceso a Google.');return;}
     tokenRef.current=response.access_token;setToken(response.access_token);setBusy(true);
     try{
      const info=await googleRequest<GoogleProfile>(response.access_token,'https://openidconnect.googleapis.com/v1/userinfo');
      setProfile(info);await refresh(response.access_token);setMessage('Calendario conectado correctamente.');
     }catch(e){setMessage(e instanceof Error?e.message:'Error consultando Google Calendar.');}
     finally{setBusy(false);}
    }
   });
  }
  tokenClient.current.requestAccessToken({prompt:'consent'});
 };
 const logout=()=>{
  const current=tokenRef.current;
  tokenRef.current=null;setToken(null);setProfile(null);setEvents([]);setMessage('Sesión desconectada de este dispositivo.');
  if(current)window.google?.accounts.oauth2.revoke(current,()=>{});
 };
 const reload=async()=>{if(!token)return;setBusy(true);try{await refresh(token);setMessage('Eventos actualizados.');}catch(e){setMessage(e instanceof Error?e.message:'No se pudieron cargar los eventos.');}finally{setBusy(false);}};
 const openEvent=(event:CalendarEvent)=>{setSelected(event);setEditTitle(event.summary??'');setEditDescription(event.description??'');setEditStart(event.start?.dateTime?localDatetime(new Date(event.start.dateTime)):event.start?.date+'T09:00');setEditEnd(event.end?.dateTime?localDatetime(new Date(event.end.dateTime)):event.end?.date+'T10:00');};
 const saveEvent=async()=>{if(!selected||!token)return;const begin=new Date(editStart),end=new Date(editEnd);if(!editTitle.trim()||Number.isNaN(+begin)||Number.isNaN(+end)||end<=begin){setMessage('Revisá el título y las fechas: el final debe ser posterior al inicio.');return;}if(selected.recurringEventId&&!window.confirm('Este cambio afectará solamente esta ocurrencia de un evento recurrente. ¿Continuar?'))return;setBusy(true);try{await googleRequest(token,`https://www.googleapis.com/calendar/v3/calendars/primary/events/${encodeURIComponent(selected.id)}`,{method:'PATCH',body:JSON.stringify({summary:editTitle.trim(),description:editDescription,start:{dateTime:begin.toISOString()},end:{dateTime:end.toISOString()}})});setSelected(null);await refresh(token);setMessage('Evento actualizado.');}catch(e){setMessage(e instanceof Error?e.message:'No se pudo editar el evento.');}finally{setBusy(false);}};
 const deleteEvent=async()=>{if(!selected||!token||!window.confirm(`¿Eliminar «${selected.summary??'este evento'}» de tu calendario? Esta acción no se puede deshacer.`))return;if(selected.recurringEventId&&!window.confirm('Es un evento recurrente. Se eliminará solamente esta ocurrencia. ¿Continuar?'))return;setBusy(true);try{await googleRequest(token,`https://www.googleapis.com/calendar/v3/calendars/primary/events/${encodeURIComponent(selected.id)}`,{method:'DELETE'});setSelected(null);await refresh(token);setMessage('Evento eliminado.');}catch(e){setMessage(e instanceof Error?e.message:'No se pudo eliminar el evento.');}finally{setBusy(false);}};
 const interpret=()=>{const result=interpretEvent(natural);if(!result){setMessage('No pude identificar una fecha. Probá «mañana a las 17» o «viernes a las 18».');return;}setTitle(result.title);setStart(result.start);setPreview(result.notes.length?result.notes.join(' '):'Revisá la propuesta antes de agregarla.');setMessage('Propuesta preparada; todavía no se guardó nada.');};
 const addEvent=async()=>{
  if(!token){setMessage('Primero conectá tu cuenta de Google.');return;}
  if(!title.trim()||!start){setMessage('Ingresá el nombre y la fecha de la actividad.');return;}
  const begin=new Date(start);if(Number.isNaN(begin.getTime())){setMessage('La fecha no es válida.');return;}
  const end=new Date(begin.getTime()+60*60*1000);
  setBusy(true);
  try{
   await googleRequest(token,'https://www.googleapis.com/calendar/v3/calendars/primary/events',{method:'POST',body:JSON.stringify({summary:title.trim(),start:{dateTime:begin.toISOString()},end:{dateTime:end.toISOString()},reminders:{useDefault:false,overrides:[{method:'popup',minutes:1440},{method:'popup',minutes:360},{method:'popup',minutes:60}]}})});
   setTitle('');setNatural('');setPreview(null);await refresh(token);setMessage('¡Actividad guardada en tu Google Calendar! Avisos configurados para 24 h, 6 h y 1 h antes (según las notificaciones de Google).');
  }catch(e){setMessage(e instanceof Error?e.message:'No se pudo crear el evento.');}
  finally{setBusy(false);}
 };
 useEffect(()=>{if(!clientId)setMessage('Vista previa: falta configurar el ID público de Google OAuth en Cloudflare.');},[]);
 return <div className="shell"><aside className="sidebar"><div className="brand"><span className="brand-icon">✳</span><span>agenda<span className="brand-light">locuaz</span></span></div><p className="eyebrow">TU ESPACIO</p><nav><button className={tab==='agenda'?'selected':''} onClick={()=>setTab('agenda')}><CalendarDays size={19}/> Mi agenda</button><button className={tab==='tareas'?'selected':''} onClick={()=>setTab('tareas')}><ListTodo size={19}/> Mis tareas</button><button className={tab==='compras'?'selected':''} onClick={()=>setTab('compras')}><ShoppingBasket size={19}/> Compras</button></nav><div className="account">{profile?<><span>{profile.email}</span><button onClick={logout}><LogOut size={16}/> Desconectar</button></>:<button onClick={login}><LogIn size={16}/> Entrar con Google</button>}</div></aside><main><header><div><p className="eyebrow">MI ESPACIO PERSONAL</p><h1>{tab==='agenda'?'Tu semana, a tu manera':tab==='tareas'?'Tus tareas':'Lista de compras'}</h1><p className="subtitle">Todo lo importante, en un solo lugar.</p></div><div className="avatar">{profile?.name?.[0]??'✦'}</div></header><section className="quick"><div className="quick-heading"><span className="sparkle">✳</span><div><strong>¿Qué tenés en mente?</strong><p>Creá una actividad de una hora en tu calendario de Google.</p></div></div>{tab==='agenda'?<><div className="composer"><input aria-label="Describí la actividad en lenguaje natural" value={natural} onChange={e=>setNatural(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')interpret();}} placeholder="Ej: Mañana a las 17 llevar a Martina a hockey"/><button className="add" type="button" onClick={interpret}>Interpretar</button></div>{preview&&<p className="notice" role="status">{preview} Confirmá título y fecha antes de guardar.</p>}<div className="composer"><input aria-label="Nombre de la actividad" value={title} onChange={e=>setTitle(e.target.value)} placeholder="Ej: Hockey de Martina"/><button className="mic" title="Voz próximamente" disabled><Mic size={19}/></button></div><div className="composer"><input aria-label="Fecha y hora" type="datetime-local" value={start} onChange={e=>setStart(e.target.value)}/><button className="add" disabled={busy} onClick={addEvent}><Plus size={19}/> Agregar</button></div><p className="subtitle">Avisos: 1 día, 6 horas y 1 hora antes. Duración inicial: 60 minutos.</p></>:<p className="subtitle">Las listas personales y compartidas llegarán con la integración de Google Drive.</p>}{message&&<p className="notice" role="status">{message}</p>}{!profile&&<button className="connect" onClick={login}><LogIn size={17}/> Conectar Google Calendar</button>}</section><div className="section-heading"><div><p className="eyebrow">UN VISTAZO</p><h2>{tab==='agenda'?'Próximos 7 días':tab==='tareas'?'Pendientes':'Para comprar'}</h2></div><span className="date">{today.toLocaleDateString('es-AR',{month:'long',year:'numeric'})}</span></div>{tab==='agenda'?<><div className="days">{days.map((d,i)=><div className={'day '+(i===0?'today':'')} key={i}><span>{weekdays[d.getDay()]}</span><strong>{d.getDate()}</strong></div>)}</div>{profile&&<div className="calendar-toolbar"><strong>Eventos de Google Calendar</strong><button onClick={reload} disabled={busy}><RefreshCw size={16}/> Actualizar</button></div>}{events.length>0?<div className="events">{events.map(event=><button type="button" className="event" key={event.id} onClick={()=>openEvent(event)}><span>{event.start?.dateTime?new Date(event.start.dateTime).toLocaleString('es-AR',{weekday:'short',day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}):event.start?.date??'Sin fecha'}</span><strong>{event.summary??'Sin título'}</strong></button>)}</div>:<section className="empty"><div className="empty-icon"><CalendarDays size={30}/></div><h3>{profile?'No hay eventos próximos':'Tu semana empieza acá'}</h3><p>{profile?'No encontramos eventos en tu calendario principal para los próximos siete días.':'Conectá tu cuenta para ver tus próximos eventos.'}</p></section>}</>:<section className="empty"><div className="empty-icon">{tab==='tareas'?<CheckCircle2 size={30}/>:<ShoppingBasket size={30}/>}</div><h3>{tab==='tareas'?'Tus tareas estarán acá':'Tu lista de compras estará acá'}</h3><p>Esta función todavía está en desarrollo. No se guardan datos por ahora.</p></section>}<footer>Agenda Locuaz · Integración inicial Google Calendar</footer></main><div className="mobile-nav"><button onClick={()=>setTab('agenda')} className={tab==='agenda'?'active':''}><CalendarDays size={21}/>Agenda</button><button onClick={()=>setTab('tareas')} className={tab==='tareas'?'active':''}><ListTodo size={21}/>Tareas</button><button onClick={()=>setTab('compras')} className={tab==='compras'?'active':''}><ShoppingBasket size={21}/>Compras</button></div>{selected&&<div className="dialog-backdrop" onClick={()=>setSelected(null)}><section className="event-dialog" role="dialog" aria-modal="true" aria-label="Detalles del evento" onClick={e=>e.stopPropagation()}><div className="dialog-top"><h2>Detalles del evento</h2><button type="button" onClick={()=>setSelected(null)} aria-label="Cerrar">✕</button></div><label>Título<input value={editTitle} onChange={e=>setEditTitle(e.target.value)}/></label><label>Comienza<input type="datetime-local" value={editStart} onChange={e=>setEditStart(e.target.value)}/></label><label>Termina<input type="datetime-local" value={editEnd} onChange={e=>setEditEnd(e.target.value)}/></label><label>Descripción<textarea rows={3} value={editDescription} onChange={e=>setEditDescription(e.target.value)}/></label>{selected.recurringEventId&&<p className="notice">Evento recurrente: los cambios afectan solamente esta ocurrencia.</p>}<div className="dialog-actions"><button type="button" onClick={deleteEvent} disabled={busy}>Eliminar</button><button type="button" onClick={saveEvent} disabled={busy}>Guardar cambios</button></div></section></div>}</div>;
}
