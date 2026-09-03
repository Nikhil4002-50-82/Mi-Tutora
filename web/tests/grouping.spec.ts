import { test, expect } from '@playwright/test';

test.describe('Student Grouping Architecture (Student_Grouping_Architecture.md)', () => {

  interface StudentItem {
    id: string;
    name: string;
    category?: string;
    subjects?: string[];
    technologies?: string[];
    languages?: string[];
    budget?: number;
  }

  function aggregateGroupDetails(students: StudentItem[]) {
    let combinedBudget = 0;
    const combinedSubjects = new Set<string>();
    const combinedTechnologies = new Set<string>();
    const combinedLanguages = new Set<string>();
    let category = '';

    for (const st of students) {
      if (!category && st.category) category = st.category;
      combinedBudget += (st.budget || 0);

      (st.subjects || []).forEach(s => combinedSubjects.add(s));
      (st.technologies || []).forEach(t => combinedTechnologies.add(t));
      (st.languages || []).forEach(l => combinedLanguages.add(l));
    }

    return {
      category,
      combinedBudget,
      combinedSubjects: Array.from(combinedSubjects),
      combinedTechnologies: Array.from(combinedTechnologies),
      combinedLanguages: Array.from(combinedLanguages)
    };
  }

  test('Correctly aggregates combined budget from all students in group', () => {
    const students: StudentItem[] = [
      { id: 's1', name: 'Alice', budget: 1500 },
      { id: 's2', name: 'Bob', budget: 2000 },
      { id: 's3', name: 'Charlie', budget: 1200 }
    ];

    const result = aggregateGroupDetails(students);
    expect(result.combinedBudget).toBe(4700);
  });

  test('Deduplicates combined subjects across multiple students', () => {
    const students: StudentItem[] = [
      { id: 's1', name: 'Alice', subjects: ['Mathematics', 'Science'] },
      { id: 's2', name: 'Bob', subjects: ['Science', 'English'] },
      { id: 's3', name: 'Charlie', subjects: ['Mathematics', 'Social Studies'] }
    ];

    const result = aggregateGroupDetails(students);
    expect(result.combinedSubjects.sort()).toEqual(['English', 'Mathematics', 'Science', 'Social Studies']);
  });

  test('Deduplicates combined technologies for programming groups', () => {
    const students: StudentItem[] = [
      { id: 's1', name: 'Alice', category: 'programming', technologies: ['Python', 'SQL'] },
      { id: 's2', name: 'Bob', category: 'programming', technologies: ['Python', 'Docker'] }
    ];

    const result = aggregateGroupDetails(students);
    expect(result.category).toBe('programming');
    expect(result.combinedTechnologies.sort()).toEqual(['Docker', 'Python', 'SQL']);
  });

  test('Adopts first student category as primary group category', () => {
    const students: StudentItem[] = [
      { id: 's1', name: 'Alice', category: 'school' },
      { id: 's2', name: 'Bob', category: 'languages' }
    ];

    const result = aggregateGroupDetails(students);
    expect(result.category).toBe('school');
  });
});
