const fs = require('fs');

let content = fs.readFileSync('c:\\\\Users\\\\Dell\\\\Desktop\\\\mushi\\\\web\\\\src\\\\app\\\\dashboard\\\\teacher\\\\page.tsx', 'utf8');

const fetchStudentsStr = `    let availableStudentsRaw: any[] = [];
    try {
      const requestsSnap = await getDocs(collection(db, 'students'));
      availableStudentsRaw = requestsSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
      availableStudentsRaw.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    } catch(e) {
      console.warn("Failed to fetch students", e);
    }`;

const newFetchStudentsStr = `    let availableStudentsRaw: any[] = [];
    let parentsMap: any = {};
    try {
      const [requestsSnap, parentsSnap] = await Promise.all([
        getDocs(collection(db, 'students')),
        getDocs(collection(db, 'parents'))
      ]);
      
      parentsSnap.docs.forEach((d: any) => {
        parentsMap[d.id] = d.data().name || d.data().fullName;
      });

      availableStudentsRaw = requestsSnap.docs.map((d: any) => {
        const data = d.data();
        return { 
          id: d.id, 
          ...data,
          parentName: parentsMap[data.parentId] || data.parentName || 'Household / Parent'
        };
      });
      availableStudentsRaw.sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0));
    } catch(e) {
      console.warn("Failed to fetch students or parents", e);
    }`;

content = content.replace(fetchStudentsStr, newFetchStudentsStr);

const groupingStr = `                          if (!acc[student.parentId]) {
                            acc[student.parentId] = {
                              parentId: student.parentId,
                              address: student.area || student.address || 'Location Hidden',
                              students: []
                            };
                          }`;

const newGroupingStr = `                          if (!acc[student.parentId]) {
                            acc[student.parentId] = {
                              parentId: student.parentId,
                              parentName: student.parentName,
                              address: student.area || student.address || 'Location Hidden',
                              students: []
                            };
                          }`;

content = content.replace(groupingStr, newGroupingStr);

const headingStr = `<h3 className="text-lg font-black text-gray-900">Household / Parent</h3>`;
const newHeadingStr = `<h3 className="text-lg font-black text-gray-900">{household.parentName || 'Household / Parent'}</h3>`;

content = content.replace(headingStr, newHeadingStr);

fs.writeFileSync('c:\\\\Users\\\\Dell\\\\Desktop\\\\mushi\\\\web\\\\src\\\\app\\\\dashboard\\\\teacher\\\\page.tsx', content);
console.log('Teacher dashboard page.tsx updated successfully.');
