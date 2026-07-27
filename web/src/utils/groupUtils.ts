import { collection, query, where, getDocs, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';

export async function syncTuitionRequestForGroup(db: any, groupId: string, parentId: string) {
  // 1. Fetch group
  const groupRef = doc(db, 'groups', groupId);
  const groupSnap = await (await import('firebase/firestore')).getDoc(groupRef);
  
  if (!groupSnap.exists()) {
    return;
  }
  
  const groupData = groupSnap.data();
  const studentIds = groupData.studentIds || [];
  
  // 2. Fetch all students in this group
  let studentsDetails: any[] = [];
  let combinedSubjects = new Set<string>();
  let combinedTechnologies = new Set<string>();
  let combinedLanguages = new Set<string>();
  let combinedBudget = 0;
  let category = '';

  if (studentIds.length > 0) {
    const studentsSnap = await getDocs(query(collection(db, 'students'), where('groupId', '==', groupId)));
    const students = studentsSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
    
    for (const st of students) {
      if (!category && st.category) category = st.category;
      
      studentsDetails.push({
        id: st.id,
        name: st.name || '',
        classLevel: st.classLevel || st.classGrade || '',
        board: st.board || '',
        subjects: st.subjects || [],
        technologies: st.technologies || [],
        languages: st.languages || [],
        budget: st.budget || 0,
      });
      
      (st.subjects || []).forEach((s: string) => combinedSubjects.add(s));
      (st.technologies || []).forEach((s: string) => combinedTechnologies.add(s));
      (st.languages || []).forEach((s: string) => combinedLanguages.add(s));
      combinedBudget += (st.budget || 0);
    }
  }

  // 3. Find or Create tuition_request
  const requestQuery = query(collection(db, 'tuition_requests'), where('groupId', '==', groupId));
  const requestSnap = await getDocs(requestQuery);
  
  if (studentIds.length === 0) {
    // Delete group and request if empty
    await deleteDoc(groupRef);
    if (!requestSnap.empty) {
      for (const reqDoc of requestSnap.docs) {
        await deleteDoc(reqDoc.ref);
      }
    }
    return;
  }

  const payload = {
    groupId,
    parentId,
    category,
    mode: groupData.mode || '',
    area: groupData.area || '',
    city: groupData.city || '',
    latitude: groupData.latitude || null,
    longitude: groupData.longitude || null,
    teacherGenderPreference: groupData.teacherGenderPreference || 'No Preference',
    preferredTimeRange: groupData.preferredTimeRange || '',
    daysPerWeek: groupData.daysPerWeek || '',
    specificDays: groupData.specificDays || [],
    studentsDetails,
    combinedSubjects: Array.from(combinedSubjects),
    combinedTechnologies: Array.from(combinedTechnologies),
    combinedLanguages: Array.from(combinedLanguages),
    combinedBudget,
    status: 'open',
    acceptedTutorId: '',
  };

  if (requestSnap.empty) {
    const newRequestRef = doc(collection(db, 'tuition_requests'));
    await setDoc(newRequestRef, {
      id: newRequestRef.id,
      createdAt: Date.now(),
      ...payload
    });
  } else {
    for (const reqDoc of requestSnap.docs) {
      await updateDoc(reqDoc.ref, payload);
    }
  }
}
