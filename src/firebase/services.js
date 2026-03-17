import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc,
  setDoc,
  getDoc,
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

// Update project in Firebase
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

// Delete project from Firebase
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

// ========== ADDITIONAL HELPER FUNCTIONS ==========

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

// ========== SESSION HISTORY (FIRESTORE) ==========

// Add a session record to Firestore
export const addSessionToFirebase = async (sessionData, userId) => {
  try {
    const sessionsRef = collection(db, 'sessions');
    const docRef = await addDoc(sessionsRef, {
      ...sessionData,
      userId,
      createdAt: new Date()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving session:', error);
    throw error;
  }
};

// Subscribe to user sessions in real-time
export const subscribeToUserSessions = (userId, callback) => {
  const q = query(
    collection(db, 'sessions'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc') // <-- Added backend sorting here
  );

  return onSnapshot(q, (snapshot) => {
    const sessions = [];
    snapshot.forEach((doc) => {
      sessions.push({ id: doc.id, ...doc.data() });
    });
    
    // Removed the client-side array sorting so Firebase handles it efficiently
    callback(sessions);
  }, (error) => {
    console.error("Error subscribing to sessions:", error);
  });
};

// ========== TIMER DATA (FIRESTORE) ==========

// Save all timer data for a user
export const saveTimerDataToFirebase = async (userId, timerData) => {
  try {
    const timerDocRef = doc(db, 'userTimers', userId);
    await setDoc(timerDocRef, {
      ...timerData,
      updatedAt: new Date()
    }, { merge: true });
  } catch (error) {
    console.error('Error saving timer data:', error);
  }
};

// Load timer data for a user
export const loadTimerDataFromFirebase = async (userId) => {
  try {
    const timerDocRef = doc(db, 'userTimers', userId);
    const snap = await getDoc(timerDocRef);
    if (snap.exists()) {
      return snap.data();
    }
    return null;
  } catch (error) {
    console.error('Error loading timer data:', error);
    return null;
  }
};

// ========== USER PROFILE / ONBOARDING ==========

// Get user profile (includes onboarding status)
export const getUserProfile = async (userId) => {
  try {
    const profileRef = doc(db, 'userProfiles', userId);
    const snap = await getDoc(profileRef);
    if (snap.exists()) {
      return snap.data();
    }
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};

// Mark user onboarding as completed
export const markOnboardingComplete = async (userId) => {
  try {
    const profileRef = doc(db, 'userProfiles', userId);
    await setDoc(profileRef, {
      onboardingCompleted: true,
      onboardingCompletedAt: new Date()
    }, { merge: true });
  } catch (error) {
    console.error('Error marking onboarding complete:', error);
  }
};