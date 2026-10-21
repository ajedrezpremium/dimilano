/* Milano Vigo v1.0 — Datos de mercado (estimaciones orientativas) */
"use strict";
window.MV_DATA = (function () {
  const L3 = (es, gl, en) => ({ es, gl, en });
  const ZONES = [
    { id:"bouzas",    name:"Bouzas",        priceM2:2750, rentM2:12.0, trend:"+4,1 %", note:L3("Cerca del puerto y del Berbés; mucho ambiente local, alta demanda de reformados.", "Xunto ao porto e ao Berbés; moito ambiente local, alta demanda de reformados.", "Near the port and Berbés; lively local scene, high demand for renovated flats.") },
    { id:"cascovello",name:"Casco Vello",   priceM2:2350, rentM2:12.5, trend:"+5,3 %", note:L3("Casco histórico: más €/m² si está rehabilitado; mucho stock para reforma.", "Casco histórico: máis €/m² se está rehabilitado; moito stock para reforma.", "Historic quarter: higher €/m² if rehabbed; plenty of renovation stock.") },
    { id:"alcabre",   name:"Alcabre",       priceM2:2400, rentM2:11.0, trend:"+3,8 %", note:L3("Primera línea de ría: terraza orientada al sur manda sobre puntuación.", "Primeira liña da ría: a terraza orientada ao sur manda sobre a puntuación.", "Estuary front line: a south-facing terrace outranks everything else in scoring.") },
    { id:"samil",     name:"Samil",         priceM2:2600, rentM2:12.0, trend:"+3,2 %", note:L3("Playa + comercio; fuertes picos de alquiler vacacional.", "Praia + comercio; fortes picos de alugueiro vacacional.", "Beach + retail; strong peaks in holiday rentals.") },
    { id:"ocastro",   name:"O Castro",      priceM2:2100, rentM2:10.5, trend:"+2,9 %", note:L3("Vistas al castro y lo céntrico; stock viejo con gran margen de reforma.", "Vistas ao castro e moi céntrico; stock vello con gran marxe de reforma.", "Castle views and very central; old stock with a wide renovation margin.") },
    { id:"coia",      name:"Coia",          priceM2:1600, rentM2:8.5,  trend:"+2,1 %", note:L3("El más asequible; grueso de formatos familiares 3–4 hab.", "O máis asequible; groso de formatos familiares 3–4 dormitorios.", "The most affordable; bulk of 3–4 bed family formats.") },
    { id:"teis",      name:"Teis",          priceM2:1850, rentM2:9.5,  trend:"+2,6 %", note:L3("Formatos familiares, cerca de colegios; demanda estable.", "Formatos familiares, perto de colexios; demanda estable.", "Family formats close to schools; steady demand.") },
    { id:"vite",      name:"Vite",          priceM2:2250, rentM2:10.0, trend:"+3,4 %", note:L3("Nuevo y seminuevo; orientación sur y ascensor manda.", "Novo e seminovo; orientación sur e ascensor manda.", "New and nearly-new stock; south-facing and lift are the deal-makers.") }
  ];
  const PROPS = [
    { id:"mv-01", title:"Ático reformado con vistas a la ría", zone:"cascovello", rooms:2, m2:68, price:158000, year:2019, condition:"reformado", elevator:false, feat:["Vistas ría","Suelos nuevos","Cocina abierta"], desc:"Última planta rehabilitada en pleno Casco Vello: luz mediterránea y ventanales a cubierta. Ideal primera residencia que no exige obra.", frames:1 },
    { id:"mv-02", title:"Piso junto al muelle de pescadores", zone:"bouzas", rooms:3, m2:75, price:189000, year:1985, condition:"bueno", elevator:true, feat:["Junto al puerto","Ascensor","Segunda línea de ría"], desc:"Buena distribución, listo para ocupar sin obra; a cinco minutos del paseo y del Berbés.", frames:2 },
    { id:"mv-03", title:"Estudio reformado a pasos de la ría", zone:"bouzas", rooms:0, m2:35, price:99500, year:2021, condition:"reformado", elevator:true, feat:["Estudio","Alquiler listo","A/C"], desc:"Estudio que renta rápido en temporada alta; excelente entrada para inversor joven.", frames:3 },
    { id:"mv-04", title:"Piso en Alcabre con terraza a la ría", zone:"alcabre", rooms:3, m2:88, price:176000, year:1998, condition:"reformado", elevator:true, feat:["Terraza","Galería sur","Ascensor"], desc:"La terraza orientada a la ría manda: luz natural toda la tarde, acabados de 2019 aún en buen estado.", frames:3 },
    { id:"mv-05", title:"Oportunidad sobre plano (Alcabre)", zone:"alcabre", rooms:2, m2:72, price:124000, year:1974, condition:"reformar", elevator:true, feat:["Partida para reforma","Ascensor","Base recta"], desc:"Proyecto clásico de buy-to-reform: compra + reforma integral te posiciona sobre media de zona.", frames:4 },
    { id:"mv-06", title:"Piso frente a la playa de Samil", zone:"samil", rooms:2, m2:74, price:172000, year:1998, condition:"bueno", elevator:true, feat:["A 50 m de arena","Ascensor","Vacacional"], desc:"Directo al paseo de Samil: mix de residencia + temporada alta, alto rendimiento por semanas.", frames:1 },
    { id:"mv-07", title:"Ático dúplex a 100 m del areal", zone:"samil", rooms:3, m2:95, price:229000, year:2005, condition:"reformado", elevator:true, feat:["Terraza grande","Dúplex","A/C"], desc:"Dúplex con una de las mejores terrazas de la zona; formatos similares escanean raro en Samil.", frames:2 },
    { id:"mv-08", title:"Piso con vistas al Castillo", zone:"ocastro", rooms:2, m2:70, price:149900, year:1979, condition:"bueno", elevator:true, feat:["Vistas al Castro","Céntrico","Comunica con ría"], desc:"Formato 2 hab bien conservado, listo para habitar o reformar con margen.", frames:5 },
    { id:"mv-09", title:"Familiar amplio en Coia", zone:"coia", rooms:4, m2:105, price:169900, year:1992, condition:"bueno", elevator:true, feat:["4 hab","Familias","Orgullo de barrio"], desc:"M² reales por euro en Coia: gran formato familiar con colegios y parque cerca.", frames:3 },
    { id:"mv-10", title:"Chollo para invertir en Coia", zone:"coia", rooms:2, m2:66, price:109000, year:1968, condition:"reformar", elevator:false, feat:["Para reformar","Yield objetivo 7 %","Rentado fácil"], desc:"Ficha de tesis de inversión: compra + reforma para alquiler rentable en zona con demanda sólida.", frames:4 },
    { id:"mv-11", title:"Loft histórico rehabilitado (Berbés)", zone:"cascovello", rooms:1, m2:54, price:139000, year:2018, condition:"reformado", elevator:false, feat:["Loft","Original piedra","Junto a la ría"], desc:"Rehabilitación con piedra a la vista en el Berbés; explotación vacacional o pieza de diseño.", frames:2 },
    { id:"mv-12", title:"Luminoso en Teis cerca de colegios", zone:"teis", rooms:3, m2:82, price:152000, year:1987, condition:"bueno", elevator:true, feat:["Luz todo el día","Colegios cerca","Ascensor"], desc:"Formato familiar estable en Teis: demanda constante; cero riesgo de reforma urgente.", frames:5 },
    { id:"mv-13", title:"Piso a estrenar en Vite", zone:"vite", rooms:3, m2:88, price:198000, year:2024, condition:"reformado", elevator:true, feat:["A estrenar","Garaje","Trastero"], desc:"Obra reciente en la zona más nueva de Vigo: garantía de construcción y cero obra durante años.", frames:1 }
  ];
  const COSTS = {
    itp:      L3("10 % ITP Galicia en vivienda (tipo general aplicable en Pontevedra-Vigo)", "10 % ITP de Galicia en vivenda (tipo xeral aplicable en Pontevedra-Vigo)", "10% Galician ITP on homes (general rate in Pontevedra-Vigo)"),
    notaria:  L3("0,4 – 0,7 % del precio", "0,4 – 0,7 % do prezo", "0.4 – 0.7% of the price"),
    registro: L3("0,2 – 0,3 % del precio", "0,2 – 0,3 % do prezo", "0.2 – 0.3% of the price"),
    gestoria: L3("300 – 500 € fijos", "300 – 500 € fixos", "€300 – 500 fixed"),
    tasacion: L3("300 – 450 € si hay hipoteca", "300 – 450 € se hai hipoteca", "€300 – 450 if taking a mortgage"),
    hipoteca: L3("Entrada mínima 20 % + gastos; el banco evalúa tu perfil individual", "Entrada mínima do 20 % + gastos; o banco avalía o teu perfil individual", "20% minimum down payment + costs; the bank assesses your profile individually")
  };
  const RENOV = {
    lavado:  { m2eur:[120,180],  note:L3("Pintura + suelo + retaques ligeros.", "Pintura + chan + retoques lixeiros.", "Paint + floors + light touch-ups.") },
    integral:{ m2eur:[700,950],  note:L3("Obra completa: electricidad, fontanería, carpintería, cuartos.", "Obra completa: electricidade, fontanería, carpintería, cuartos.", "Full works: electrics, plumbing, carpentry, rooms.") },
    premium: { m2eur:[950,1400], note:L3("Cocina y baños nuevos, climatización completa, carpintería superior.", "Cociña e baños novos, climatización completa, carpintería superior.", "New kitchen and bathrooms, full A/C, superior carpentry.") },
    cocina:  [9000,14000], bano:[4500,7000], sueloM2:[30,45], electriaM2:[45,70], pinturaM2:[10,16]
  };
  return { ZONES, PROPS, COSTS, RENOV };
})();
