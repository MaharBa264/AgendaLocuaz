export type ParsedEvent={title:string;start:string;ambiguous:boolean;notes:string[]};
const weekdays:Record<string,number>={domingo:0,lunes:1,martes:2,miercoles:3,jueves:4,viernes:5,sabado:6};
const pad=(n:number)=>String(n).padStart(2,'0');
const format=(d:Date)=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
export function interpretEvent(input:string,now=new Date()):ParsedEvent|null{
 const normalized=input.toLocaleLowerCase('es-AR').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
 let date:Date|null=null;let match:RegExpMatchArray|null=null;
 if(/\bpasado manana\b/.test(normalized)){date=new Date(now);date.setDate(date.getDate()+2);}
 else if(/\bmanana\b/.test(normalized)){date=new Date(now);date.setDate(date.getDate()+1);}
 else if(/\bhoy\b/.test(normalized)){date=new Date(now);}
 else if((match=normalized.match(/\b(?:el\s+)?(domingo|lunes|martes|miercoles|jueves|viernes|sabado)\b/))){
  date=new Date(now);const delta=(weekdays[match[1]]-date.getDay()+7)%7;date.setDate(date.getDate()+(delta||7)+(/\b(?:proximo|que viene)\b/.test(normalized)?(delta?0:7):0));
 }else if((match=normalized.match(/\b(\d{1,2})[\/-](\d{1,2})(?:[\/-](\d{4}))?\b/))){
  const day=Number(match[1]),month=Number(match[2])-1,year=match[3]?Number(match[3]):now.getFullYear();
  date=new Date(year,month,day);
  if(date.getDate()!==day||date.getMonth()!==month)return null;
  if(!match[3]&&date<now)date.setFullYear(date.getFullYear()+1);
 }
 if(!date)return null;
 const time=normalized.match(/\b(?:a\s+las?|a\s+la|las)\s+(\d{1,2})(?::(\d{2}))?\s*(de la manana|de la tarde|de la noche|am|pm)?\b/);
 const notes:string[]=[];let ambiguous=false;
 let hour=9,minute=0;
 if(time){
  hour=Number(time[1]);minute=Number(time[2]??0);
  if(hour>23||minute>59)return null;
  const part=time[3]??'';
  if(hour<=12&&/tarde|noche|pm/.test(part)&&hour<12)hour+=12;
  if(hour===12&&/manana|am/.test(part))hour=0;
  if(!part&&hour<=12){ambiguous=true;notes.push('Confirmá si la hora es de mañana o de tarde.');}
 }else{ambiguous=true;notes.push('No detecté una hora; propongo las 09:00.');}
 date.setHours(hour,minute,0,0);
 const title=input.trim().replace(/\b(pasado mañana|mañana|hoy)\b/ig,'').replace(/\b(el\s+)?(domingo|lunes|martes|miércoles|miercoles|jueves|viernes|sábado|sabado)(\s+(próximo|proximo|que viene))?\b/ig,'').replace(/\b(a\s+las?|a\s+la|las)\s+\d{1,2}(:\d{2})?\s*(de la mañana|de la manana|de la tarde|de la noche|am|pm)?\b/ig,'').replace(/\b(tengo que|recordame que|agendá|agenda|anotá|anota)\b/ig,'').replace(/^[\s,.:;-]+|[\s,.:;-]+$/g,'').replace(/\s+/g,' ');
 return {title:title||input.trim(),start:format(date),ambiguous,notes};
}
