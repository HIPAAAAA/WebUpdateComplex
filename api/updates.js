import mongoose from 'mongoose';

// MongoDB Connection String
const MONGODB_URI = "mongodb+srv://complexrp:complexrp@hipaaaaa.kjko0im.mongodb.net/complexrp?appName=Hipaaaaa";

// Connection Cache
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

// Schema Definition
const updateSchema = new mongoose.Schema({
  id: String,
  title: String,
  subtitle: String,
  description: String,
  imageUrl: String,
  secondaryImage: String,
  tag: String,
  date: String,
  fullContent: String,
  rawBlocks: mongoose.Schema.Types.Mixed,
  isFeatured: Boolean,
  version: String
}, { strict: false });

const Update = mongoose.models.Update || mongoose.model('Update', updateSchema);

// Initial Seed Data (To ensure the app isn't empty on first load)
const SEED_DATA = [
  {
    id: 'wipe-legacy-2',
    title: 'WIPE LEGACY',
    subtitle: 'EL NUEVO COMIENZO',
    version: 'UPDATE #01',
    description: 'Un reinicio total de la economía, propiedades y facciones para dar paso a la versión 2.0 de Complex Legacy. Nuevos sistemas, optimización y un mapa renovado.',
    imageUrl: 'https://media1.tenor.com/m/x0GvTq2WfFMAAAAd/gta-rp.gif',
    secondaryImage: 'https://picsum.photos/1920/1080?grayscale',
    tag: 'SISTEMAS',
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
    tag: 'EVENTO',
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
    tag: 'ECONOMÍA',
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
    tag: 'MAPA',
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
    tag: 'TRABAJOS',
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
    tag: 'SISTEMAS',
    date: '01 AGO 2025',
    fullContent: `Las bandas ahora pueden luchar por el control de territorios.`
  }
];

export default async function handler(request, response) {
  try {
    await connectToDatabase();

    // GET: Fetch all updates
    if (request.method === 'GET') {
      const count = await Update.countDocuments();
      if (count === 0) {
        // Seed if empty
        await Update.insertMany(SEED_DATA);
      }

      const updates = await Update.find({}).sort({ _id: -1 }); // Newest first based on insertion/creation
      return response.status(200).json(updates);
    }

    // POST: Create or Update (Upsert based on ID)
    if (request.method === 'POST') {
      const data = request.body;
      const existing = await Update.findOne({ id: data.id });
      
      if (existing) {
          // Update existing
          Object.assign(existing, data);
          await existing.save();
          return response.status(200).json(existing);
      } else {
          // Create new
          const newUpdate = new Update(data);
          await newUpdate.save();
          return response.status(201).json(newUpdate);
      }
    }

    // PUT: Explicit Update
    if (request.method === 'PUT') {
        const data = request.body;
        const { id, ...updateData } = data;
        const updated = await Update.findOneAndUpdate({ id }, updateData, { new: true });
        return response.status(200).json(updated);
    }

    // DELETE: Remove update
    if (request.method === 'DELETE') {
      const { id } = request.query;
      await Update.deleteOne({ id });
      return response.status(200).json({ success: true });
    }

    return response.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Database Error:', error);
    return response.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}