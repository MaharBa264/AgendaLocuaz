import { useEffect, useRef, useState } from 'react';
import { CalendarDays, CheckCircle2, ListTodo, Mic, Plus, ShoppingBasket, LogIn, LogOut, RefreshCw } from 'lucide-react';

type Tab = 'agenda' | 'tareas' | 'compras';
type CalendarEvent = { id: string; summary?: string; htmlLink?: string; start?: { dateTime?: string; date?: string }; end?: { dateTime?: string; date?: string } };
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
 const addEvent=async()=>{
  if(!token){setMessage('Primero conectá tu cuenta de Google.');return;}
  if(!title.trim()||!start){setMessage('Ingresá el nombre y la fecha de la actividad.');return;}
  const begin=new Date(start);if(Number.isNaN(begin.getTime())){setMessage('La fecha no es válida.');return;}
  const end=new Date(begin.getTime()+60*60*1000);
  setBusy(true);
  try{
   await googleRequest(token,'https://www.googleapis.com/calendar/v3/calendars/primary/events',{method:'POST',body:JSON.stringify({summary:title.trim(),start:{dateTime:begin.toISOString()},end:{dateTime:end.toISOString()},reminders:{useDefault:false,overrides:[{method:'popup',minutes:1440},{method:'popup',minutes:360},{method:'popup',minutes:60}]}})});
   setTitle('');await refresh(token);setMessage('¡Actividad guardada en tu Google Calendar! Avisos configurados para 24 h, 6 h y 1 h antes (según las notificaciones de Google).');
  }catch(e){setMessage(e instanceof Error?e.message:'No se pudo crear el evento.');}
  finally{setBusy(false);}
 };
 useEffect(()=>{if(!clientId)setMessage('Vista previa: falta configurar el ID público de Google OAuth en Cloudflare.');},[]);
 return <div className="shell"><aside className="sidebar"><div className="brand"><span className="brand-icon">✳</span><span>agenda<span className="brand-light">locuaz</span></span></div><p className="eyebrow">TU ESPACIO</p><nav><button className={tab==='agenda'?'selected':''} onClick={()=>setTab('agenda')}><CalendarDays size={19}/> Mi agenda</button><button className={tab==='tareas'?'selected':''} onClick={()=>setTab('tareas')}><ListTodo size={19}/> Mis tareas</button><button className={tab==='compras'?'selected':''} onClick={()=>setTab('compras')}><ShoppingBasket size={19}/> Compras</button></nav><div className="account">{profile?<><span>{profile.email}</span><button onClick={logout}><LogOut size={16}/> Desconectar</button></>:<button onClick={login}><LogIn size={16}/> Entrar con Google</button>}</div></aside><main><header><div><p className="eyebrow">MI ESPACIO PERSONAL</p><h1>{tab==='agenda'?'Tu semana, a tu manera':tab==='tareas'?'Tus tareas':'Lista de compras'}</h1><p className="subtitle">Todo lo importante, en un solo lugar.</p></div><div className="avatar">{profile?.name?.[0]??'✦'}</div></header><section className="quick"><div className="quick-heading"><span className="sparkle">✳</span><div><strong>¿Qué tenés en mente?</strong><p>Creá una actividad de una hora en tu calendario de Google.</p></div></div>{tab==='agenda'?<><div className="composer"><input aria-label="Nombre de la actividad" value={title} onChange={e=>setTitle(e.target.value)} placeholder="Ej: Hockey de Martina"/><button className="mic" title="Voz próximamente" disabled><Mic size={19}/></button></div><div className="composer"><input aria-label="Fecha y hora" type="datetime-local" value={start} onChange={e=>setStart(e.target.value)}/><button className="add" disabled={busy} onClick={addEvent}><Plus size={19}/> Agregar</button></div><p className="subtitle">Avisos: 1 día, 6 horas y 1 hora antes. Duración inicial: 60 minutos.</p></>:<p className="subtitle">Las listas personales y compartidas llegarán con la integración de Google Drive.</p>}{message&&<p className="notice" role="status">{message}</p>}{!profile&&<button className="connect" onClick={login}><LogIn size={17}/> Conectar Google Calendar</button>}</section><div className="section-heading"><div><p className="eyebrow">UN VISTAZO</p><h2>{tab==='agenda'?'Próximos 7 días':tab==='tareas'?'Pendientes':'Para comprar'}</h2></div><span className="date">{today.toLocaleDateString('es-AR',{month:'long',year:'numeric'})}</span></div>{tab==='agenda'?<><div className="days">{days.map((d,i)=><div className={'day '+(i===0?'today':'')} key={i}><span>{weekdays[d.getDay()]}</span><strong>{d.getDate()}</strong></div>)}</div>{profile&&<div className="calendar-toolbar"><strong>Eventos de Google Calendar</strong><button onClick={reload} disabled={busy}><RefreshCw size={16}/> Actualizar</button></div>}{events.length>0?<div className="events">{events.map(event=><a className="event" key={event.id} href={event.htmlLink??'#'} target="_blank" rel="noreferrer"><span>{event.start?.dateTime?new Date(event.start.dateTime).toLocaleString('es-AR',{weekday:'short',day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}):event.start?.date??'Sin fecha'}</span><strong>{event.summary??'Sin título'}</strong></a>)}</div>:<section className="empty"><div className="empty-icon"><CalendarDays size={30}/></div><h3>{profile?'No hay eventos próximos':'Tu semana empieza acá'}</h3><p>{profile?'No encontramos eventos en tu calendario principal para los próximos siete días.':'Conectá tu cuenta para ver tus próximos eventos.'}</p></section>}</>:<section className="empty"><div className="empty-icon">{tab==='tareas'?<CheckCircle2 size={30}/>:<ShoppingBasket size={30}/>}</div><h3>{tab==='tareas'?'Tus tareas estarán acá':'Tu lista de compras estará acá'}</h3><p>Esta función todavía está en desarrollo. No se guardan datos por ahora.</p></section>}<footer>Agenda Locuaz · Integración inicial Google Calendar</footer></main><div className="mobile-nav"><button onClick={()=>setTab('agenda')} className={tab==='agenda'?'active':''}><CalendarDays size={21}/>Agenda</button><button onClick={()=>setTab('tareas')} className={tab==='tareas'?'active':''}><ListTodo size={21}/>Tareas</button><button onClick={()=>setTab('compras')} className={tab==='compras'?'active':''}><ShoppingBasket size={21}/>Compras</button></div></div>;
}
