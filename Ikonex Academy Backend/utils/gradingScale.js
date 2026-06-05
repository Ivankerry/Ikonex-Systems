// gradingScale.js
// Centralised grading logic. Used by results.service.js.
// Edit the GRADE_SCALE array to change grade boundaries without touching service code.

const GRADE_SCALE = [
  { min: 70, max: 100, grade: 'A', label: 'Distinction'  },
  { min: 60, max: 69,  grade: 'B', label: 'Credit'       },
  { min: 50, max: 59,  grade: 'C', label: 'Merit'        },
  { min: 40, max: 49,  grade: 'D', label: 'Pass'         },
  { min: 0,  max: 39,  grade: 'F', label: 'Fail'         },
];

/**
 * Get grade info for a numeric score.
 * @param {number} score
 * @returns {{ grade: string, label: string }}
 */
function getGrade(score) {
  return GRADE_SCALE.find(g => score >= g.min && score <= g.max)
    || { grade: 'F', label: 'Fail' };
}

module.exports = { getGrade, GRADE_SCALE };
