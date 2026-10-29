// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `import heapq

def platforms(trains):
    busy = []                         # departure times, smallest on top
    for arrive, depart in sorted(trains):
        if busy and busy[0] <= arrive:
            heapq.heapreplace(busy, depart)   # that platform is free: reuse it
        else:
            heapq.heappush(busy, depart)      # every platform is busy: open one
    return len(busy)
`;

export const notes = [
  "Trains are taken in order of arrival. The heap holds one departure time per platform; its smallest is the platform that frees up first. If even that one is still busy, every platform is busy.",
  "The method opens a new platform only when every open platform holds a train at that moment, so it never uses more platforms than the largest number of trains in at once, and no plan can use fewer.",
  "`<=` makes a platform free again at its train's departure time (the times are half-open).",
  "O(n log n). The event method also works: sort (time, +1 or -1) pairs so that -1 comes first at equal times, and keep the largest running total.",
];
