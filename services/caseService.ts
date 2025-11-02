import { DermaSightResponse } from '../types';

const CASES_STORAGE_KEY = 'dermasight-cases';

export const getAllCases = (): DermaSightResponse[] => {
  try {
    const storedCases = localStorage.getItem(CASES_STORAGE_KEY);
    const cases: DermaSightResponse[] = storedCases ? JSON.parse(storedCases) : [];
    
    // Ensure timestamp exists for sorting, default to a very old date if not
    return cases.sort((a, b) => {
        const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
        const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
        return timeB - timeA;
    });
  } catch (error) {
    console.error("Failed to parse cases from localStorage", error);
    return [];
  }
};

export const addCase = (newCase: DermaSightResponse) => {
  try {
    // Reading all cases and then filtering ensures we don't have duplicates and respects sorting
    const allCases = getAllCases();
    // Prevent duplicate case IDs
    const updatedCases = [newCase, ...allCases.filter(c => c.doctor_dashboard.case_id !== newCase.doctor_dashboard.case_id)];
    localStorage.setItem(CASES_STORAGE_KEY, JSON.stringify(updatedCases));
  } catch (error) {
    console.error("Failed to save case to localStorage", error);
  }
};

export const updateCase = (updatedCase: DermaSightResponse) => {
  try {
    const allCases = getAllCases();
    const caseIndex = allCases.findIndex(c => c.doctor_dashboard.case_id === updatedCase.doctor_dashboard.case_id);
    if (caseIndex !== -1) {
      allCases[caseIndex] = updatedCase;
      localStorage.setItem(CASES_STORAGE_KEY, JSON.stringify(allCases));
    }
  } catch (error) {
    console.error("Failed to update case in localStorage", error);
  }
};