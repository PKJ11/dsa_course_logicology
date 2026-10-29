export const code = `def days_needed(parcels, cap):
    days, load = 1, 0
    for w in parcels:
        if load + w > cap:              # this parcel waits for the next day
            days, load = days + 1, 0
        load += w
    return days

def min_capacity(parcels, days):
    lo, hi = max(parcels), sum(parcels)   # the answer is in [lo, hi]; hi always works
    while lo < hi:
        mid = (lo + hi) // 2
        if days_needed(parcels, mid) <= days:
            hi = mid                      # mid works: the smallest working value is <= mid
        else:
            lo = mid + 1                  # mid fails: so does everything below it
    return lo
`;

export const notes = [
  "Range: the van must carry the heaviest parcel, so the answer is at least `max(parcels)`. A van of `sum(parcels)` takes everything on the first day, so that capacity always works.",
  "Test: for a fixed capacity, filling each day's van as full as possible is the best plan. Holding a parcel back can only push the later parcels later. So `days_needed(cap) <= days` tells you whether `cap` works.",
  "Monotone: any loading plan that fits a van of capacity c also fits a bigger van. So the answers go F … F T … T, and the loop finds the first T.",
  "How long it takes: each test is O(n), and there are about log₂(sum − max) tests, so O(n log S) in total. For the test with 50,000 parcels, that is about 24 passes over the list.",
];
