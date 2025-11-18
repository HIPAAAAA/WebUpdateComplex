import { TagType, UpdateFeature } from './types';

export const LOGO_URL = 'https://i.imgur.com/4nD2r9x.jpeg';

export const LEGACY_UPDATE_DATA: UpdateFeature[] = [
  {
    id: 'wipe-legacy-2',
    title: 'WIPE LEGACY',
    subtitle: 'EL NUEVO COMIENZO',
    version: 'UPDATE #01',
    description: 'Un reinicio total de la economía, propiedades y facciones para dar paso a la versión 2.0 de Complex Legacy. Nuevos sistemas, optimización y un mapa renovado.',
    imageUrl: 'https://media1.tenor.com/m/x0GvTq2WfFMAAAAd/gta-rp.gif', // Using a GIF for impact
    secondaryImage: 'https://picsum.photos/1920/1080?grayscale',
    tag: TagType.SYSTEM,
    date: '18 NOV 2025',
    isFeatured: true,
    fullContent: `
      <p class="lead">El tan esperado Wipe ha llegado. Complex Legacy entra en su fase 2.0 con una base de datos completamente limpia.</p>
      
      <h3>🔄 Reinicio Total (Wipe)</h3>
      <p>Todos los personajes, vehículos, propiedades y dinero han sido reseteados para garantizar una economía equilibrada desde el día uno. Este cambio nos permite implementar nuevos sistemas de guardado que optimizan el rendimiento del servidor en un 40%.</p>

      <h3>👮 Nuevas Facciones Gubernamentales</h3>
      <p>La LSPD y EMS han recibido una reestructuración completa. Nuevos vehículos, nuevos uniformes EUP y un sistema de despacho (MDT) completamente integrado en el juego.</p>
      <img src="https://picsum.photos/800/400?random=1" alt="Policia" class="article-img" />

      <h3>💊 Sistema de Drogas 2.0</h3>
      <p>Hemos eliminado los puntos estáticos. Ahora la venta de drogas es dinámica. Las esquinas cambian, la pureza importa y la policía tiene nuevas herramientas de investigación.</p>

      <h3>🚗 Vehículos Importados</h3>
      <p>Más de 50 vehículos reales han sido añadidos al concesionario de lujo, con un manejo (handling) ajustado para ser realista pero divertido.</p>
    `
  },
  {
    id: 'halloween-2025',
    title: 'Evento de Halloween',
    subtitle: 'TERROR EN LOS SANTOS',
    version: 'EVENTO',
    description: 'La ciudad se oscurece. Eventos paranormales, coches exclusivos y recompensas limitadas durante todo el mes de Octubre.',
    imageUrl: 'https://picsum.photos/800/450?random=2',
    tag: TagType.EVENT,
    date: '01 OCT 2025',
    fullContent: `El evento de Halloween trae consigo niebla densa, zombis en zonas específicas y loot exclusivo.`
  },
  {
    id: 'economy-update',
    title: 'Reajuste Económico',
    subtitle: 'MEJORAS DE CALIDAD DE VIDA',
    version: 'UPDATE #23',
    description: 'Ajustes en los salarios de trabajos civiles y precios de viviendas para mejorar la progresión de los nuevos usuarios.',
    imageUrl: 'https://picsum.photos/800/450?random=3',
    tag: TagType.ECONOMY,
    date: '15 SEP 2025',
    fullContent: `Hemos escuchado a la comunidad. Los trabajos de inicio ahora pagan un 20% más.`
  },
  {
    id: 'casino-opening',
    title: 'Gran Apertura: Diamond Casino',
    subtitle: 'APUESTAS Y LUJO',
    version: 'UPDATE #22',
    description: 'El Diamond Casino abre sus puertas. Ruleta, Blackjack, Poker y la Rueda de la Fortuna ya están disponibles.',
    imageUrl: 'https://picsum.photos/800/450?random=4',
    tag: TagType.MAP,
    date: '01 SEP 2025',
    fullContent: `El centro de ocio definitivo ha llegado a Los Santos.`
  },
  {
    id: 'mechanic-system',
    title: 'Sistema de Mecánicos Avanzado',
    subtitle: 'TUNING Y REPARACIONES',
    version: 'UPDATE #21',
    description: 'Ahora las piezas de rendimiento se desgastan y requieren mantenimiento real por parte de mecánicos certificados.',
    imageUrl: 'https://picsum.photos/800/450?random=5',
    tag: TagType.JOBS,
    date: '15 AGO 2025',
    fullContent: `Ser mecánico ahora es más que presionar un botón.`
  },
  {
    id: 'gang-turfs',
    title: 'Guerras de Territorios',
    subtitle: 'CONTROL DE BARRIOS',
    version: 'UPDATE #20',
    description: 'Nuevo sistema de grafuitis y control de zonas para bandas. Gana reputación y desbloquea el mercado negro.',
    imageUrl: 'https://picsum.photos/800/450?random=6',
    tag: TagType.SYSTEM,
    date: '01 AGO 2025',
    fullContent: `Las bandas ahora pueden luchar por el control de territorios.`
  }
];

export const SYSTEM_INSTRUCTION = `
Eres "LegacyBot", el asistente de IA oficial del servidor Complex Legacy.
Tu trabajo es ayudar a los usuarios a entender las notas del parche (changelogs).
Responde usando la siguiente información:
${JSON.stringify(LEGACY_UPDATE_DATA)}
Mantén un tono útil, "gamer" y profesional.
`;