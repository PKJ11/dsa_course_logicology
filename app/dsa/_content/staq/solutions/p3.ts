// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `from collections import deque


class RecentPings:
    def __init__(self, window):
        self.window = window
        self.q = deque()              # ping times, oldest at the front

    def ping(self, t):
        self.q.append(t)
        while self.q[0] < t - self.window:
            self.q.popleft()          # too old now, so too old for ever
        return len(self.q)
`;

export const notes = [
  "Times only increase, so a ping that is too old now stays too old. It can be thrown away for good.",
  "The deque holds the pings in time order. Old ones are at the front, which `popleft` removes in O(1).",
  "The loop never empties the deque, because the newest ping, t itself, is never older than t - window.",
  "Each ping is added once and removed at most once, so the calls take O(1) time on average. A list with `pop(0)` gives the same answers, but each removal moves every other ping.",
];
