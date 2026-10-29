// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `import heapq

def schedule(jobs, m):
    order = sorted(range(len(jobs)), key=lambda j: jobs[j], reverse=True)
    machines = [(0, k) for k in range(m)]          # (load, machine), least loaded first
    answer = [0] * len(jobs)
    for j in order:
        load, k = heapq.heappop(machines)
        answer[j] = k
        heapq.heappush(machines, (load + jobs[j], k))
    return answer
`;

export const notes = [
  "Longest job first, each onto the machine with the smallest total so far (lesson 4, Graham 1969). Its busiest machine is at most 4/3 − 1/(3m) times the best possible.",
  "The job positions are sorted by length, so the answer can still be written in the given order of the jobs.",
  "The machines sit in a heap of (total, machine) pairs: the least loaded is popped, given the job and pushed back with its new total. That is O(n log n) for the sort and O(n log m) for the heap.",
  "Taking the jobs in the given order instead is only within 2 − 1/m: six short jobs and then a long one end with the long job on top of two short ones.",
];
