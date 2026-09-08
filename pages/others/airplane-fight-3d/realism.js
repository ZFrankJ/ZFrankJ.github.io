/* Local procedural assets. No network, model downloads, or build step required. */
window.createRealism = function (T) {
  const clamp = T.MathUtils.clamp;
  let seed = 7319;
  const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  const hash = (x, y) => { const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return n - Math.floor(n); };
  function noise(x, y) {
    const ix = Math.floor(x), iy = Math.floor(y); let u = x - ix, v = y - iy;
    u = u*u*(3-2*u); v = v*v*(3-2*v);
    return T.MathUtils.lerp(T.MathUtils.lerp(hash(ix,iy),hash(ix+1,iy),u),T.MathUtils.lerp(hash(ix,iy+1),hash(ix+1,iy+1),u),v);
  }
  function fbm(x,y) { return noise(x,y)*.54 + noise(x*2.1,y*2.1)*.27 + noise(x*4.3,y*4.3)*.13 + noise(x*8.7,y*8.7)*.06; }
  function tileNoise(u,v,period) {
    const x=u*period,y=v*period,ix=Math.floor(x),iy=Math.floor(y);
    let a=x-ix,b=y-iy;a=a*a*(3-2*a);b=b*b*(3-2*b);
    const sample=(x,y)=>hash(x%period,y%period);
    return T.MathUtils.lerp(T.MathUtils.lerp(sample(ix,iy),sample(ix+1,iy),a),T.MathUtils.lerp(sample(ix,iy+1),sample(ix+1,iy+1),a),b);
  }
  function height(x,z) {
    const r = Math.hypot(x, z-40);
    const foothills = T.MathUtils.smoothstep(r, 200, 950);
    const mountains = T.MathUtils.smoothstep(r, 1000, 2600);
    return foothills * (8 + 90 * Math.pow(fbm(x*.0025+20,z*.0025),2)) + mountains * (70 + 400 * Math.pow(fbm(x*.001+60,z*.001+20),3));
  }
  let groundGrid;
  function terrainSurface(x,z){
    if(!groundGrid)return height(x,z);
    const {positions,axis,stride}=groundGrid;
    const cell=v=>{let lo=0,hi=axis.length-1;while(hi-lo>1){const mid=(lo+hi)>>1;if(axis[mid]<=v)lo=mid;else hi=mid;}return lo;};
    const ix=cell(x),iz=cell(z),u=clamp((x-axis[ix])/(axis[ix+1]-axis[ix]),0,1),v=clamp((z-axis[iz])/(axis[iz+1]-axis[iz]),0,1);
    const a=positions.getY(iz*stride+ix),b=positions.getY((iz+1)*stride+ix),c=positions.getY((iz+1)*stride+ix+1),d=positions.getY(iz*stride+ix+1);
    return u+v<=1?a+(d-a)*u+(b-a)*v:c+(b-c)*(1-u)+(d-c)*(1-v);
  }
  const countryRoadX=z=>300+70*Math.sin(z*.0018+.4)+32*Math.sin(z*.0041-1)+.000018*z*z;
  const laneCells=new Map();
  function nearCountryLane(x,z,clearance=3){
    for(const [ax,az,bx,bz,width] of laneCells.get(`${Math.floor(x/32)},${Math.floor(z/32)}`)||[]){
      const dx=bx-ax,dz=bz-az,t=clamp(((x-ax)*dx+(z-az)*dz)/Math.max(.000001,dx*dx+dz*dz),0,1);
      if(Math.hypot(x-ax-t*dx,z-az-t*dz)<width*.5+clearance)return true;
    }
    return false;
  }
  const forestPatches=[[-230,170,65,44],[240,-170,65,46],[-490,-450,80,55],[530,380,75,50],[-850,700,95,60],[820,-700,90,55],[150,1080,90,65]];
  function forestDensity(x,z) {
    if(Math.hypot(x,z-40)<155||nearCountryLane(x,z)|| (Math.abs(z)<=2400&&Math.abs(x-countryRoadX(z))<4))return 0;
    let density=0;
    for(const [cx,cz,rx,rz] of forestPatches){
      const distance=Math.hypot((x-cx)/rx,(z-cz)/rz);
      const boundary=1+(noise(x*.035,z*.035)-.5)*.75+(noise(x*.09,z*.09)-.5)*.16;
      density=Math.max(density,clamp((boundary-distance)*5,0,1));
    }
    // Deliberate open glades within larger stands, as well as broad treeless land between them.
    for(const [cx,cz] of [[-245,174],[533,392],[150,1080]])density*=T.MathUtils.smoothstep(Math.hypot(x-cx,z-cz),10,19);
    return density;
  }
  const canvas = (w,h=w) => { const c=document.createElement('canvas');c.width=w;c.height=h;return c; };
  function texture(c, repeat=1) { const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(repeat,repeat);t.anisotropy=8;return t; }
  const standard = (color, roughness=.6, metalness=.1, extra={}) => new T.MeshStandardMaterial({color,roughness,metalness,...extra});
  function mesh(g,geo,mat,x=0,y=0,z=0) { const m=new T.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;g.add(m);return m; }
  function rod(g,a,b,r,mat) { a=new T.Vector3(...a);b=new T.Vector3(...b);const d=b.clone().sub(a);const m=mesh(g,new T.CylinderGeometry(r,r,d.length(),10),mat);m.position.copy(a.add(b).multiplyScalar(.5));m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());return m; }
  let sky, skyFill, terrainMaterial, terrainPixels, runwayTexture, particleTexture;
  const cloudTextures = [];
  const pavements = [];
  let activeClouds,cloudPass;
  let cloudScale=.85,frameAverage=20,qualityClock=0,qualityCooldown=5000;
  const cloudMist={value:0};
  function mistMaterial(material){
    material.onBeforeCompile=shader=>{
      shader.uniforms.cloudMist=cloudMist;
      shader.fragmentShader='uniform float cloudMist;\n'+shader.fragmentShader;
      shader.fragmentShader=shader.fragmentShader.replace('#include <fog_fragment>',`#include <fog_fragment>
        #ifdef USE_FOG
          gl_FragColor.a*=exp(-cloudMist*vFogDepth);
        #endif`);
    };
    material.customProgramCacheKey=()=> 'local-cloud-mist';return material;
  }
  const cloudFrustum=new T.Frustum(),cloudProjection=new T.Matrix4(),cloudSphere=new T.Sphere();
  const cloudBounds=new T.Box3(),cloudExtents=new T.Vector3();
  function beginFrame(dt) {
    if(dt<=0||dt>1)return; // Ignore startup, tab suspension and debugger pauses.
    const ms=Math.min(dt*1000,100);qualityClock+=dt*1000;
    // Respond to sustained heavy views quickly, but retain that headroom through
    // brief clear-sky turns instead of immediately pushing quality back up.
    frameAverage+=(ms-frameAverage)*(ms>frameAverage?.12:.008);
    if(qualityClock>qualityCooldown){
      if(frameAverage>30&&cloudScale>.6){cloudScale=Math.max(.6,cloudScale-.05);qualityCooldown=qualityClock+3000;}
      else if(frameAverage<21&&cloudScale<.9){cloudScale=Math.min(.9,cloudScale+.025);qualityCooldown=qualityClock+10000;}
    }
  }
  const sceneryBoxes=[];
  function atmosphere(scene, renderer, sun) {
    renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.08;
    renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
    sun.position.set(-140,220,-280);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);
    Object.assign(sun.shadow.camera,{left:-28,right:28,top:28,bottom:-28,near:1,far:600});
    sun.shadow.bias=-.00015;sun.shadow.normalBias=.025;sun.shadow.radius=3;scene.add(sun.target);
    skyFill=new T.HemisphereLight(0xb9d6ed,0x6b604b,1.5);scene.add(skyFill);
    // A full-screen background is independent of world distance and the scene's log-depth buffer.
    // Reconstruct the world ray from the current camera, including each split-screen viewport.
    sky=new T.Mesh(new T.PlaneGeometry(2,2),new T.ShaderMaterial({
      depthTest:false,depthWrite:false,fog:false,toneMapped:false,
      uniforms:{top:{value:new T.Color('#286fa5')},bottom:{value:new T.Color('#bcd5df')},sun:{value:sun.position.clone().normalize()},strength:{value:1}},
      vertexShader:`varying vec3 direction;
        void main(){
          vec3 ray=vec3(position.x/projectionMatrix[0][0],position.y/projectionMatrix[1][1],-1.);
          direction=vec3(dot(viewMatrix[0].xyz,ray),dot(viewMatrix[1].xyz,ray),dot(viewMatrix[2].xyz,ray));
          gl_Position=vec4(position.xy,1.,1.);
        }`,
      fragmentShader:`varying vec3 direction;uniform vec3 top;uniform vec3 bottom;uniform vec3 sun;uniform float strength;
        void main(){
          vec3 d=normalize(direction);float h=max(d.y,0.);
          vec3 c=mix(bottom,top,1.-exp(-h*3.5));float s=max(dot(d,sun),0.);
          c+=vec3(1.,.80,.57)*(pow(s,18.)*.12+pow(s,500.)*.7+pow(s,16000.)*7.)*strength;
          gl_FragColor=vec4(c,1.);
          #include <colorspace_fragment>
        }`
    }));
    sky.name='infinite-sky';sky.frustumCulled=false;sky.renderOrder=-1000;scene.add(sky);
    const faces=[];
    for(let i=0;i<6;i++){const c=canvas(128),ctx=c.getContext('2d'),g=ctx.createLinearGradient(0,0,0,128);g.addColorStop(0,i===3?'#645f45':'#aec4d1');g.addColorStop(.5,'#ddd5bd');g.addColorStop(1,'#656950');ctx.fillStyle=g;ctx.fillRect(0,0,128,128);faces.push(c);}
    const env=new T.CubeTexture(faces);env.colorSpace=T.SRGBColorSpace;env.needsUpdate=true;scene.environment=env;
  }
  function treeGeometry() {
    const positions=[],normals=[];
    for(let i=0;i<5;i++){
      const g=new T.IcosahedronGeometry(i===0?.75:.48,1);
      const a=i*2.4;g.translate(i===0?0:Math.sin(a)*.45,i===0?.2:Math.cos(i)*.32,i===0?0:Math.cos(a)*.45);
      const p=g.attributes.position;
      for(let j=0;j<p.count;j++)positions.push(p.getX(j),p.getY(j),p.getZ(j));
      g.dispose();
    }
    const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.computeVertexNormals();return g;
  }
  function ground(root) {
    const c=canvas(1024),ctx=c.getContext('2d'),data=ctx.createImageData(1024,1024);
    for(let y=0;y<1024;y++)for(let x=0;x<1024;x++){
      const u=x/1024,v=y/1024;
      const n=tileNoise(u,v,16)*.54+tileNoise(u,v,32)*.27+tileNoise(u,v,64)*.13+tileNoise(u,v,128)*.06;
      const grain=(random()-.5)*22,field=tileNoise(u,v,46);
      const i=(y*1024+x)*4;data.data[i]=65+n*57+grain+field*13;data.data[i+1]=70+n*58+grain;data.data[i+2]=42+n*38+grain;data.data[i+3]=255;
    }
    ctx.putImageData(data,0,0);
    terrainPixels = data.data;
    const tex=texture(c,64);
    terrainMaterial=standard(0xd0c8ac,.97,0,{map:tex,vertexColors:true});
    // One connected surface: denser vertices near the airfield, with one world UV scale.
    // No overlapping local/far meshes, different texture densities, or exposed tile edge.
    const geo=new T.PlaneGeometry(8200,8200,320,320);geo.rotateX(-Math.PI/2);
    const positions=geo.attributes.position,uv=geo.attributes.uv;
    const warp=v=>4100*(.10*v+.90*v*v*v);
    for(let i=0;i<positions.count;i++) {
      const x=warp(positions.getX(i)/4100),z=warp(positions.getZ(i)/4100);
      positions.setXYZ(i,x,height(x,z),z);
      uv.setXY(i,(x+4100)/8200,(4100-z)/8200);
    }
    groundGrid={positions,axis:Array.from({length:321},(_,i)=>positions.getX(i)),stride:321};
    const shades=[];
    for(let i=0;i<positions.count;i++){const shade=1-forestDensity(positions.getX(i),positions.getZ(i))*.36;shades.push(shade,shade,shade);}
    geo.setAttribute('color',new T.Float32BufferAttribute(shades,3));
    geo.computeVertexNormals();
    const terrain=mesh(root,geo,terrainMaterial);terrain.name='continuous-terrain';terrain.castShadow=false;
    countryside(root);
    // Concentrate the instance budget in woodland stands; leave the plains entirely treeless.
    const count=14000,crowns=new T.InstancedMesh(treeGeometry(),standard(0x344333,.92,0),count);
    const trunks=new T.InstancedMesh(new T.CylinderGeometry(.08,.14,1,5),standard(0x514235,.95,0),count);
    crowns.name='forest-canopies';trunks.name='forest-trunks';
    const d=new T.Object3D(),color=new T.Color();let n=0;
    for(let attempt=0;n<count&&attempt<90000;attempt++){
      const patch=forestPatches[Math.floor(random()*forestPatches.length)];
      const x=patch[0]+(random()-.5)*patch[2]*2.3,z=patch[1]+(random()-.5)*patch[3]*2.3;
      if(random()>forestDensity(x,z)||nearCountryLane(x,z)||sceneryBoxes.some(b=>x>b.min.x-3&&x<b.max.x+3&&z>b.min.z-3&&z<b.max.z+3))continue;
      const h=1.2+random()*1.8,y=height(x,z);
      d.position.set(x,y+h*.68,z);d.scale.set(h*.55,h*.70,h*.55);d.rotation.set(random()*.15,random()*6.28,0);d.updateMatrix();crowns.setMatrixAt(n,d.matrix);
      color.setHSL(.23+random()*.07,.18+random()*.16,.14+random()*.08);crowns.setColorAt(n,color);
      d.position.y=y+h*.25;d.scale.set(1,h*.5,1);d.updateMatrix();trunks.setMatrixAt(n,d.matrix);n++;
    }
    crowns.count=trunks.count=n;crowns.receiveShadow=true;root.add(crowns,trunks);
  }
  function countryside(root) {
    const village=new T.Group();village.name='countryside';root.add(village);
    const roadMaterial=standard(0x796e54,.98,0),tile=standard(0x645748,.93,.03),windowMat=standard(0x35434a,.45,.05);
    const housePlots=[],driveways=[];laneCells.clear();sceneryBoxes.length=0;
    // One continuous, asymmetric valley road, continuing beyond both foothills.
    const road=z=>new T.Vector3(countryRoadX(z),0,z);
    const roadPoints=Array.from({length:481},(_,i)=>road(-2400+i*10));
    function lane(points,width,raise=.07){
      const curve=new T.CatmullRomCurve3(points),samples=curve.getPoints(Math.max(4,Math.ceil(curve.getLength()/1.5))),positions=[],indices=[];
      for(let i=0;i<samples.length;i++){
        const a=samples[Math.max(0,i-1)],b=samples[Math.min(samples.length-1,i+1)],dx=b.x-a.x,dz=b.z-a.z,length=Math.hypot(dx,dz)||1;
        for(const side of [-1,1]){const x=samples[i].x+side*dz/length*width/2,z=samples[i].z-side*dx/length*width/2;positions.push(x,terrainSurface(x,z)+raise,z);}
        if(i<samples.length-1){const j=i*2;indices.push(j,j+2,j+1,j+1,j+2,j+3);}
      }
      // Both dense woodland and sparse trees reserve the full lane plus canopy clearance.
      for(let i=1;i<samples.length;i++){
        const a=samples[i-1],b=samples[i],pad=width*.5+4,segment=[a.x,a.z,b.x,b.z,width];
        for(let gx=Math.floor((Math.min(a.x,b.x)-pad)/32);gx<=Math.floor((Math.max(a.x,b.x)+pad)/32);gx++)
          for(let gz=Math.floor((Math.min(a.z,b.z)-pad)/32);gz<=Math.floor((Math.max(a.z,b.z)+pad)/32);gz++){
            const key=`${gx},${gz}`;if(!laneCells.has(key))laneCells.set(key,[]);laneCells.get(key).push(segment);
          }
      }
      const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));geometry.setIndex(indices);geometry.computeVertexNormals();
      const path=mesh(village,geometry,roadMaterial);path.name='country-lane';path.castShadow=false;return path;
    }
    const mainRoad=lane(roadPoints,1.15);mainRoad.name='main-country-road';
    mainRoad.userData.centerline=roadPoints;
    // Unequal hamlets with irregular setbacks and gaps, never mirrored pairs.
    for(const [center,houseCount,bias] of [[-1050,5,.8],[-480,8,.3],[180,7,.75],[630,6,.4],[1280,6,.85],[1870,4,.25]]){
      let cursor=center-houseCount*4;
      for(let i=0;i<houseCount;i++){
        cursor+=5+random()*7;
        const z=cursor,anchor=road(z),offset=(random()<bias?1:-1)*(5+random()*13);
        const x=anchor.x+offset,w=1.1+random()*.65,d=.95+random()*.55,h=.58+random()*.35;
        const cottage=new T.Group();cottage.name='rural-cottage';cottage.userData.kind='cottage';cottage.position.set(x,terrainSurface(x,z),z);
        cottage.rotation.y=Math.atan2(anchor.x-x,.5)+(random()-.5)*.25;village.add(cottage);
        const floor=Math.max(...[-w/2,w/2].flatMap(dx=>[-d/2,d/2].map(dz=>terrainSurface(x+dx,z+dz))))+.06;
        cottage.position.y=floor;
        mesh(cottage,new T.BoxGeometry(w+.08,.20,d+.08),standard(0x777466,.97,0),0,-.04,0);
        const wall=standard([0xc4b89c,0xa89078,0xb8ae96,0x998976][i%4],.97,0);
        mesh(cottage,new T.BoxGeometry(w,h,d),wall,0,h/2,0);
        const shape=new T.Shape();shape.moveTo(-w*.58,0);shape.lineTo(0,w*.34);shape.lineTo(w*.58,0);shape.closePath();
        mesh(cottage,new T.ExtrudeGeometry(shape,{depth:d+.18,bevelEnabled:false}),tile,0,h,-d/2-.09);
        mesh(cottage,new T.BoxGeometry(.12,.42,.13),wall,w*.27,h+.20,0);
        mesh(cottage,new T.BoxGeometry(.23,.40,.025),standard(0x484c3b,.94,0),0,.20,d/2+.018);
        for(const face of [-1,1])for(const wx of [-w*.3,w*.3])mesh(cottage,new T.BoxGeometry(.20,.21,.027),windowMat,wx,h*.63,face*(d/2+.018));
        const door=new T.Vector3(0,0,d/2+.18);cottage.updateWorldMatrix(true,true);cottage.localToWorld(door);
        lane([door,new T.Vector3((door.x+anchor.x)/2,0,z),anchor],.24,.095);
        driveways.push([door.clone(),anchor.clone()]);
        cottage.userData.doorway=door;housePlots.push({x,z,r:Math.hypot(w,d)});
        sceneryBoxes.push(new T.Box3().setFromObject(cottage));
        // Short timber fences and kitchen gardens tie the houses to their plots.
        mesh(village,new T.BoxGeometry(1.4,.04,.8),standard(0x665942,.98,0),x,floor+.01,z+1.6);
        for(let post=0;post<5;post++)mesh(village,new T.BoxGeometry(.035,.22,.035),standard(0x6b644c,.95,0),x-1+post*.5,terrainSurface(x-1+post*.5,z-1.5)+.11,z-1.5);
      }
    }
    const count=3000,crowns=new T.InstancedMesh(treeGeometry(),standard(0x43513b,.94,0),count),trunks=new T.InstancedMesh(new T.CylinderGeometry(.07,.10,1,5),standard(0x65553e,.97,0),count);
    crowns.name='roadside-canopies';trunks.name='roadside-trunks';const dummy=new T.Object3D(),color=new T.Color();let n=0;
    const occupied=new Set(),spacing=5;
    const nearDrive=(x,z)=>driveways.some(([a,b])=>{
      const dx=b.x-a.x,dz=b.z-a.z,t=clamp(((x-a.x)*dx+(z-a.z)*dz)/(dx*dx+dz*dz),0,1);
      return Math.hypot(x-a.x-t*dx,z-a.z-t*dz)<2;
    });
    for(let attempt=0;n<count&&attempt<50000;attempt++){
      const z=-2250+random()*4500;
      const x=random()<.32?road(z).x+(random()>.5?1:-1)*(5+random()*65):-1600+random()*3300;
      if(Math.hypot(x,z-40)<180||nearCountryLane(x,z)||forestDensity(x,z)>.1)continue;
      if(housePlots.some(p=>Math.hypot(x-p.x,z-p.z)<p.r+4)||nearDrive(x,z))continue;
      if(noise(x*.008,z*.008)<.28)continue;
      const gx=Math.floor(x/spacing),gz=Math.floor(z/spacing);
      let nearby=false;
      for(let dx=-1;dx<=1;dx++)for(let dz=-1;dz<=1;dz++)if(occupied.has(`${gx+dx},${gz+dz}`))nearby=true;
      if(nearby)continue;occupied.add(`${gx},${gz}`);
      const h=1+random()*2,y=terrainSurface(x,z);dummy.position.set(x,y+h*.68,z);dummy.scale.set(h*(.42+random()*.16),h*.7,h*.52);dummy.rotation.y=random()*6.28;dummy.updateMatrix();crowns.setMatrixAt(n,dummy.matrix);
      color.setHSL(.23+random()*.06,.16+random()*.16,.19+random()*.08);crowns.setColorAt(n,color);
      dummy.position.y=y+h*.24;dummy.scale.set(1,h*.48,1);dummy.updateMatrix();trunks.setMatrixAt(n,dummy.matrix);n++;
    }
    crowns.count=trunks.count=n;crowns.receiveShadow=true;village.add(crowns,trunks);
    // Static local transforms need no recomposition during any of the five render passes.
    village.traverse(o=>{o.updateMatrix();o.matrixAutoUpdate=false;});
  }

  function radialTexture() {
    const c=canvas(128),ctx=c.getContext('2d'),s=c.width;
    const g=ctx.createRadialGradient(s/2,s/2,0,s/2,s/2,s/2);
    g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.25,'rgba(255,255,255,.8)');
    g.addColorStop(.6,'rgba(220,220,220,.26)');g.addColorStop(1,'rgba(255,255,255,0)');
    ctx.fillStyle=g;ctx.fillRect(0,0,s,s);return texture(c);
  }
  function cloudTexture(variant) {
    const size=window.cloudVolumeResolution,packed=atob(window.cloudVolumes[variant]);
    const data=Uint8Array.from(packed,c=>c.charCodeAt(0));
    const map=new T.Data3DTexture(data,size,size,size);
    map.format=T.RGFormat;map.type=T.UnsignedByteType;
    map.minFilter=map.magFilter=T.LinearFilter;map.unpackAlignment=1;
    map.wrapS=map.wrapT=map.wrapR=T.ClampToEdgeWrapping;map.needsUpdate=true;
    // Rasterize only the occupied density bounds, padded for trilinear filtering.
    // Ray integration still uses the original box and exactly the same sample positions.
    const lo=[size,size,size],hi=[0,0,0];
    for(let z=0;z<size;z++)for(let y=0;y<size;y++)for(let x=0;x<size;x++)if(data[((z*size+y)*size+x)*2]){
      lo[0]=Math.min(lo[0],x);lo[1]=Math.min(lo[1],y);lo[2]=Math.min(lo[2],z);
      hi[0]=Math.max(hi[0],x);hi[1]=Math.max(hi[1],y);hi[2]=Math.max(hi[2],z);
    }
    const min=lo.map(v=>Math.max(-1,2*(v-.5)/size-1)),max=hi.map(v=>Math.min(1,2*(v+1.5)/size-1));
    map.userData.volumeGeometry=new T.BoxGeometry(...max.map((v,i)=>v-min[i]));
    map.userData.volumeGeometry.translate(...max.map((v,i)=>(v+min[i])*.5));
    return map;
  }
  function cloudMaterial(volume,cfg,extinction) {
    return new T.ShaderMaterial({
      glslVersion:T.GLSL3,transparent:true,depthTest:false,depthWrite:false,side:T.BackSide,fog:true,
      blending:T.CustomBlending,blendSrc:T.OneFactor,blendDst:T.OneFactor,blendEquation:T.AddEquation,
      uniforms:{...T.UniformsUtils.clone(T.UniformsLib.fog),
        sceneDepth:{value:null},cloudDepth:{value:null},cloudId:{value:0},occlusionPass:{value:false},viewportSize:{value:new T.Vector2(1,1)},cameraFar:{value:8200},
        volume:{value:volume},tint:{value:new T.Color(cfg.sunVisible?'#ffffff':cfg.rain?'#777777':'#898989')},highTint:{value:new T.Color(cfg.sunVisible?'#ffffff':cfg.rain?'#858585':'#999999')},extinction:{value:extinction},
        greyWeather:{value:!cfg.sunVisible},skyTop:{value:new T.Color(cfg.rain?'#70777b':'#8b969d')},skyBottom:{value:new T.Color(cfg.rain?'#959b9e':'#bac2c6')}
      },
      vertexShader:`varying vec3 localPosition;varying vec3 localEye;varying vec3 worldRay;
        uniform vec3 tint;uniform vec3 highTint;varying vec3 cloudTint;varying float highLight;
        #include <common>
        #include <logdepthbuf_pars_vertex>
        void main(){
          localPosition=position;
          worldRay=(modelMatrix*vec4(position,1.)).xyz-cameraPosition;
          localEye=(inverse(modelMatrix)*vec4(cameraPosition,1.)).xyz;
          // A formation's world altitude determines its tone, independent of its density texture.
          highLight=smoothstep(160.,730.,modelMatrix[3].y);
          cloudTint=mix(tint,highTint,highLight);
          gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);
          #include <logdepthbuf_vertex>
        }`,
      fragmentShader:`precision highp sampler3D;
        layout(location=0) out vec4 accumulation;layout(location=1) out vec4 opticalDepth;
        uniform sampler2D sceneDepth;uniform sampler2D cloudDepth;uniform float cloudId;uniform bool occlusionPass;uniform vec2 viewportSize;uniform float cameraFar;
        uniform sampler3D volume;uniform float extinction;
        uniform bool greyWeather;uniform vec3 skyTop;uniform vec3 skyBottom;varying vec3 worldRay;
        varying vec3 cloudTint;varying float highLight;
        varying vec3 localPosition;varying vec3 localEye;
        uniform mat4 modelViewMatrix;
        #include <logdepthbuf_pars_fragment>
        #include <fog_pars_fragment>
        void main(){
          // Dense cloud cores block the rear deck. Low-density fringes integrate
          // continuously in front of that depth instead of becoming solid cutouts.
          vec3 direction=normalize(localPosition-localEye);
          // Sign-preserving epsilon handles rays parallel to a box face, including straight up.
          vec3 safeDirection=mix(vec3(1.e-6),direction,greaterThan(abs(direction),vec3(1.e-6)));
          vec3 a=(-vec3(1.)-localEye)/safeDirection,b=(vec3(1.)-localEye)/safeDirection;
          vec3 nearSide=min(a,b),farSide=max(a,b);
          float start=max(0.,max(nearSide.x,max(nearSide.y,nearSide.z)));
          float finish=min(farSide.x,min(farSide.y,farSide.z));
          float solidDepth=texture(sceneDepth,gl_FragCoord.xy/viewportSize).r;
          float solidZ=exp2(solidDepth*log2(cameraFar+1.))-1.;
          float rayViewZ=-(modelViewMatrix*vec4(direction,0.)).z;
          finish=min(finish,solidZ/max(rayViewZ,1.e-6));
          if(!occlusionPass){
            vec2 blocker=texture(cloudDepth,gl_FragCoord.xy/viewportSize).rg;
            if(blocker.g>.5&&abs(blocker.g-cloudId)>.25)
              finish=min(finish,blocker.r*cameraFar/max(rayViewZ,1.e-6));
          }
          if(finish<=start)discard;
          // Fixed, spatially anchored integration avoids temporal noise and coarse moving bands.
          float steps=length(localEye)<5.?96.:length(localEye)<12.?64.:40.;
          float stepLength=(finish-start)/steps;
          float transmission=1.;vec3 radiance=vec3(0.);vec3 hit=localEye+direction*start;
          for(int i=0;i<96;i++){
            if(float(i)>=steps||transmission<.012)break;
            vec3 p=localEye+direction*(start+(float(i)+.5)*stepLength);
            vec2 sampleValue=texture(volume,p*.5+.5).rg;
            float opacity=1.-exp(-sampleValue.r*stepLength*extinction);
            if(transmission>.90)hit=p;
            if(!occlusionPass){
              // Diffuse illumination under a covered sky: no sunlit white rims on each bank.
              float lighting=greyWeather?mix(.48,.98,sampleValue.g)*mix(.85,1.,smoothstep(-.6,.65,p.y)):1.;
              radiance+=transmission*opacity*lighting*cloudTint;
            }
            transmission*=1.-opacity;
            if(occlusionPass&&transmission<=.08){
              float frontZ=max(0.,-(modelViewMatrix*vec4(p,1.)).z);
              // The depth belongs to the opaque interior, not the first tenuous wisp.
              gl_FragDepth=clamp(log2(1.+frontZ)/log2(1.+cameraFar)+cloudId*1.e-9,0.,1.);
              accumulation=vec4(frontZ/cameraFar,cloudId,0.,1.);opticalDepth=vec4(0.);return;
            }
          }
          if(occlusionPass)discard;
          float alpha=1.-transmission;if(alpha<.002)discard;
          vec3 colour=radiance/max(alpha,.0001);
          vec4 hitView=modelViewMatrix*vec4(hit,1.);
          // A broad optical transition remains smooth at every distance and at overlaps.
          // It is a density fade, rather than a one-pixel blur around an opaque mask.
          if(solidZ>80.){
            // Keep the gentle low-density tail rather than steepening it with smoothstep.
            // Only the final dense portion closes fully to hide rear cloud bodies.
            alpha=mix(alpha,1.,smoothstep(.82,.96,alpha));
          }
          #ifdef USE_FOG
            if(greyWeather){
              float greyFog=dot(fogColor,vec3(.2126,.7152,.0722));
              colour=mix(colour,vec3(greyFog),smoothstep(fogNear,fogFar,-hitView.z));
            }
            alpha*=1.-smoothstep(fogFar*.8,fogFar,length(hitView.xyz));
            transmission=1.-alpha;
          #endif
          if(greyWeather){
            vec3 skyColour=mix(skyBottom,skyTop,1.-exp(-max(normalize(worldRay).y,0.)*3.5));
            colour=vec3(min(colour.r,min(skyColour.r,min(skyColour.g,skyColour.b))*.94));
          }
          transmission=1.-alpha;
          // Order-independent soft fringes; rear cores are excluded by occupied depth.
          float weight=clamp(1./(.03+pow(abs(hitView.z)/1200.,2.)),.1,8.);
          accumulation=vec4(colour*alpha*weight,alpha*weight);
          opticalDepth=vec4(-log(max(transmission,.0001)),0.,0.,0.);

        }`
    });
  }
  function clouds(root,cfg,old) {
    if(old){root.remove(old);const materials=new Set();old.traverse(m=>{if(m.material)materials.add(m.material);});materials.forEach(m=>m.dispose());}
    if(!cloudTextures.length)for(let i=0;i<window.cloudVolumes.length;i++)cloudTextures.push(cloudTexture(i));
    const dense=!cfg.sunVisible,g=new T.Group(),count=cfg.rain?1300:cfg.sunVisible?320:1100;
    const extent=dense?8000:5200,mainCount=dense?Math.round(count*.88):count;
    g.name='weather-clouds';Object.assign(g.userData,{cloudCount:count,extent,mainCount,pixelBudget:dense?1150000:1350000});
    const materials=cloudTextures.map(volume=>(cfg.rain?[4.5,24,28]:[4.5,9,12]).map(extinction=>cloudMaterial(volume,cfg,extinction)));
    for(let i=0;i<count;i++){
      const cluster=new T.Group();
      // Stable formation identities: rain preserves the entire overcast field and adds 200 banks/wisps.
      let layoutSeed=(Math.imul(i+1,1597334677)^1940)>>>0;
      const sample=dense?()=>{layoutSeed=(Math.imul(layoutSeed,1664525)+1013904223)>>>0;return layoutSeed/4294967296;}:random;
      const supplemental=dense&&i>=1100,sharedCount=supplemental?200:1100,sharedMain=Math.round(sharedCount*.88),localIndex=supplemental?i-1100:i;
      const upper=dense&&localIndex>=sharedMain;
      if(dense){
        // One jittered formation per cell, with a separate sparse upper deck.
        // Each row owns an equal-width strip, so the outer valley is as well covered as the airfield.
        const deckCount=upper?sharedCount-sharedMain:sharedMain,index=upper?localIndex-sharedMain:localIndex,rows=Math.round(Math.sqrt(deckCount));
        const row=Math.min(rows-1,Math.floor(index*rows/deckCount));
        const first=Math.ceil(row*deckCount/rows),next=Math.ceil((row+1)*deckCount/rows),columns=next-first,column=index-first;
        cluster.position.set(((column+.5+(sample()-.5)*.7)/columns-.5)*extent,0,((row+.5+(sample()-.5)*.7)/rows-.5)*extent);
      }else cluster.position.set((sample()-.5)*extent,0,(sample()-.5)*extent);
      // Broad weather regions share a cloud family, base altitude and prevailing direction.
      const ix=clamp(Math.floor((cluster.position.x+extent/2)/(extent/4)),0,3),iz=clamp(Math.floor((cluster.position.z+extent/2)/(extent/4)),0,3);
      const region=iz*4+ix+(upper?16:0);
      const families=['wisp','wisp','bank','bank','bank','bank','cumulus','cumulus','bank','bank','cumulus','cumulus','tower','tower','wisp','wisp'];
      const form=dense?(upper?'wisp':'bank'):families[region];
      const layer=form==='wisp'?'high':form==='bank'?'low':'middle';
      let rx,ry,rz,base;
      if(form==='bank'){rx=310+sample()*100;ry=46+sample()*18;rz=210+sample()*75;base=95;}
      else if(form==='tower'){rx=230+sample()*70;ry=150+sample()*55;rz=205+sample()*70;base=245;}
      else if(form==='wisp'){rx=380+sample()*110;ry=28+sample()*13;rz=170+sample()*55;base=680;}
      else{rx=150+sample()*50;ry=90+sample()*35;rz=140+sample()*55;base=260;}
      if(dense&&form==='bank'){rx*=1.3;rz*=1.35;ry*=1.7;base=200;}
      // Keep individual formations compact; soft envelopes must not merge clear skies
      // into one giant foreground cloud; let the prevailing wind flatten the bases.
      const formationScale=dense?.46:.38;
      rx*=formationScale;ry*=formationScale*(form==='tower'?.8:.62);rz*=formationScale*.82;
      // Variation within a shared wind field avoids identical oval proportions.
      const stretch=.82+sample()*.36;rx*=stretch;rz/=stretch;
      base+=(sample()-.5)*24;
      const radius=Math.hypot(rx,rz);
      let terrainTop=0;
      for(let x=-radius;x<=radius+700;x+=(radius*2+700)/20)for(let z=-radius;z<=radius;z+=radius/10)
        terrainTop=Math.max(terrainTop,height(cluster.position.x+x,cluster.position.z+z));
      for(const drift of [0,350,700])for(const dx of [-radius,0,radius])for(const dz of [-radius,0,radius])terrainTop=Math.max(terrainTop,height(cluster.position.x+dx+drift,cluster.position.z+dz));
      base=Math.max(base,terrainTop+55);
      cluster.position.y=base+ry;cluster.rotation.y=hash(ix,iz)*Math.PI*.5+(sample()-.5)*.12;cluster.userData.region=region;
      cluster.userData.cloudBase=base;cluster.userData.footprintRadius=radius;cluster.userData.layer=layer;cluster.userData.form=form;
      const variant=Math.floor(sample()*cloudTextures.length),style=form==='wisp'?0:form==='tower'?2:1;
      const cloud=new T.Mesh(cloudTextures[variant].userData.volumeGeometry,materials[variant][style]);cloud.name='cloud-volume';cloud.layers.set(1);
      cloud.onBeforeRender=()=>{cloud.material.uniforms.cloudId.value=i+1;cloud.material.uniformsNeedUpdate=true;};
      cluster.userData.layoutIndex=i;cluster.userData.variant=variant;
      cloud.scale.set(rx,ry,rz);cloud.userData.halfSize=new T.Vector3(rx,ry,rz);cluster.add(cloud);
      cluster.updateMatrix();cluster.matrixAutoUpdate=false;cloud.updateMatrix();cloud.matrixAutoUpdate=false;
      g.add(cluster);
    }
    g.userData.materials=materials.flat();g.userData.rain=!!cfg.rain;
    g.userData.ceiling=Math.max(...g.children.map(c=>c.position.y+c.children[0].scale.y));
    if(old)g.position.copy(old.position);
    root.add(g);activeClouds=g;buildRainIndex(g);return g;
  }
  const rainIndex=new Map(),rainBottoms=new WeakMap();
  function buildRainIndex(group) {
    rainIndex.clear();
    for(const cluster of group.children){
      const map=cluster.children[0].material.uniforms.volume.value,n=map.image.width;
      if(!rainBottoms.has(map)){
        const bottoms=new Uint8Array(n*n).fill(255),data=map.image.data;
        for(let z=0;z<n;z++)for(let x=0;x<n;x++)for(let y=0;y<n;y++){
          if(data[((z*n+y)*n+x)*2]>35){bottoms[z*n+x]=y;break;}
        }
        rainBottoms.set(map,bottoms);
      }
      const radius=cluster.userData.footprintRadius;
      for(let x=Math.floor((cluster.position.x-radius)/500);x<=Math.floor((cluster.position.x+radius)/500);x++)
        for(let z=Math.floor((cluster.position.z-radius)/500);z<=Math.floor((cluster.position.z+radius)/500);z++){
          const key=x+','+z;if(!rainIndex.has(key))rainIndex.set(key,[]);rainIndex.get(key).push(cluster);
        }
    }
  }
  function rainCeiling(x,z) {
    if(!activeClouds?.userData.rain)return -1;
    x-=activeClouds.position.x;z-=activeClouds.position.z;
    let roof=-1;
    for(const cluster of rainIndex.get(Math.floor(x/500)+','+Math.floor(z/500))||[]){
      if(cluster.userData.layer==='high')continue;
      const volume=cluster.children[0],dx=x-cluster.position.x,dz=z-cluster.position.z,c=Math.cos(cluster.rotation.y),s=Math.sin(cluster.rotation.y);
      const u=(c*dx-s*dz)/volume.scale.x,v=(s*dx+c*dz)/volume.scale.z;
      if(Math.abs(u)>=1||Math.abs(v)>=1)continue;
      const map=volume.material.uniforms.volume.value,n=map.image.width;
      const y=rainBottoms.get(map)[Math.floor((v*.5+.5)*n)*n+Math.floor((u*.5+.5)*n)];
      if(y===255)continue;
      roof=Math.max(roof,cluster.position.y+activeClouds.position.y+((y+.5)/n*2-1)*volume.scale.y);
    }
    return roof;
  }
  function localCloudMist(eye){
    if(!activeClouds)return 0;
    const x=eye.x-activeClouds.position.x,z=eye.z-activeClouds.position.z;let mist=0;
    for(const cluster of rainIndex.get(Math.floor(x/500)+','+Math.floor(z/500))||[]){
      const volume=cluster.children[0],dx=x-cluster.position.x,dz=z-cluster.position.z,c=Math.cos(cluster.rotation.y),s=Math.sin(cluster.rotation.y);
      const p=[(c*dx-s*dz)/volume.scale.x,(eye.y-cluster.position.y-activeClouds.position.y)/volume.scale.y,(s*dx+c*dz)/volume.scale.z];
      if(p.some(v=>Math.abs(v)>=1))continue;
      const map=volume.material.uniforms.volume.value,{data,width:n}=map.image;
      const q=p.map(v=>clamp((v*.5+.5)*n-.5,0,n-1)),lo=q.map(Math.floor),f=q.map((v,i)=>v-lo[i]);let density=0;
      for(let z=0;z<2;z++)for(let y=0;y<2;y++)for(let x=0;x<2;x++)density+=data[((Math.min(lo[2]+z,n-1)*n+Math.min(lo[1]+y,n-1))*n+Math.min(lo[0]+x,n-1))*2]/255*(x?f[0]:1-f[0])*(y?f[1]:1-f[1])*(z?f[2]:1-f[2]);
      mist+=density*volume.material.uniforms.extinction.value/Math.min(volume.scale.x,volume.scale.y,volume.scale.z);
    }
    return mist;
  }
  function createRain(root,count=2200) {
    const positions=[],offsets=[];
    for(let i=0;i<count;i++){
      const x=hash(i,301)*64,z=hash(i,302)*64,phase=hash(i,303),fall=10+hash(i,304)*8;
      for(const y of [-.14,.14]){positions.push(-y*.18,y,0);offsets.push(x,phase,z,fall);}
    }
    const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));geometry.setAttribute('drop',new T.Float32BufferAttribute(offsets,4));
    const material=new T.ShaderMaterial({transparent:true,depthWrite:false,fog:true,uniforms:{...T.UniformsUtils.clone(T.UniformsLib.fog),cloudMist,time:{value:0},origin:{value:new T.Vector2()},eyeHeight:{value:0},roof:{value:null}},
      vertexShader:`attribute vec4 drop;uniform float time;uniform float eyeHeight;uniform vec2 origin;uniform sampler2D roof;varying float wet;varying vec3 rainWorld;
        #include <common>
        #include <logdepthbuf_pars_vertex>
        #include <fog_pars_vertex>
        void main(){
          // Periodic world trajectories: only particles at the faded patch edges recycle.
          vec2 localXZ=mod(drop.xz+vec2(time*1.9,0.)-origin,64.);
          float bottom=eyeHeight-24.;
          vec3 centre=vec3(origin.x+localXZ.x,bottom+mod(drop.y*64.-time*drop.w-bottom,64.),origin.y+localXZ.y);
          vec2 bounds=texture2D(roof,localXZ/64.).rg;
          float edge=min(min(localXZ.x,64.-localXZ.x),min(localXZ.y,64.-localXZ.y));
          edge=min(edge,min(centre.y-bottom,bottom+64.-centre.y));
          // Cloud/terrain bounds mask visibility; they never reset a drop's position or speed.
          wet=smoothstep(0.,6.,edge)*smoothstep(0.,.6,bounds.r-centre.y-.14)*smoothstep(0.,.6,centre.y-bounds.g-.14);
          vec3 world=centre+position;rainWorld=world;
          vec4 mvPosition=viewMatrix*vec4(world,1.);gl_Position=projectionMatrix*mvPosition;
          #include <logdepthbuf_vertex>
          #include <fog_vertex>
        }`,
      fragmentShader:`varying float wet;uniform float cloudMist;
        #include <logdepthbuf_pars_fragment>
        #include <fog_pars_fragment>
        void main(){if(wet<.001)discard;
          #include <logdepthbuf_fragment>
          gl_FragColor=vec4(.57,.58,.59,.28*wet);
          #include <fog_fragment>
          #ifdef USE_FOG
            gl_FragColor.a*=exp(-cloudMist*vFogDepth);
          #endif
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`});
    const rain=new T.LineSegments(geometry,material);rain.name='cloud-rain';rain.frustumCulled=false;
    rain.layers.set(2);
    rain.userData.count=count;rain.userData.views=new WeakMap();root.add(rain);return rain;
  }
  function prepareRain(rain,eye,viewKey=eye) {
    if(!rain?.visible)return;
    const x=Math.floor(eye.x/4)*4-32,z=Math.floor(eye.z/4)*4-32,drift=activeClouds?.position.x||0;
    let cache=rain.userData.views.get(viewKey);
    if(!cache){
      const data=new Float32Array(16*16*4),map=new T.DataTexture(data,16,16,T.RGBAFormat,T.FloatType);
      map.minFilter=map.magFilter=T.NearestFilter;cache={data,map};rain.userData.views.set(viewKey,cache);
    }
    if(cache.x!==x||cache.z!==z||Math.abs(cache.drift-drift)>1||cache.clouds!==activeClouds){
      for(let iz=0;iz<16;iz++)for(let ix=0;ix<16;ix++){
        const wx=x+ix*4+2,wz=z+iz*4+2,i=(iz*16+ix)*4;
        // Conservative cell corners keep rain out of gaps and beyond a cloud's density footprint.
        cache.data[i]=Math.min(rainCeiling(wx,wz),rainCeiling(wx-2,wz-2),rainCeiling(wx+2,wz-2),rainCeiling(wx-2,wz+2),rainCeiling(wx+2,wz+2));
        cache.data[i+1]=height(wx,wz);
      }
      cache.map.needsUpdate=true;Object.assign(cache,{x,z,drift,clouds:activeClouds});
    }
    rain.material.uniforms.roof.value=cache.map;rain.material.uniforms.origin.value.set(x,z);rain.material.uniforms.eyeHeight.value=eye.y;
  }
  function renderView(renderer,scene,camera,viewport) {
    // Geometry-only test renderers do not expose GPU render targets.
    if(!renderer.isWebGLRenderer){renderer.render(scene,camera);return;}
    const ratio=renderer.getPixelRatio(),w=Math.max(1,Math.round(viewport.width*ratio)),h=Math.max(1,Math.round(viewport.height*ratio));
    // Keep aircraft/terrain at native resolution; only soft volume integration is reduced.
    const scale=cloudScale*Math.min(1,Math.sqrt((activeClouds?.userData.pixelBudget||1350000)/(w*h)))/.9;
    const cw=Math.max(1,Math.round(w*scale)),ch=Math.max(1,Math.round(h*scale));
    if(!cloudPass){
      const solid=new T.WebGLRenderTarget(w,h,{type:T.HalfFloatType,minFilter:T.NearestFilter,magFilter:T.NearestFilter});
      solid.depthTexture=new T.DepthTexture(w,h,T.UnsignedIntType);
      const volumes=new T.WebGLMultipleRenderTargets(cw,ch,2,{type:T.HalfFloatType,minFilter:T.NearestFilter,magFilter:T.NearestFilter,depthBuffer:false});
      const cloudDepth=new T.WebGLRenderTarget(cw,ch,{type:T.HalfFloatType,minFilter:T.NearestFilter,magFilter:T.NearestFilter,depthBuffer:true});
      const material=new T.ShaderMaterial({depthTest:true,depthFunc:T.AlwaysDepth,depthWrite:true,uniforms:{solid:{value:solid.texture},depth:{value:solid.depthTexture},cloudSize:{value:new T.Vector2(cw,ch)},cameraFar:{value:8200},accumulation:{value:volumes.texture[0]},optical:{value:volumes.texture[1]}},
        vertexShader:`varying vec2 uvScreen;void main(){uvScreen=uv;gl_Position=vec4(position.xy,0.,1.);}`,
        fragmentShader:`varying vec2 uvScreen;uniform sampler2D solid;uniform sampler2D depth;uniform sampler2D accumulation;uniform sampler2D optical;uniform vec2 cloudSize;uniform float cameraFar;
          float linearDepth(vec2 uv){return exp2(texture2D(depth,uv).r*log2(cameraFar+1.))-1.;}
          float softWeight(float x){x=abs(x);return x<1.?(4.-6.*x*x+3.*x*x*x)/6.:x<2.?pow(2.-x,3.)/6.:0.;}
          void main(){
            // Depth-aware reconstruction keeps distant clouds from bleeding across a nearby wing.
            vec2 grid=uvScreen*cloudSize-.5,base=floor(grid),f=fract(grid);
            float here=linearDepth(uvScreen),total=0.;vec4 mixed=vec4(0.);
            // Cubic reconstruction gives gaseous contours instead of stair-step cutouts.
            for(int y=-1;y<3;y++)for(int x=-1;x<3;x++){
              vec2 uv=(base+vec2(float(x),float(y))+.5)/cloudSize;
              float there=linearDepth(uv);
              float weight=softWeight(float(x)-f.x)*softWeight(float(y)-f.y);
              weight*=exp(-abs(there-here)/max(.08,here*.015));
              vec4 sum=texture2D(accumulation,uv);float trans=exp(-texture2D(optical,uv).r);
              mixed+=vec4(sum.rgb/max(sum.a,.00001)*(1.-trans),trans)*weight;total+=weight;
            }
            mixed=total>.00001?mixed/total:vec4(0.,0.,0.,1.);
            vec3 background=texture2D(solid,uvScreen).rgb;
            gl_FragColor=vec4(mixed.rgb+background*mixed.a,1.);
            gl_FragDepth=texture2D(depth,uvScreen).r;
            #include <tonemapping_fragment>
            #include <colorspace_fragment>
          }`});
      const composition=new T.Scene();composition.add(new T.Mesh(new T.PlaneGeometry(2,2),material));
      cloudPass={solid,volumes,cloudDepth,composition,material,camera:new T.Camera()};
      // Upload every density field at startup, so the first turn toward a new shape cannot stall on upload.
      for(const map of cloudTextures)renderer.initTexture(map);
      scene.traverse(o=>{if(o.isLight)o.layers.enable(2);});
    }
    if(cloudPass.solid.width!==w||cloudPass.solid.height!==h)cloudPass.solid.setSize(w,h);
    if(cloudPass.volumes.width!==cw||cloudPass.volumes.height!==ch){cloudPass.volumes.setSize(cw,ch);cloudPass.cloudDepth.setSize(cw,ch);}
    cloudPass.material.uniforms.cloudSize.value.set(cw,ch);cloudPass.material.uniforms.cameraFar.value=camera.far;
    const oldMask=camera.layers.mask,background=scene.background,autoClear=renderer.autoClear;
    const clearColour=renderer.getClearColor(new T.Color()),clearAlpha=renderer.getClearAlpha();
    const infoReset=renderer.info.autoReset;renderer.info.autoReset=false;renderer.info.reset();
    renderer.autoClear=true;renderer.setScissorTest(false);
    camera.layers.set(0);renderer.setRenderTarget(cloudPass.solid);renderer.render(scene,camera);
    // The same shadow map serves the volume and composite passes; neither casts shadows.
    const shadowAuto=renderer.shadowMap.autoUpdate;renderer.shadowMap.autoUpdate=false;
    // The opaque pass has already updated all world transforms for this viewport.
    // Reuse them for depth, clouds and foreground without traversing the entire scene again.
    const worldAuto=scene.matrixWorldAutoUpdate;scene.matrixWorldAutoUpdate=false;
    const materials=activeClouds?.userData.materials||[];
    for(const material of materials){material.uniforms.sceneDepth.value=cloudPass.solid.depthTexture;material.uniforms.cloudDepth.value=cloudPass.cloudDepth.texture;material.uniforms.viewportSize.value.set(cw,ch);material.uniforms.cameraFar.value=camera.far;}
    cloudFrustum.setFromProjectionMatrix(cloudProjection.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse));
    if(activeClouds)for(const cluster of activeClouds.children){
      const volume=cluster.children[0];cloudSphere.center.setFromMatrixPosition(volume.matrixWorld);cloudSphere.radius=volume.scale.length();
      // Flat banks need box bounds: a width-sized sphere submits many off-screen decks during turns.
      const e=volume.matrixWorld.elements;
      cloudExtents.set(2*(Math.abs(e[0])+Math.abs(e[4])+Math.abs(e[8])),2*(Math.abs(e[1])+Math.abs(e[5])+Math.abs(e[9])),2*(Math.abs(e[2])+Math.abs(e[6])+Math.abs(e[10])));
      cloudBounds.setFromCenterAndSize(cloudSphere.center,cloudExtents);
      volume.visible=cloudFrustum.intersectsBox(cloudBounds)&&cloudSphere.center.distanceTo(camera.position)-cloudSphere.radius<(scene.fog?.far||camera.far);
    }
    scene.background=null;camera.layers.set(1);
    if(activeClouds){
      for(const material of materials){material.uniforms.occlusionPass.value=true;material.uniforms.cloudDepth.value=cloudPass.solid.depthTexture;material.blending=T.NoBlending;material.depthTest=true;material.depthWrite=true;material.depthFunc=T.LessDepth;}
      renderer.setClearColor(0x000000,0);renderer.setRenderTarget(cloudPass.cloudDepth);renderer.render(scene,camera);
      for(const material of materials){material.uniforms.occlusionPass.value=false;material.uniforms.cloudDepth.value=cloudPass.cloudDepth.texture;material.blending=T.CustomBlending;material.depthTest=false;material.depthWrite=false;}
    }
    renderer.setClearColor(0x000000,0);
    renderer.setRenderTarget(cloudPass.volumes);renderer.render(scene,camera);
    scene.background=background;camera.layers.mask=oldMask;renderer.setClearColor(clearColour,clearAlpha);
    renderer.setRenderTarget(null);renderer.setViewport(viewport.x,viewport.y,viewport.width,viewport.height);
    renderer.setScissor(viewport.x,viewport.y,viewport.width,viewport.height);renderer.setScissorTest(true);
    renderer.autoClear=false;renderer.render(cloudPass.composition,cloudPass.camera);
    // Foreground glass, moving blades and rain blend over the actual cloudy backdrop.
    // The copied opaque depth still hides them behind terrain and the aircraft body.
    cloudMist.value=localCloudMist(camera.position);
    scene.background=null;camera.layers.set(2);renderer.render(scene,camera);
    scene.background=background;camera.layers.mask=oldMask;
    renderer.autoClear=autoClear;renderer.setScissorTest(false);renderer.info.autoReset=infoReset;renderer.shadowMap.autoUpdate=shadowAuto;scene.matrixWorldAutoUpdate=worldAuto;
  }
  function surfacePalette(x,z,asphalt=false) {
    let base;
    if(asphalt)base=new T.Color(0x55564f);
    else if(terrainPixels) {
      // Sample the same repeating terrain map and material tint used by the ground.
      const wrap=v=>((v%1)+1)%1;
      const u=wrap((x+4100)/8200*64),v=wrap((4100-z)/8200*64);
      const i=(Math.floor((1-v)*1023)*1024+Math.floor(u*1023))*4;
      base=new T.Color().setRGB(terrainPixels[i]/255,terrainPixels[i+1]/255,terrainPixels[i+2]/255,T.SRGBColorSpace).multiply(terrainMaterial.color).multiplyScalar(1-forestDensity(x,z)*.36);
    }else base=new T.Color(0x777451);
    const soil=base.clone().lerp(new T.Color(asphalt?0x827e70:0x938167),.3);
    return {
      debris:[base.clone().multiplyScalar(.6),base.clone(),soil.clone(),soil.clone().multiplyScalar(1.12)],
      dust:[soil.clone().multiplyScalar(.83),soil.clone(),soil.clone().multiplyScalar(1.18)],
      smoke:[soil.clone().multiplyScalar(.32),soil.clone().multiplyScalar(.5),soil.clone().multiplyScalar(.72),soil.clone()]
    };
  }
  function weather(name,cfg) {
    if(!sky)return;
    sky.material.uniforms.top.value.set(name==='sunny'?'#286fa5':name==='cloudy'?'#8b969d':'#70777b');
    sky.material.uniforms.bottom.value.set(name==='sunny'?'#bcd5df':name==='cloudy'?'#bac2c6':'#959b9e');
    skyFill.intensity=name==='sunny'?1.5:name==='cloudy'?.95:.7;
    skyFill.color.set(name==='sunny'?0xb9d6ed:name==='cloudy'?0xced1d2:0xb0b3b4);
    sky.material.uniforms.strength.value=cfg.sunVisible?1:0;
    terrainMaterial.roughness=name==='rainy'?.63:.97;
  }
  function skinTexture(german=false) {
    const c=canvas(1024,512),ctx=c.getContext('2d');ctx.fillStyle=german?'#7c857a':'#86836b';ctx.fillRect(0,0,1024,512);
    // Subdued camouflage, flush panel seams and staggered rivets.
    for(let i=0;i<18;i++) {ctx.fillStyle=german?'rgba(40,52,43,.26)':'rgba(50,65,43,.29)';ctx.beginPath();ctx.ellipse(random()*1024,random()*512,80+random()*130,35+random()*85,random()*3,0,7);ctx.fill();}
    for(let x=0;x<1024;x+=85){ctx.fillStyle='rgba(20,26,24,.22)';ctx.fillRect(x,0,1,512);ctx.fillStyle='rgba(230,235,214,.23)';ctx.fillRect(x+1,0,1,512);for(let y=8;y<512;y+=15){ctx.fillStyle='rgba(23,29,27,.5)';ctx.fillRect(x+4,y,2,2);}}
    for(let y=0;y<512;y+=128){ctx.fillStyle='rgba(22,26,23,.26)';ctx.fillRect(0,y,1024,2);}
    for(let i=0;i<6500;i++){ctx.fillStyle=random()>.5?'rgba(235,235,223,.09)':'rgba(20,25,20,.07)';ctx.fillRect(random()*1024,random()*512,1+random()*7,1);}
    return texture(c);
  }
  function airfoil(span,chord,tail=false,tapered=false) {
    const p=[],uv=[],idx=[],N=40,M=40;
    for(let i=0;i<=N;i++) {
      const x=-span+2*span*i/N, t=Math.abs(x)/span;
      const localChord=chord*(tapered?1-.63*t:.06+.94*Math.sqrt(Math.max(0,1-t*t))),sweep=t*t*chord*.19;
      for(let j=0;j<=M;j++){
        const angle=2*Math.PI*j/M,q=(1-Math.cos(angle))*.5;
        const thick=5*.12*(.2969*Math.sqrt(q)-.126*q-.3516*q*q+.2843*q*q*q-.1036*q*q*q*q);
        const y=(j<=M/2?1:-1)*thick*localChord+Math.abs(x)*.035;
        p.push(x,y,(q-.48)*localChord+sweep);uv.push(i/N,j/M);
        if(i<N&&j<M){const a=i*(M+1)+j,b=a+M+1;idx.push(a,a+1,b,b,a+1,b+1);}
      }
    }
    // Close both wing tips with separate cap vertices so the end faces have flat normals.
    for(const end of [0,N]){
      const ring=end*(M+1),center=p.length/3;let cy=0,cz=0;
      for(let j=0;j<M;j++){cy+=p[(ring+j)*3+1];cz+=p[(ring+j)*3+2];}
      p.push(p[ring*3],cy/M,cz/M);uv.push(end/N,.5);
      for(let j=0;j<=M;j++){p.push(...p.slice((ring+j)*3,(ring+j)*3+3));uv.push(end/N,j/M);}
      for(let j=0;j<M;j++)if(end===N)idx.push(center,center+1+j,center+2+j);else idx.push(center,center+2+j,center+1+j);
    }
    const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();return g;
  }
  function aircraft(root,colors,position) {
    const g=new T.Group(),german=colors.nation==='germany'||colors.body===0x274d7e;
    const paint=standard(0xffffff,.56,.28,{map:skinTexture(german)}), metal=standard(0x929b9c,.3,.8), dark=standard(0x242a28,.68,.25),rubber=standard(0x151817,.93,0);
    const points=[[-1.28,.15],[-1.23,.195],[-1.1,.21],[-.8,.22],[-.4,.21],[0,.185],[.35,.15],[.7,.10],[1.05,.065],[1.4,.032],[1.52,.005]].map(([z,r])=>new T.Vector2(r,z));
    const hull=mesh(g,new T.LatheGeometry(points,64),paint);hull.rotation.x=Math.PI/2;hull.scale.z=1.12;if(german)hull.scale.x=.9;
    const nose=mesh(g,new T.CylinderGeometry(.193,.20,.23,48),german?standard(0xbda254,.62,.2):paint,0,0,-1.19);nose.rotation.x=Math.PI/2;
    const spinner=mesh(g,new T.SphereGeometry(.155,32,20),standard(german?0xbda254:0x69725b,.46,.3),0,0,-1.38);spinner.scale.set(1,1,1.35);
    const main=mesh(g,airfoil(german?1.36:1.52,german?.66:.71,false,german),paint,0,-.055,-.22);main.name="main-wing";
    mesh(g,airfoil(.59,.35,true),paint,0,.045,1.23);
    const fin=mesh(g,airfoil(.34,.45,true),paint,0,.22,1.28);fin.rotation.z=Math.PI/2;
    // Engine exhaust stacks and recessed radiator intake.
    for(const side of [-1,1])for(let i=0;i<6;i++){const exhaust=mesh(g,new T.CylinderGeometry(.016,.021,.075,10),dark,side*.207,.035,-.98+i*.085);exhaust.rotation.z=side*Math.PI/2;exhaust.rotation.x=.3;}
    const scoop=mesh(g,new T.SphereGeometry(1,24,16),paint,0,-.16,.15);scoop.scale.set(.15,.10,.34);
    const intake=mesh(g,new T.CircleGeometry(.082,24),dark,0,-.19,-.15);intake.rotation.y=Math.PI;
    // Transparent blown canopy with metal frame, seat and pilot silhouette.
    const glass=new T.MeshPhysicalMaterial({color:0xadc8cb,metalness:.12,roughness:.10,transparent:true,opacity:.38,side:T.DoubleSide,depthWrite:false,clearcoat:1,envMapIntensity:1.5});
    const canopy=mesh(g,new T.SphereGeometry(1,40,24,0,Math.PI*2,0,Math.PI/2),glass,0,.14,.08);canopy.scale.set(.164,.19,.34);canopy.castShadow=false;
    canopy.name='canopy-glass';canopy.layers.set(2);mistMaterial(glass);
    if(german){
      const vertices=[[-.15,.14,-.20],[.15,.14,-.20],[.15,.14,.34],[-.15,.14,.34],[-.10,.31,-.10],[.10,.31,-.10],[.10,.31,.23],[-.10,.31,.23]];
      const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(vertices.flat(),3));
      geometry.setIndex([0,1,5,0,5,4,1,2,6,1,6,5,2,3,7,2,7,6,3,0,4,3,4,7,4,5,6,4,6,7]);geometry.computeVertexNormals();
      canopy.geometry.dispose();canopy.geometry=geometry;canopy.position.set(0,0,0);canopy.scale.set(1,1,1);
      for(const [a,b] of [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]])rod(g,vertices[a],vertices[b],.0025,dark);
    }else{
    // Cross-sections of the actual ellipsoid: x²/.164² + (y-.14)²/.19² + (z-.08)²/.34² = 1.
    for(const z of [.12,.25]) {
      const section=Math.sqrt(1-Math.pow((z-.08)/.34,2)),path=[];
      for(let i=0;i<=48;i++){
        const a=i/48*Math.PI;path.push(new T.Vector3(Math.cos(a)*.164*section,.14+Math.sin(a)*.19*section,z));
      }
      const frame=mesh(g,new T.TubeGeometry(new T.CatmullRomCurve3(path),48,.0018,8,false),metal);
      frame.name='canopy-hoop';
    }
    const rim=[];
    for(let i=0;i<96;i++){const a=i/96*Math.PI*2;rim.push(new T.Vector3(Math.cos(a)*.164,.14,.08+Math.sin(a)*.34));}
    mesh(g,new T.TubeGeometry(new T.CatmullRomCurve3(rim,true),96,.0018,8,true),metal).name='canopy-rim';
    }
    const seat=mesh(g,new T.SphereGeometry(1,16,12),dark,0,.13,.22);seat.scale.set(.1,.1,.09);
    const pilot=mesh(g,new T.SphereGeometry(.057,20,16),standard(0x493f2e),0,.228,.10);pilot.scale.y=1.14;
    // Painted roundels sit just above the airfoil; all markings are locally generated.
    const c=canvas(256),ctx=c.getContext('2d');
    if(german){
      ctx.fillStyle='#e4e0d2';ctx.fillRect(18,85,220,86);ctx.fillRect(85,18,86,220);
      ctx.fillStyle='#202524';ctx.fillRect(18,104,220,48);ctx.fillRect(104,18,48,220);
    }else for(const [r,col] of [[119,'#293a4b'],[84,'#ddd9c8'],[45,'#8f3b2d']]){ctx.fillStyle=col;ctx.beginPath();ctx.arc(128,128,r,0,7);ctx.fill();}
    const insignia=new T.MeshStandardMaterial({map:texture(c),alphaTest:.08,roughness:.65,metalness:.15,polygonOffset:true,polygonOffsetFactor:-2});
    for(const side of [-1,1]){const m=mesh(g,new T.PlaneGeometry(.33,.33),insignia,side*1.05,.014,-.22);m.rotation.x=-Math.PI/2;m.rotation.y=-side*.035;m.castShadow=false;}
    // Aileron seams follow the upper surface.
    for(const side of [-1,1])rod(g,[side*.7,.025,-.03],[side*1.36,.015,-.04],.0025,dark);
    const codeCanvas=canvas(512,128),cc=codeCanvas.getContext('2d');cc.fillStyle='#dedbcc';cc.font='bold 76px monospace';cc.textAlign='center';cc.fillText(german?'14 +':'RF • A',256,91);
    for(const side of [-1,1]){const code=mesh(g,new T.PlaneGeometry(.65,.16),new T.MeshStandardMaterial({map:texture(codeCanvas),alphaTest:.08,roughness:.6}),side*.13,.018,.49);code.rotation.y=side*Math.PI/2;code.castShadow=false;}
    const propPaint=dark.clone();propPaint.transparent=true;propPaint.opacity=.28;propPaint.depthWrite=false;propPaint.envMapIntensity=0;mistMaterial(propPaint);
    const prop=new T.Group();prop.position.set(0,0,-1.48);prop.scale.set(.84,.84,1);g.add(prop);
    for(let i=0;i<3;i++){const pivot=new T.Group();pivot.rotation.z=i*Math.PI*2/3;const blade=mesh(pivot,new T.SphereGeometry(1,18,12),propPaint,.025,.29,0);blade.scale.set(.055,.28,.012);const tip=mesh(pivot,new T.SphereGeometry(1,12,8),standard(0xc5b374,.6,.1,{transparent:true,opacity:.3,depthWrite:false,envMapIntensity:0}),.025,.52,0);tip.scale.set(.034,.035,.013);prop.add(pivot);blade.layers.set(2);tip.layers.set(2);mistMaterial(tip.material);}
    const disc=mesh(g,new T.CircleGeometry(.57,64),new T.MeshBasicMaterial({color:0x635a43,transparent:true,opacity:.10,side:T.DoubleSide,depthWrite:false}),0,0,-1.49);disc.scale.set(.84,.84,1);disc.castShadow=false;disc.name="propeller-disc";disc.layers.set(2);mistMaterial(disc.material);
    // Embedded sleeves connect the barrels to the leading edge; muzzle nodes also own ballistics.
    const muzzles=[],convergence=new T.Vector3(0,-.055+.78*.035,-120);
    for(const side of [-1,1]) {
      const y=-.055+.78*.035;
      const breech=new T.Vector3(side*.78,y,-.37);
      const tip=breech.clone().addScaledVector(convergence.clone().sub(breech).normalize(),.22);
      rod(g,breech.toArray(),tip.toArray(),.016,dark).name='wing-gun-barrel';
      const sleeveEnd=breech.clone().lerp(tip,.53);
      rod(g,breech.toArray(),sleeveEnd.toArray(),.026,paint).name='wing-gun-sleeve';
      const muzzle=new T.Object3D();muzzle.position.copy(tip);muzzle.name='gun-muzzle';g.add(muzzle);muzzles.push(muzzle);
    }
    const gear=new T.Group();g.add(gear);gear.name='landing-gear';gear.userData.legs=[];
    for(const side of [-1,1]) {
      const hinge=new T.Group();hinge.position.set(side*.48,-.06,-.25);hinge.userData.side=side;hinge.name=side<0?'gear-left-hinge':'gear-right-hinge';gear.add(hinge);gear.userData.legs.push(hinge);
      rod(hinge,[0,0,0],[side*.04,-.31,-.03],.017,metal);
      const tire=mesh(hinge,new T.TorusGeometry(.081,.029,12,24),rubber,side*.04,-.32,-.03);tire.rotation.y=Math.PI/2;tire.name='main-wheel';
      const hub=mesh(hinge,new T.CylinderGeometry(.052,.052,.045,20),metal,side*.04,-.32,-.03);hub.rotation.z=Math.PI/2;
      // A stationary hinge pin makes the attachment clear throughout the retraction arc.
      const pin=mesh(g,new T.CylinderGeometry(.031,.031,.065,16),metal,side*.48,-.06,-.25);pin.rotation.x=Math.PI/2;
    }
    const tailHinge=new T.Group();tailHinge.position.set(0,-.04,1.29);gear.add(tailHinge);gear.userData.tail=tailHinge;
    rod(tailHinge,[0,0,0],[0,-.17,.06],.012,metal);
    const tailWheel=mesh(tailHinge,new T.TorusGeometry(.038,.014,10,16),rubber,0,-.18,.06);tailWheel.rotation.y=Math.PI/2;
    rod(g,[0,.24,.42],[0,.40,.47],.007,dark);
    const assembly=new T.Group();g.scale.setScalar(.42);assembly.add(g);assembly.position.copy(position);root.add(assembly);
    assembly.userData.nation=german?'Germany':'Britain';assembly.userData.aircraftType=german?'Bf 109-style':'Spitfire-style';
    assembly.userData.muzzles=muzzles;assembly.userData.gunConvergence=convergence;
    assembly.userData.gear=gear;assembly.userData.canopy=canopy;assembly.userData.pilot=pilot;
    return {plane:assembly,body:g,propeller:prop};
  }
  function setGear(aircraft,retracted) {
    const gear=aircraft.userData.gear;
    gear.userData.retracted=clamp(retracted,0,1);
    for(const hinge of gear.userData.legs)hinge.rotation.z=-hinge.userData.side*gear.userData.retracted*Math.PI/2;
    gear.userData.tail.rotation.x=-gear.userData.retracted*Math.PI/2;
  }
  function gunSolution(aircraft) {
    aircraft.updateWorldMatrix(true,true);
    return {origins:aircraft.userData.muzzles.map(m=>m.getWorldPosition(new T.Vector3())),target:aircraft.children[0].localToWorld(aircraft.userData.gunConvergence.clone())};
  }
  function projectGunsight(aircraft,camera,viewport) {
    camera.updateMatrixWorld(true);
    const point=gunSolution(aircraft).target.project(camera);
    return {x:viewport.x+(point.x+1)*viewport.width*.5,y:viewport.y+(1-point.y)*viewport.height*.5,visible:point.z>=-1&&point.z<=1&&Math.abs(point.x)<=1&&Math.abs(point.y)<=1};
  }
  function registerPavement(m) {
    m.updateWorldMatrix(true,false);
    pavements.push({mesh:m,box:new T.Box3().setFromObject(m)});
  }
  function surfaceHeight(x,z) {
    let y=terrainSurface(x,z);
    for(const p of pavements)if(p.mesh.visible&&x>=p.box.min.x&&x<=p.box.max.x&&z>=p.box.min.z&&z<=p.box.max.z)y=Math.max(y,p.box.max.y);
    return y;
  }
  function placeOnSurface(aircraft) {
    aircraft.updateWorldMatrix(true,true);
    let correction=-Infinity;
    for(const leg of aircraft.userData.gear.userData.legs){
      const wheel=leg.getObjectByName('main-wheel'),box=new T.Box3().setFromObject(wheel),center=box.getCenter(new T.Vector3());
      correction=Math.max(correction,surfaceHeight(center.x,center.z)+.003-box.min.y);
    }
    aircraft.position.y+=correction;
    aircraft.updateWorldMatrix(true,true);
  }
  function controlTower(position) {
    const tower=new T.Group();tower.position.copy(position);tower.name='control-tower';tower.userData.kind='tower';tower.userData.period='WWII watch office';
    const render=standard(0x9c967e,.96,.01),brick=standard(0x776452,.95,.01),roof=standard(0x424641,.96,.02),timber=standard(0x3d473d,.85,.03),glass=standard(0x60797b,.28,.1);
    // Low, rectangular two-storey RAF watch office with a flat roof and framed observation windows.
    mesh(tower,new T.BoxGeometry(3,.12,2.5),brick,0,.06,0);
    mesh(tower,new T.BoxGeometry(2.7,.68,2.15),render,0,.46,0);
    mesh(tower,new T.BoxGeometry(2.76,.08,2.21),brick,0,.84,0);
    mesh(tower,new T.BoxGeometry(2.45,.64,1.90),render,0,1.20,-.05).name='tower-glazed-cabin';
    function windowRow(x,y,z,w,h,turn=0){
      const frame=new T.Group();frame.position.set(x,y,z);frame.rotation.y=turn;tower.add(frame);
      mesh(frame,new T.BoxGeometry(w,h,.045),timber);
      const panes=Math.max(2,Math.round(w/.24));
      for(let i=0;i<panes;i++)mesh(frame,new T.PlaneGeometry(w/panes-.025,h-.045),glass,-w/2+(i+.5)*w/panes,0,.026);
    }
    windowRow(0,1.25,.913,2.18,.35);windowRow(0,1.25,-1.013,2.18,.35,Math.PI);
    windowRow(1.238,1.25,-.05,1.56,.35,Math.PI/2);
    windowRow(-1.238,1.25,.20,1.04,.35,-Math.PI/2);
    mesh(tower,new T.BoxGeometry(.035,.56,.40),timber,-1.246,1.17,-.70);
    for(const x of [-.85,.05])windowRow(x,.50,1.083,.51,.32);
    mesh(tower,new T.BoxGeometry(2.65,.10,2.12),roof,0,1.56,-.05);
    for(const x of [-1.27,1.27])mesh(tower,new T.BoxGeometry(.09,.16,2.05),render,x,1.68,-.05);
    mesh(tower,new T.BoxGeometry(2.55,.16,.09),render,0,1.68,-1.035);
    for(const x of [-1.22,0,1.22])rod(tower,[x,1.61,.94],[x,1.95,.94],.012,timber);
    rod(tower,[-1.22,1.95,.94],[1.22,1.95,.94],.012,timber);
    mesh(tower,new T.BoxGeometry(.48,.60,.035),timber,.88,.42,1.093);
    for(let i=0;i<3;i++)mesh(tower,new T.BoxGeometry(.68,.035*(i+1),.18),brick,.88,.0175*(i+1),1.57-i*.17);
    // Exterior service stair and a simple windsock replace the modern antenna crown.
    for(let i=0;i<10;i++)mesh(tower,new T.BoxGeometry(.55,.086*(i+1),.18),brick,-1.65,.043*(i+1),.9-i*.17);
    mesh(tower,new T.BoxGeometry(.72,.10,.54),brick,-1.56,.85,-.70);
    rod(tower,[-1.94,.28,1.0],[-1.94,1.14,-.74],.016,timber);
    rod(tower,[.8,1.62,-.55],[.8,2.42,-.55],.012,timber);
    const sock=mesh(tower,new T.CylinderGeometry(.06,.025,.32,16,1,true),standard(0xa17d53,.9,0),.96,2.39,-.55);sock.rotation.z=Math.PI/2+.12;
    const sign=canvas(256,64),ctx=sign.getContext('2d');ctx.fillStyle='#d5cfb7';ctx.fillRect(0,0,256,64);ctx.fillStyle='#303b33';ctx.font='bold 28px monospace';ctx.textAlign='center';ctx.fillText('WATCH OFFICE',128,42);
    mesh(tower,new T.PlaneGeometry(.90,.22),standard(0xffffff,.9,0,{map:texture(sign)}),0,.93,1.13);
    return tower;
  }
  function airfield(root,buildings,runways) {
    const specs=[],paint=[];
    const asphalt='#53584f',apron='#918f81';
    function addSpec(m,color){
      registerPavement(m);const box=pavements[pavements.length-1].box;
      specs.push({x0:box.min.x,x1:box.max.x,z0:box.min.z,z1:box.max.z,color});
      // Keep the runway/route handles for collision and mission state, but render their union only.
      m.material.visible=false;m.castShadow=false;
    }
    runways.forEach(r=>addSpec(r,asphalt));
    buildings.forEach(b=>{if(b.userData.kind==='tower')return;b.material=standard(b.material.color,.78,.18);b.castShadow=b.receiveShadow=true;
      const geo=b.geometry.parameters;
      if(b.userData.kind==='hangar'){
        // Hangars share their original geometry; each opening needs its own edited copy.
        b.geometry=b.geometry.clone();
        // The door owns its opening: discard the original front and bottom faces instead of layering them.
        const keep=[];
        for(const face of b.geometry.groups)if(face.materialIndex!==3&&face.materialIndex!==4)
          for(let i=face.start;i<face.start+face.count;i++)keep.push(b.geometry.index.getX(i));
        b.geometry.setIndex(keep);b.geometry.clearGroups();
        for(const side of [-1,1])mesh(b,new T.BoxGeometry(geo.width*.08,geo.height,.035),b.material,side*geo.width*.46,0,geo.depth*.5);
        mesh(b,new T.BoxGeometry(geo.width*.84,.054,.035),b.material,0,geo.height*.5-.027,geo.depth*.5);
        const roofGeo=new T.CylinderGeometry(geo.width*.5,geo.width*.5,geo.depth,32,1,false,0,Math.PI);roofGeo.rotateZ(Math.PI/2);roofGeo.rotateY(Math.PI/2);const roof=mesh(b,roofGeo,standard(0x7b827d,.5,.5));roof.scale.y=.45;roof.position.y=geo.height*.5;
        const door=mesh(b,new T.BoxGeometry(geo.width*.84,geo.height*.96,.06),standard(0x38403e,.65,.4),0,-.018,geo.depth*.5-.03);door.name="hangar-runway-door";
        for(let x=-geo.width*.36;x<geo.width*.4;x+=.28)rod(b,[x,-geo.height*.42,geo.depth*.5+.015],[x,geo.height*.42,geo.depth*.5+.015],.01,standard(0x757c77,.6,.3));
      }
    });

    const pave=(name,x,z,width,depth,color)=>{
      const m=mesh(root,new T.BoxGeometry(width,.16,depth),standard(0x777a70),x,.08,z);m.name=name;addSpec(m,color);return m;
    };
    const stripe=(x,z,width,depth)=>paint.push({x,z,width,depth});
    for(const side of [-1,1]){
      pave('parallel-taxiway',side*17,25,2.8,110,asphalt);stripe(side*17,25,.055,106);
      for(const z of [-25,65]){
        pave('runway-taxiway-connector',side*11,z,12,2.8,asphalt);stripe(side*12,z,10,.055);
        for(const x of [9.7,9.9])stripe(side*x,z,.045,2.2);
      }
    }
    for(const hangar of buildings.filter(b=>b.userData.kind==='hangar')){
      const side=Math.sign(hangar.position.x),z=hangar.position.z;
      hangar.userData.doorway=hangar.localToWorld(new T.Vector3(0,0,2.1));
      pave('hangar-apron',side*23.45,z,5.1,7.2,apron);pave('hangar-taxiway-link',side*19.1,z,5.8,2.8,asphalt);stripe(side*21.2,z,9,.055);
    }
    // Partition at every rectangle boundary. Each covered cell is emitted exactly once.
    const xs=[...new Set(specs.flatMap(r=>[r.x0,r.x1]))].sort((a,b)=>a-b);
    const zs=[...new Set(specs.flatMap(r=>[r.z0,r.z1]))].sort((a,b)=>a-b);
    const x0=xs[0],x1=xs[xs.length-1],z0=zs[0],z1=zs[zs.length-1];
    const c=canvas(2048,4096),ctx=c.getContext('2d'),sx=c.width/(x1-x0),sz=c.height/(z1-z0);
    const px=x=>(x-x0)*sx,pz=z=>(z1-z)*sz;
    for(const r of specs){ctx.fillStyle=r.color;ctx.fillRect(px(r.x0),pz(r.z1),(r.x1-r.x0)*sx,(r.z1-r.z0)*sz);}
    for(let i=0;i<85000;i++){ctx.fillStyle=random()>.5?'rgba(220,217,195,.06)':'rgba(12,18,12,.05)';ctx.fillRect(random()*c.width,random()*c.height,1+random()*3,1+random()*3);}
    ctx.fillStyle='#c5b274';
    for(const line of paint)ctx.fillRect(px(line.x-line.width/2),pz(line.z+line.depth/2),line.width*sx,line.depth*sz);
    ctx.fillStyle='#d2d0bd';
    for(const x of [-5,5]){
      for(let i=0;i<6;i++)ctx.fillRect(px(x-2.1+i*.74),pz(156),.32*sx,4.5*sz);
      ctx.save();ctx.translate(px(x),pz(147));ctx.scale(sx,sz);ctx.font='bold 2.3px sans-serif';ctx.textAlign='center';ctx.fillText('36',0,0);ctx.restore();
    }
    runwayTexture=texture(c);runwayTexture.wrapS=runwayTexture.wrapT=T.ClampToEdgeWrapping;
    const material=standard(0xffffff,.94,.02,{map:runwayTexture});
    const vertices=[],uv=[],indices=[],cells=[];
    const covered=(x,z)=>specs.some(r=>x>r.x0-1e-7&&x<r.x1+1e-7&&z>r.z0-1e-7&&z<r.z1+1e-7);
    function quad(points){const start=vertices.length/3;for(const [x,y,z] of points){vertices.push(x,y,z);uv.push((x-x0)/(x1-x0),(z-z0)/(z1-z0));}indices.push(start,start+1,start+2,start,start+2,start+3);}
    for(let i=0;i<xs.length-1;i++)for(let j=0;j<zs.length-1;j++){
      const a=xs[i],b=xs[i+1],c=zs[j],d=zs[j+1];if(!covered((a+b)/2,(c+d)/2))continue;
      cells.push([a,b,c,d]);quad([[a,.16,c],[a,.16,d],[b,.16,d],[b,.16,c]]);
      if(!covered(a-.0001,(c+d)/2))quad([[a,0,c],[a,0,d],[a,.16,d],[a,.16,c]]);
      if(!covered(b+.0001,(c+d)/2))quad([[b,0,d],[b,0,c],[b,.16,c],[b,.16,d]]);
      if(!covered((a+b)/2,c-.0001))quad([[b,0,c],[a,0,c],[a,.16,c],[b,.16,c]]);
      if(!covered((a+b)/2,d+.0001))quad([[a,0,d],[b,0,d],[b,.16,d],[a,.16,d]]);
    }
    const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(vertices,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setIndex(indices);geo.computeVertexNormals();
    const pavement=mesh(root,geo,material);pavement.name='airfield-pavement';pavement.castShadow=false;pavement.userData.cells=cells;
    const edge=standard(0xe6d6ab,.45,.1,{emissive:0xf4d499,emissiveIntensity:.3});
    for(const x of [-7.95,-2.05,2.05,7.95])for(let z=-76;z<160;z+=12)if(Math.abs(z+25)>3.5&&Math.abs(z-65)>3.5)mesh(root,new T.SphereGeometry(.055,8,6),edge,x,.17,z);
  }
  function particle(size,color,kind) {
    if(!particleTexture)particleTexture=radialTexture();
    if(kind==='debris'||kind==='scorch'){const m=new T.Mesh(new T.IcosahedronGeometry(1,0),standard(color,.85,.1,{transparent:true}));m.geometry.scale(size.x*.5,size.y*.5,size.z*.5);return m;}
    const m=new T.Sprite(new T.SpriteMaterial({map:particleTexture,color,transparent:true,depthWrite:false,blending:kind==='fire'?T.AdditiveBlending:T.NormalBlending}));
    m.scale.set(size.x*1.8,size.y*1.8,1);m.userData.particleSize=m.scale.clone();return m;
  }
  function followSun(sun,target) { sun.position.copy(target).add(new T.Vector3(-140,220,-280));sun.target.position.copy(target);sun.target.updateMatrixWorld(); }
  return {nearCountryLane,cloudCeiling:()=>activeClouds?.userData.ceiling||800,beginFrame,createRain,prepareRain,rainCeiling,renderView,sceneryBoxes,atmosphere,ground,clouds,weather,aircraft,airfield,particle,height,followSun,setGear,gunSolution,projectGunsight,surfacePalette,surfaceHeight,placeOnSurface,controlTower,forestDensity};
};
