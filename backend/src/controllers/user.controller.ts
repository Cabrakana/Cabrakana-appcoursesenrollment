import express from 'express';
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../prisma/prismaClient'

import { createCourse, createEvent, createEventFollower, createForum, createForumComments, createUser, getAllCourses, getAllEvents, getAllForumCommentsByForumId, getAllForums, getEventByUserId, getEventFollowerByUserId, getForumsByUserId, getUserByEmail } from '../services/user.service';
;


export const updateUserProfileHandler = async (req: Request, res: Response) => {
  const { user_id, newAvatar, newGender, newDescription, newAge, isAgeVisible } = req.body;

  try {
    // Validar los datos antes de continuar
    if (!user_id) {
      return res.status(400).json({ error: 'Falta el ID de usuario' });
    }

    // Actualizar los datos del usuario en la base de datos
    const updatedUser = await prisma.user.update({
      where: { user_id: user_id },
      data: {
        profile_image: newAvatar , // Si no hay nueva imagen, no se actualiza
        gender: newGender || undefined, // Si no hay nuevo género, no se actualiza
        description: newDescription || undefined, // Si no hay nueva descripción, no se actualiza
        age: newAge || undefined, // Si no hay nueva edad, no se actualiza
        age_visible: isAgeVisible, // Se actualiza la visibilidad de la edad
      },
    });

    res.status(200).json({
      message: 'Perfil actualizado correctamente',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error actualizando el perfil:', error);
    res.status(500).json({ error: 'Error interno al actualizar el perfil' });
  }
};

// Handler para guardar eventos seguidos 
export const createFollowedEventHandler = async (req: express.Request, res: express.Response) => {
  const { user_id, event_id } = req.body;

  try {
    // Validar los datos antes de continuar
    if (!user_id || !event_id ) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    // Crear un foro utilizando la función correspondiente
    const newEventFollower = await createEventFollower(
     generateUUID(), // Si no se genera automáticamente en la base de datos
     event_id,
     user_id,
     new Date(), // Agregar la fecha de creación
    );

    // Responder con el foro creado
    res.status(201).json(newEventFollower);
  } catch (error) {
    console.error('Error creando el evento a seguir:', error);
    res.status(500).json({ error: 'Error creando el evento a seguir'});
  }
};

export const registerUser = async (req: Request, res: Response) => {
  const { name, username, email, password } = req.body;
  try {
    // Validación de datos básicos
    if (!name || !username || !email || !password) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    // Verifica si el email ya está registrado
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: 'El correo ya está registrado' });
    }


    // Hashea la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crea el usuario
    const newUser = await prisma.user.create({
      data: {
        username: username,
        email: email,
        password: hashedPassword,
        
      },
    });

    res.status(201).json({ message: 'Usuario registrado con éxito', user: newUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

export const createUserHandler = async(req: express.Request, res: express.Response) => {
  const { username, email, password } = req.body;
  try {
    const newUser = await createUser(username, email, password);
    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ error: 'Error creating user' });
  }
};

// Handler para crear cursos
export const createCourseHandler = async (req:  express.Request, res:  express.Response) => {
  const { title, description, image_url, price, course_code } = req.body;

  try {
    // Validar los datos antes de continuar
    if (!title || !description || !price || !course_code) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    // Crear un curso utilizando la función correspondiente
    const newCourse = await createCourse(
     generateUUID(), // Si no se genera automáticamente en la base de datos
      title,
      description,
      image_url,
      parseFloat(price), // Convertir el precio a número
      course_code,
     new Date(), // Agregar la fecha de creación
    );

    // Responder con el curso creado
    res.status(201).json(newCourse);
  } catch (error) {
    console.error('Error creando curso:', error);
    res.status(500).json({ error: 'Error creando el curso' });
  }
};


// Handler para crear foros
export const createForumHandler = async (req: express.Request, res: express.Response) => {
  const { title, description, created_by } = req.body;

  try {
    // Validar los datos antes de continuar
    if (!title || !description || !created_by) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    // Crear un foro utilizando la función correspondiente
    const newForum = await createForum(
     generateUUID(), // Si no se genera automáticamente en la base de datos
      title,
      description,
      created_by,
     new Date(), // Agregar la fecha de creación
    );

    // Responder con el foro creado
    res.status(201).json(newForum);
  } catch (error) {
    console.error('Error creando foro:', error);
    res.status(500).json({ error: 'Error creando el foro' });
  }
};



// Handler para crear eventos
export const createEventHandler = async (req: express.Request, res: express.Response) => {
  const { title,  description, event_date, event_image_url, location, latitude,  longitude,  created_by  } = req.body;

  try {
    // Validar los datos antes de continuar (opcional, pero recomendado)
    if (!title || !description || !event_date || !location || !created_by) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    // Crear un evento utilizando la función correspondiente
    const newEvent = await createEvent(
      generateUUID(), // Si no se genera automáticamente en la base de datos
      title,
      description,
      new Date(event_date), // Asegúrate de convertir la fecha a un formato válido
      event_image_url,
      location,
      parseFloat(latitude), // Convertir a número si es necesario
      parseFloat(longitude), // Convertir a número si es necesario
      created_by,
      new Date(), // Agregar la fecha de creación
    );

    // Responder con el evento creado
    res.status(201).json(newEvent);
  } catch (error) {
    console.error('Error creando evento:', error);
    res.status(500).json({ error: 'Error creando el evento' });
  }
};

// Función auxiliar para generar un UUID
const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};


export const getUserHandler = async  (req: express.Request, res: express.Response)  => {
  const { email } = req.params;
  try {
    
    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching user' });
  }
};

export const getAllForumsCommentsHandler =   async  (req: express.Request, res: express.Response)  => {

  const { forum_id } = req.params;
  try {
      const forums = await getAllForumCommentsByForumId(forum_id);
      
      if (!forums || forums.length === 0) {
        return res.status(404).json({ error: 'No comments found' });
      }
  
      res.json(forums);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching comments forums' });
    }
};

export const createForumsCommentsHandler =   async  (req: express.Request, res: express.Response)  => {
    const { forum_id,  user_id, comment_text } = req.body;
  
    try {
      // Validar los datos antes de continuar (opcional, pero recomendado)
      if (!forum_id || !user_id || !comment_text) {
        return res.status(400).json({ error: 'Faltan campos obligatorios' });
      }
  
      // Crear un evento utilizando la función correspondiente
      const newEvent = await createForumComments(
        forum_id, // Si no se genera automáticamente en la base de datos
        user_id,
        comment_text,// Asegúrate de convertir la fecha a un formato válido
        new Date(),
        new Date()// Agregar la fecha de creación
      );
  
      // Responder con el evento creado
      res.status(201).json(newEvent);
    } catch (error) {
      console.error('Error creando evento:', error);
      res.status(500).json({ error: 'Error creando el evento' });
    }
  };

 export const getAllForumsHandler = async  (req: express.Request, res: express.Response)  => {
    try {
        const forums = await getAllForums();
        
        if (!forums || forums.length === 0) {
          return res.status(404).json({ error: 'No forums found' });
        }
    
        res.json(forums);
      } catch (error) {
        res.status(500).json({ error: 'Error fetching forums' });
      }
  };
  
export const getAllEventsHandler = async  (req: express.Request, res: express.Response)  => {
    try {
        const events = await getAllEvents();
        
       if (!events || events.length === 0) {
          return res.status(404).json({ error: 'No events found' });
        }
        res.json(events);
      } catch (error) {
        res.status(500).json({ error: 'Error fetching events' });
      }
  };

  
export const getEventsByUserIdHandler = async  (req: express.Request, res: express.Response)  => {

  const { user_id } = req.params;
  try {
      const events = await getEventByUserId(user_id);
      
     if (!events || events.length === 0) {
        return res.status(404).json({ error: 'No events found' });
      }
      res.json(events);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching events' });
    }
};


export const getForumsByUserIdHandler = async  (req: express.Request, res: express.Response)  => {

  const { user_id } = req.params;
  try {
      const forums = await getForumsByUserId(user_id);
      
     if (!forums || forums.length === 0) {
        return res.status(404).json({ error: 'No forums found' });
      }
      res.json(forums);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching forums' });
    }
};

export const getFollowedEventsByUserIdHandler = async  (req: express.Request, res: express.Response)  => {

    const { user_id } = req.params;
    try {
        const events = await getEventFollowerByUserId(user_id);
        
       if (!events || events.length === 0) {
          return res.status(404).json({ error: 'No events found' });
        }
        res.json(events);
      } catch (error) {
        res.status(500).json({ error: 'Error fetching events' });
      }
  };

  export const getAllCoursesHandler = async  (req: express.Request, res: express.Response)  => {
    try {
        const courses = await getAllCourses();
        
        if (!courses || courses.length === 0) {
          return res.status(404).json({ error: 'No courses found' });
        }
    
        res.json(courses);
      } catch (error) {
        res.status(500).json({ error: 'Error courses events' });
      }
  };