import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import { db } from './config';

// Projects Collection
export const projectsCollection = collection(db, 'projects');
export const timersCollection = collection(db, 'timers');

// Create a new project
export const addProject = async (projectData, userId) => {
  try {
    const docRef = await addDoc(projectsCollection, {
      ...projectData,
      userId,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding project:', error);
    throw error;
  }
};

// Get all projects for a user
export const getUserProjects = async (userId) => {
  try {
    const q = query(
      projectsCollection, 
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const projects = [];
    querySnapshot.forEach((doc) => {
      projects.push({ id: doc.id, ...doc.data() });
    });
    return projects;
  } catch (error) {
    console.error('Error getting projects:', error);
    throw error;
  }
};

// Update a project
export const updateProject = async (projectId, projectData) => {
  try {
    const projectRef = doc(db, 'projects', projectId);
    await updateDoc(projectRef, {
      ...projectData,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error updating project:', error);
    throw error;
  }
};

// Delete a project
export const deleteProject = async (projectId) => {
  try {
    await deleteDoc(doc(db, 'projects', projectId));
  } catch (error) {
    console.error('Error deleting project:', error);
    throw error;
  }
};

// Timer functions
export const saveTimer = async (projectId, timerData, userId) => {
  try {
    const timerRef = doc(db, 'timers', projectId);
    await updateDoc(timerRef, {
      ...timerData,
      userId,
      updatedAt: new Date()
    });
  } catch (error) {
    // If document doesn't exist, create it
    await addDoc(timersCollection, {
      projectId,
      ...timerData,
      userId,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }
};

// Get timer for a project
export const getTimer = async (projectId) => {
  try {
    const q = query(timersCollection, where('projectId', '==', projectId));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    }
    return null;
  } catch (error) {
    console.error('Error getting timer:', error);
    throw error;
  }
};

// Real-time listener for projects
export const subscribeToUserProjects = (userId, callback) => {
  const q = query(
    projectsCollection, 
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const projects = [];
    querySnapshot.forEach((doc) => {
      projects.push({ id: doc.id, ...doc.data() });
    });
    callback(projects);
  });
};
