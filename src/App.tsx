/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { 
  Search, 
  RotateCcw, 
  HelpCircle, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight,
  TrendingUp,
  Target,
  Users,
  MessageSquare,
  ShieldCheck,
  XCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type TabType = 'trafico' | 'conversion' | 'ticket';

interface ChecklistItem {
  id: string;
  text: string;
  bold?: string;
}

interface ContentSection {
  what: string;
  objective: string;
  checklist: ChecklistItem[];
  errors: string[];
}

interface Objection {
  id: string;
  title: string;
  say: string;
  do: string;
  dont: string[];
}

const CONTENT: Record<TabType, ContentSection> = {
  trafico: {
    what: "Entradas al local. La venta empieza antes de que el cliente pise el salón.",
    objective: "Eliminar dudas antes de entrar y empujar la decisión de ingreso.",
    checklist: [
      { id: 'vidriera', bold: "Vidriera impecable:", text: " Limpia, sin huecos, outfits masculinos completos. Precios visibles." },
      { id: 'atril', bold: "Atril/Cartelería:", text: " Promo activa + cuotas sin interés bien visibles en la entrada." },
      { id: 'puerta', bold: "Punto de ingreso:", text: " Vendedor en zona caliente con postura activa. Interceptar y dirigir." },
      { id: 'energia', bold: "Energía del salón:", text: " Movimiento constante, percheo, orden activo (no estatismo)." },
    ],
    errors: [
      "Vidriera sucia o con maniquíes incompletos",
      "Vendedor atrás del mostrador o con celular",
      "Nadie intercepta la entrada",
      "Silencio o falta de ritmo en el salón"
    ]
  },
  conversion: {
    what: "Transformar entradas en ventas. El servicio es la clave del cierre.",
    objective: "Que el cliente no se sienta abandonado y pruebe producto rápido.",
    checklist: [
      { id: 'saludo', bold: "Saludo 10s:", text: " Contacto visual y voz clara apenas entra el cliente." },
      { id: 'intervencion', bold: "Intervención 45s:", text: " Si mira en silencio, intervenir con pregunta o sugerencia corta." },
      { id: 'regla3', bold: "Regla de 3 opciones:", text: " Mostrar en mano 2-3 alternativas (fit, talle, color)." },
      { id: 'probador', bold: "Asistencia Probador:", text: " Sumar prendas extra y complementos. Estar atento al talle." },
      { id: 'rescate', bold: "Rescate Obligatorio:", text: " Si se va sin comprar, preguntar motivo y ofrecer alternativa final." },
    ],
    errors: [
      "Cliente solo demasiado tiempo",
      "Señalar perchas desde lejos (no mostrar en mano)",
      "No acompañar al probador",
      "No intentar el rescate al final"
    ]
  },
  ticket: {
    what: "Aumentar el valor de cada ticket. Vender el look completo.",
    objective: "Que el cliente no se lleve una prenda suelta, sino un outfit.",
    checklist: [
      { id: 'outfit', bold: "Armar look completo (3 pasos):", text: " Base (abajo: jean/bermuda/pantalón) + Arriba (remera/camisa) + Cierre (buzo/campera o accesorio según clima).\nCombos rápidos: (1) Jean+Remera+Buzo (urbano) (2) Jean/Pantalón+Camisa+Campera (salida) (3) Bermuda+Remera/Camisa+Accesorio (verano)" },
      { id: 'segunda', bold: "Proponer 2da prenda:", text: " No preguntar \"¿algo más?\", proponer el conjunto directo." },
      { id: 'upgrade', bold: "Subir de nivel (mejor opción):", text: " si ya le gustó, mostrar una versión mejor (tela/calce/terminación)." },
      { id: 'accesorios', bold: "Accesorios en caja:", text: " Perfume, gorra, cinturón, medias. Siempre ofrecer." },
    ],
    errors: [
      "Cobrar sin proponer nada extra",
      "No armar el look completo frente al espejo",
      "No ofrecer accesorios en el momento de pago",
      "Miedo a ofrecer la línea más cara"
    ]
  }
};

const OBJECTIONS: Objection[] = [
  {
    id: 'caro',
    title: "Está caro",
    say: "Entiendo, es una inversión. Pero fijate el gramaje de este algodón y el refuerzo en costuras; te va a durar el triple que uno común. Además, tenés 3 cuotas sin interés.",
    do: "Mostrar detalle de terminación al tacto. Ofrecer cuotas. Proponer un combo que baje el precio unitario.",
    dont: ["Es lo que vale", "No tenemos nada más barato"]
  },
  {
    id: 'pensar',
    title: "Lo voy a pensar",
    say: "Claro, es importante estar seguro. ¿Hay algo puntual del calce o del color que no te termine de cerrar? Si querés probamos aquel otro corte.",
    do: "Ofrecer probar una variante (otro color/talle). Recordar que la promo es por hoy. Dar tarjeta con el modelo anotado.",
    dont: ["Bueno, avisame", "Dale, te espero"]
  },
  {
    id: 'mirando',
    title: "Estoy mirando",
    say: "Tranquilo, chusmeá tranquilo. Cualquier cosa avisame, soy [Nombre]. Te cuento que hoy tenemos promo activa en remeras y jeans.",
    do: "Dar espacio (2-3 metros). Intervenir a los 45s con un dato de producto si se detiene en algo.",
    dont: ["¿Buscás algo?", "¿Te ayudo?"]
  },
  {
    id: 'convence',
    title: "No me convence cómo me queda",
    say: "A veces el espejo engaña. Probemos este otro corte que es un poco más armado en los hombros, suele favorecer más este tipo de contextura.",
    do: "Traer talle arriba/abajo o fit alternativo inmediatamente. Ajustar la prenda frente al espejo para mostrar el potencial.",
    dont: ["Te queda bien igual", "Es el modelo así"]
  },
  {
    id: 'talle',
    title: "No hay mi talle",
    say: "De ese modelo justo voló, pero tengo este otro que es el mismo calce y en este color te va a quedar increíble. Pasá que te lo muestro.",
    do: "Buscar alternativa similar de inmediato. No dejar que el cliente se vaya sin ver otra opción real en mano.",
    dont: ["No, no quedó nada", "Vuelve la semana que viene"]
  },
  {
    id: 'barato',
    title: "En otro lado lo vi más barato",
    say: "Puede ser, pero ojo con la tela. Nosotros usamos algodón premium que no se deforma con los lavados. Lo barato a veces sale caro en dos meses.",
    do: "Comparar calidad al tacto. Resaltar el beneficio de las cuotas y la garantía de marca.",
    dont: ["Andá a comprar allá", "Imposible"]
  },
  {
    id: 'elegir',
    title: "No sé cuál elegir",
    say: "Si es para usar todos los días, yo me llevaría el azul. Es más versátil y te resuelve más situaciones que el otro.",
    do: "Tomar la decisión por el cliente con seguridad. Armar el look con ambos para que vea la diferencia real.",
    dont: ["Los dos son lindos", "Cualquiera te queda bien"]
  },
  {
    id: 'estilo',
    title: "No me gusta / no es mi estilo",
    say: "Entiendo, buscás algo más clásico. Pasá por acá que tengo la línea básica que es exactamente lo que necesitás.",
    do: "Cambiar de perchero o sector rápidamente. No insistir con lo que ya rechazó.",
    dont: ["Es lo que se usa ahora", "A todo el mundo le gusta"]
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('trafico');
  const [searchQuery, setSearchQuery] = useState('');
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [highlights, setHighlights] = useState<string[]>([]);
  const [showPlayModal, setShowPlayModal] = useState(false);
  const [selectedObjection, setSelectedObjection] = useState<Objection | null>(null);
  const [showFullResponse, setShowFullResponse] = useState(false);

  const handleReset = () => {
    setCheckedItems({});
    setHighlights([]);
    setSearchQuery('');
    setSelectedObjection(null);
  };

  const toggleCheck = (id: string) => {
    setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const executeScenario = (type: string) => {
    handleReset();
    setShowPlayModal(false);
    
    if (type === 'no-entra') {
      setActiveTab('trafico');
      setHighlights(['vidriera', 'atril', 'puerta']);
    } else if (type === 'entra-se-va') {
      setActiveTab('conversion');
      setHighlights(['saludo', 'intervencion', 'rescate']);
    } else if (type === 'una-prenda') {
      setActiveTab('ticket');
      setHighlights(['outfit', 'segunda', 'accesorios']);
    } else if (type === 'precio') {
      setActiveTab('conversion');
      setSelectedObjection(OBJECTIONS.find(o => o.id === 'caro') || null);
      setHighlights(['rescate']);
    }
  };

  const filteredChecklist = useMemo(() => {
    const section = CONTENT[activeTab];
    return section.checklist.filter(item => 
      item.text.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.bold?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [activeTab, searchQuery]);

  const filteredObjections = useMemo(() => {
    return OBJECTIONS.filter(o => 
      o.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-[#0B0D10] text-[#E9EEF5] font-sans pb-20">
      {/* Header Fijo */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-[#0B0D10]/90 backdrop-blur-xl border-b border-[#242B36] z-50 px-4 md:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#FFD400] rounded-sm flex items-center justify-center">
            <span className="text-black font-black text-xs">VDH</span>
          </div>
          <h1 className="text-sm md:text-base font-bold tracking-tight uppercase hidden sm:block">Playbook de Local</h1>
        </div>

        <div className="flex items-center gap-2 flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A7B0BE]" />
            <input 
              type="text" 
              placeholder="Buscar en el tab activo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#12161C] border border-[#242B36] rounded-full pl-9 pr-4 py-1.5 text-xs outline-none focus:border-[#FFD400] w-full transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={handleReset}
            className="p-2 text-[#A7B0BE] hover:text-white transition-colors"
            title="Resetear"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setShowPlayModal(true)}
            className="bg-[#FFD400] text-black px-4 py-1.5 rounded-full font-bold text-xs hover:scale-105 transition-transform flex items-center gap-2"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">¿Qué está pasando?</span>
          </button>
        </div>
      </header>

      {/* Panel de Ejecución (Hero) */}
      <section className="pt-24 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {/* Card Tráfico */}
          <div className="bg-[#12161C] border border-[#242B36] rounded-2xl p-5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Users className="w-12 h-12" />
            </div>
            <h3 className="text-[#FFD400] font-black text-xs uppercase tracking-widest mb-1">Tráfico</h3>
            <p className="text-xs text-[#A7B0BE] mb-4">Entradas al local</p>
            <div className="space-y-3">
              <div>
                <span className="text-[10px] uppercase text-[#A7B0BE] block mb-1">Qué controla el vendedor</span>
                <p className="text-xs font-medium">Vidriera, atril, puerta, energía del salón.</p>
              </div>
              <ul className="text-[10px] space-y-1 text-[#A7B0BE]">
                <li className="flex items-center gap-2"><div className="w-1 h-1 bg-[#FFD400] rounded-full" /> Vidriera impecable</li>
                <li className="flex items-center gap-2"><div className="w-1 h-1 bg-[#FFD400] rounded-full" /> Atril con promo clara</li>
                <li className="flex items-center gap-2"><div className="w-1 h-1 bg-[#FFD400] rounded-full" /> Postura activa en puerta</li>
              </ul>
              <p className="text-[10px] italic text-white mt-4 border-t border-[#242B36] pt-2">"La venta empieza en la puerta."</p>
            </div>
          </div>

          {/* Card Conversión */}
          <div className="bg-[#12161C] border border-[#242B36] rounded-2xl p-5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Target className="w-12 h-12" />
            </div>
            <h3 className="text-[#FFD400] font-black text-xs uppercase tracking-widest mb-1">Conversión</h3>
            <p className="text-xs text-[#A7B0BE] mb-4">Entradas → Ventas</p>
            <div className="space-y-3">
              <div>
                <span className="text-[10px] uppercase text-[#A7B0BE] block mb-1">Qué controla el vendedor</span>
                <p className="text-xs font-medium">Saludo 10s, intervención 45s, probador, rescate.</p>
              </div>
              <ul className="text-[10px] space-y-1 text-[#A7B0BE]">
                <li className="flex items-center gap-2"><div className="w-1 h-1 bg-[#FFD400] rounded-full" /> Regla de 3 opciones</li>
                <li className="flex items-center gap-2"><div className="w-1 h-1 bg-[#FFD400] rounded-full" /> Asistencia en probador</li>
                <li className="flex items-center gap-2"><div className="w-1 h-1 bg-[#FFD400] rounded-full" /> Rescate obligatorio</li>
              </ul>
              <p className="text-[10px] italic text-white mt-4 border-t border-[#242B36] pt-2">"Nadie se va sin una solución."</p>
            </div>
          </div>

          {/* Card Ticket */}
          <div className="bg-[#12161C] border border-[#242B36] rounded-2xl p-5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <TrendingUp className="w-12 h-12" />
            </div>
            <h3 className="text-[#FFD400] font-black text-xs uppercase tracking-widest mb-1">Ticket Promedio</h3>
            <p className="text-xs text-[#A7B0BE] mb-4">$ por ticket</p>
            <div className="space-y-3">
              <div>
                <span className="text-[10px] uppercase text-[#A7B0BE] block mb-1">Qué controla el vendedor</span>
                <p className="text-xs font-medium">Outfit, 2da prenda, upgrade, accesorios.</p>
              </div>
              <ul className="text-[10px] space-y-1 text-[#A7B0BE]">
                <li className="flex items-center gap-2"><div className="w-1 h-1 bg-[#FFD400] rounded-full" /> Armado de look completo</li>
                <li className="flex items-center gap-2"><div className="w-1 h-1 bg-[#FFD400] rounded-full" /> Subir de nivel (llevarlo a una opción mejor)</li>
                <li className="flex items-center gap-2"><div className="w-1 h-1 bg-[#FFD400] rounded-full" /> Sumar complementos en caja</li>
              </ul>
              <p className="text-[10px] italic text-white mt-4 border-t border-[#242B36] pt-2">"No vendemos ropa, vendemos estilo."</p>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <nav className="flex gap-1 bg-[#12161C] p-1 rounded-xl border border-[#242B36] mb-8 max-w-2xl mx-auto">
          {(['trafico', 'conversion', 'ticket'] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                activeTab === tab 
                ? 'bg-[#FFD400] text-black' 
                : 'text-[#A7B0BE] hover:text-white'
              }`}
            >
              {tab === 'trafico' ? 'Tráfico' : tab === 'conversion' ? 'Conversión' : 'Ticket'}
            </button>
          ))}
        </nav>

        {/* Contenido Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Columna Izquierda: Checklist + Errores */}
          <div className="lg:col-span-7 space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-6"
              >
                {/* Intro Tab */}
                <div className="bg-[#12161C] border border-[#242B36] rounded-2xl p-6">
                  <h4 className="text-[10px] uppercase tracking-widest text-[#A7B0BE] mb-2">Objetivo del Tab</h4>
                  <p className="text-sm font-medium leading-relaxed">{CONTENT[activeTab].objective}</p>
                </div>

                {/* Checklist */}
                <div className="bg-[#12161C] border border-[#242B36] rounded-2xl p-6">
                  <h4 className="text-[10px] uppercase tracking-widest text-[#A7B0BE] mb-6 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" /> Checklist Operativo
                  </h4>
                  <div className="space-y-2">
                    {filteredChecklist.map((item) => (
                      <div 
                        key={item.id}
                        onClick={() => toggleCheck(item.id)}
                        className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all border ${
                          checkedItems[item.id] ? 'bg-[#171C24] opacity-40 border-transparent' : 'bg-[#171C24]/50 border-transparent hover:border-[#242B36]'
                        } ${highlights.includes(item.id) ? 'highlight-item' : ''}`}
                      >
                        <div className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                          checkedItems[item.id] ? 'bg-[#FFD400] border-[#FFD400]' : 'border-[#242B36]'
                        }`}>
                          {checkedItems[item.id] && <CheckCircle2 className="w-3.5 h-3.5 text-black" />}
                        </div>
                        <span className="text-xs leading-snug whitespace-pre-line">
                          <strong className="text-white">{item.bold}</strong>{item.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Errores */}
                <div className="bg-[#12161C] border border-[#242B36] rounded-2xl p-6">
                  <h4 className="text-[10px] uppercase tracking-widest text-[#A7B0BE] mb-6 flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-[#E53935]" /> Errores Típicos
                  </h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {CONTENT[activeTab].errors.map((error, i) => (
                      <li key={i} className="flex items-center gap-3 text-[11px] text-[#A7B0BE] bg-[#0B0D10]/30 p-3 rounded-lg">
                        <div className="w-1 h-1 bg-[#E53935] rounded-full shrink-0" />
                        {error}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Columna Derecha: Objeciones */}
          <div className="lg:col-span-5">
            <div className="bg-[#12161C] border border-[#242B36] rounded-2xl p-6 sticky top-20">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-[10px] uppercase tracking-widest text-[#A7B0BE] flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" /> Objeciones del Cliente
                </h4>
                <button 
                  onClick={() => setShowFullResponse(!showFullResponse)}
                  className="text-[10px] uppercase font-bold text-[#FFD400] flex items-center gap-1"
                >
                  {showFullResponse ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  {showFullResponse ? "Ver Corta" : "Ver Completa"}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-6">
                {filteredObjections.map((obj) => (
                  <button
                    key={obj.id}
                    onClick={() => setSelectedObjection(obj)}
                    className={`text-[10px] font-bold p-3 rounded-xl border transition-all text-left ${
                      selectedObjection?.id === obj.id 
                      ? 'bg-[#FFD400] text-black border-[#FFD400]' 
                      : 'bg-[#171C24] border-[#242B36] text-[#A7B0BE] hover:border-[#FFD400]'
                    }`}
                  >
                    {obj.title}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {selectedObjection ? (
                  <motion.div
                    key={selectedObjection.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    <div className="bg-[#0B0D10] rounded-xl p-4 border border-[#242B36]">
                      <h5 className="text-[10px] uppercase text-[#FFD400] mb-2">Qué decir</h5>
                      <p className="text-xs italic leading-relaxed">"{selectedObjection.say}"</p>
                    </div>

                    {showFullResponse && (
                      <>
                        <div className="bg-[#171C24] rounded-xl p-4 border border-[#242B36]">
                          <h5 className="text-[10px] uppercase text-[#2ECC71] mb-2">Qué hacer</h5>
                          <p className="text-xs leading-relaxed">{selectedObjection.do}</p>
                        </div>
                        <div className="bg-[#171C24] rounded-xl p-4 border border-[#242B36]">
                          <h5 className="text-[10px] uppercase text-[#E53935] mb-2">Qué NO decir</h5>
                          <ul className="space-y-1">
                            {selectedObjection.dont.map((d, i) => (
                              <li key={i} className="text-xs text-[#A7B0BE] flex items-center gap-2">
                                <div className="w-1 h-1 bg-[#E53935] rounded-full" /> {d}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </>
                    )}
                    
                    {!showFullResponse && (
                      <div className="bg-[#171C24] rounded-xl p-4 border border-[#242B36]">
                        <h5 className="text-[10px] uppercase text-[#2ECC71] mb-2">Acción inmediata</h5>
                        <p className="text-xs leading-relaxed">{selectedObjection.do.split('.')[0]}.</p>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <div className="text-center py-12 border border-dashed border-[#242B36] rounded-2xl">
                    <MessageSquare className="w-8 h-8 text-[#242B36] mx-auto mb-3" />
                    <p className="text-xs text-[#A7B0BE]">Seleccioná una objeción para ver la respuesta recomendada.</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* Modal ¿Qué está pasando? */}
      <AnimatePresence>
        {showPlayModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPlayModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-[#12161C] border border-[#242B36] rounded-3xl w-full max-w-sm p-8 text-center"
            >
              <h2 className="text-xl font-bold mb-8">¿Qué está pasando?</h2>
              <div className="space-y-3">
                <button 
                  onClick={() => executeScenario('no-entra')}
                  className="w-full flex items-center justify-between bg-[#171C24] border border-[#242B36] p-4 rounded-2xl font-bold hover:border-[#FFD400] transition-all group"
                >
                  <span className="text-xs uppercase tracking-widest">No entra gente</span>
                  <ChevronRight className="w-4 h-4 text-[#A7B0BE] group-hover:text-[#FFD400]" />
                </button>
                <button 
                  onClick={() => executeScenario('entra-se-va')}
                  className="w-full flex items-center justify-between bg-[#171C24] border border-[#242B36] p-4 rounded-2xl font-bold hover:border-[#FFD400] transition-all group"
                >
                  <span className="text-xs uppercase tracking-widest">Entra gente y se va</span>
                  <ChevronRight className="w-4 h-4 text-[#A7B0BE] group-hover:text-[#FFD400]" />
                </button>
                <button 
                  onClick={() => executeScenario('una-prenda')}
                  className="w-full flex items-center justify-between bg-[#171C24] border border-[#242B36] p-4 rounded-2xl font-bold hover:border-[#FFD400] transition-all group"
                >
                  <span className="text-xs uppercase tracking-widest">Compran, pero 1 prenda</span>
                  <ChevronRight className="w-4 h-4 text-[#A7B0BE] group-hover:text-[#FFD400]" />
                </button>
                <button 
                  onClick={() => executeScenario('precio')}
                  className="w-full flex items-center justify-between bg-[#171C24] border border-[#242B36] p-4 rounded-2xl font-bold hover:border-[#FFD400] transition-all group"
                >
                  <span className="text-xs uppercase tracking-widest">Piden descuento / precio</span>
                  <ChevronRight className="w-4 h-4 text-[#A7B0BE] group-hover:text-[#FFD400]" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
