// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `def most_bookings(bookings):
    # positions, sorted by the end time of their booking
    order = sorted(range(len(bookings)), key=lambda i: bookings[i][1])
    chosen = []
    free = float("-inf")          # the room is free from here
    for i in order:
        start, end = bookings[i]
        if start >= free:         # fits after the last choice
            chosen.append(i)
            free = end
    return chosen
`;

export const notes = [
  "Sorting the positions rather than the bookings keeps each booking's index, which the answer needs.",
  "Taking the booking that ends first leaves the room free as early as possible. Lesson 3's \"greedy stays ahead\" proof shows that the i-th choice always ends no later than the i-th booking of any best set, so no set can have more bookings.",
  "Bookings are taken in order of end, so a new one overlaps a chosen one exactly when it starts before `free`; one comparison is enough. `start >= free` (not `>`) lets a booking start the moment the last one ends.",
  "`free` starts at minus infinity because times can be negative. The chosen positions come out in time order. O(n log n).",
];
