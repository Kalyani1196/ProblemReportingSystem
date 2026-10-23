// ProblemContext is deprecated. The application now uses live backend REST API via src/services/api.js
export const useProblems = () => {
  return {
    problems: [],
    addProblem: () => {},
    updateProblemStatus: () => {},
  };
};

export default function ProblemProvider({ children }) {
  return children;
}