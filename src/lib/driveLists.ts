export type ListKind='tareas'|'compras';
export type ListEntry={id:string;text:string;done:boolean;createdAt:string};
export type ListsData={version:1;updatedAt:string;tareas:ListEntry[];compras:ListEntry[]};
const fileName='agenda-locuaz-lists-v1.json';
export const emptyLists=():ListsData=>({version:1,updatedAt:new Date().toISOString(),tareas:[],compras:[]});
async function api(token:string,url:string,init?:RequestInit):Promise<Response>{
 const r=await fetch(url,{...init,headers:{Authorization:`Bearer ${token}`,...(init?.headers??{})}});
 if(!r.ok){let msg=`Google Drive: error ${r.status}`;try{const json=await r.json() as {error?:{message?:string}};msg=json.error?.message??msg;}catch{}throw new Error(msg);}
 return r;
}
function parseLists(value:unknown):ListsData{
 if(!value||typeof value!=='object')throw new Error('El archivo de listas no tiene un formato válido.');
 const data=value as Partial<ListsData>;
 if(data.version!==1||!Array.isArray(data.tareas)||!Array.isArray(data.compras))throw new Error('Versión de listas no compatible.');
 const valid=(items:unknown[]):items is ListEntry[]=>items.every(i=>!!i&&typeof i==='object'&&typeof (i as ListEntry).id==='string'&&typeof (i as ListEntry).text==='string'&&typeof (i as ListEntry).done==='boolean');
 if(!valid(data.tareas)||!valid(data.compras))throw new Error('Los datos de las listas no son válidos.');
 return {version:1,updatedAt:typeof data.updatedAt==='string'?data.updatedAt:'',tareas:data.tareas,compras:data.compras};
}
export async function loadLists(token:string):Promise<{fileId:string|null;data:ListsData}>{
 const params=new URLSearchParams({spaces:'appDataFolder',q:`name = '${fileName}' and trashed = false`,fields:'nextPageToken,files(id,name,modifiedTime)',page_size:'100'});
 // Drive expects pageSize, not page_size.
 params.delete('page_size');params.set('pageSize','100');
 const response=await api(token,`https://www.googleapis.com/drive/v3/files?${params}`);
 const listing=await response.json() as {files?:{id:string;modifiedTime?:string}[]};
 const files=(listing.files??[]).sort((a,b)=>(b.modifiedTime??'').localeCompare(a.modifiedTime??''));
 if(!files.length)return {fileId:null,data:emptyLists()};
 const fileId=files[0].id;
 const file=await api(token,`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?alt=media`);
 return {fileId,data:parseLists(await file.json())};
}
export async function saveLists(token:string,fileId:string|null,data:ListsData):Promise<string>{
 const body=JSON.stringify({...data,updatedAt:new Date().toISOString()});
 if(fileId){
  await api(token,`https://www.googleapis.com/upload/drive/v3/files/${encodeURIComponent(fileId)}?uploadType=media`,{method:'PATCH',headers:{'Content-Type':'application/json'},body});
  return fileId;
 }
 const boundary='agendaLocuazBoundary'+Date.now();
 const multipart=`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify({name:fileName,mimeType:'application/json',parents:['appDataFolder']})}\r\n--${boundary}\r\nContent-Type: application/json\r\n\r\n${body}\r\n--${boundary}--`;
 const response=await api(token,'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id',{method:'POST',headers:{'Content-Type':`multipart/related; boundary=${boundary}`},body:multipart});
 const created=await response.json() as {id:string};
 if(!created.id)throw new Error('Drive no devolvió el identificador del archivo.');
 return created.id;
}
