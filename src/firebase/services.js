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

export const projectsCollection = collection(db, 'projects');
export const timersCollection = collection(db, 'timers');

// Add project to Firebase
export const addProjectToFirebase = async (projectData, userId) => {
  try {
    console.log('Creating project:', projectData); // Debug log
    const docRef = await addDoc(projectsCollection, {
      ...projectData,
      userId,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log('Project created with ID:', docRef.id); // Debug log
    return docRef.id;
  } catch (error) {
    console.error('Error adding project:', error);
    throw error;
  }
};

// ✅ MISSING FUNCTION - Update project in Firebase
export const updateProjectInFirebase = async (projectId, projectData) => {
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

// ✅ MISSING FUNCTION - Delete project from Firebase
export const deleteProjectFromFirebase = async (projectId) => {
  try {
    await deleteDoc(doc(db, 'projects', projectId));
  } catch (error) {
    console.error('Error deleting project:', error);
    throw error;
  }
};

// Get user projects with real-time updates
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

// ✅ ADDITIONAL HELPER FUNCTIONS

// Get all projects for a user (one-time fetch)
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

// Save timer data to Firebase (optional)
export const saveTimerToFirebase = async (projectId, timerData, userId) => {
  try {
    const timerRef = doc(db, 'timers', projectId);
    await updateDoc(timerRef, {
      ...timerData,
      userId,
      updatedAt: new Date()
    });
  } catch (error) {
    // If document doesn't exist, create it
    try {
      await addDoc(timersCollection, {
        projectId,
        ...timerData,
        userId,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    } catch (addError) {
      console.error('Error saving timer:', addError);
      throw addError;
    }
  }
};

// Get timer for a project (optional)
export const getTimerFromFirebase = async (projectId) => {
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
