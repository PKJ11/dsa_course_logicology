// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `def least_lateness(jobs):
    t = worst = 0
    for length, due in sorted(jobs, key=lambda j: j[1]):  # earliest deadline first
        t += length                   # this job finishes at t
        worst = max(worst, t - due)   # stays 0 while everything is on time
    return worst
`;

export const notes = [
  "Earliest deadline first is a best order. If a job runs just before a neighbour that is due earlier, swapping them never raises the largest lateness: the earlier-due job finishes sooner, and the other one now finishes when the first used to, against a later deadline.",
  "Repeating such swaps turns any order, including a best one, into the deadline order without making it worse. So the deadline order is best too.",
  "`worst` starts at 0, so a job that finishes early counts as late by 0, not by a negative amount, and an empty list gives 0.",
  "Shortest first and least slack first both fail; the tests include a two-job example for each. O(n log n) for the sort.",
];
