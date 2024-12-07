import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ForumSearch from '../components/Forums/ForumSearch';
import ForumCard from '../components/Forums/ForumCard';

interface Forum {
  forum_id: string;
  title: string;
  description: string;
  created_by: string;
  created_at: string;
}

const Forums: React.FC = () => {
  const [forums, setForums] = useState<Forum[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchForums = async () => {
      try {
        const response = await fetch('http://localhost:4000/forums'); // Cambia la URL a tu endpoint real
        if (!response.ok) {
          throw new Error('Error al obtener los foros');
        }
        const data = await response.json();
        setForums(data);
      } catch (error) {
        console.error('Error al obtener los foros:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchForums();
  }, []);

  return (
    <div>
      <div className="p-4 m-2 flex justify-center gap-4">
        <ForumSearch onSearch={() => { /* Implementar búsqueda aquí */ }} />

        <Link to="/created-forums">
          <button className="bg-white rounded-lg p-2 font-bold shadow-md text-pink-500">
            Mis foros
          </button>
        </Link>
      </div>

      <div className="p-4 m-2 flex flex-col justify-center gap-4">
        <p>{loading ? 'Cargando foros...' : `${forums.length} nuevos posts`}</p>

        {loading ? (
          <p>Cargando...</p>
        ) : forums.length > 0 ? (
          forums.map((forum) => (
            <ForumCard
              key={forum.forum_id}
              title={forum.title}
              description={forum.description}
              author={forum.created_by}
              createdAt={new Date(forum.created_at).toLocaleDateString()}
              image={''} // Agrega la lógica para manejar imágenes si es necesario
            />
          ))
        ) : (
          <p>No hay foros disponibles</p>
        )}
      </div>
    </div>
  );
};

export default Forums;