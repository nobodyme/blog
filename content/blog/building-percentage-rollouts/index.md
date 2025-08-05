---
title: Building Reliable Percentage Rollouts In-House
date: "2025-07-31T07:08:32.169Z"
---

A few years back, a client of mine wanted a feature flagging solution and me and my team were asked to interview and pick a suitable vendor. We set up a call with a few vendors and quickly realised that the client wanted only a subset of features that these enterprise solutions were offering and going with these solutions meant they were unnecessarily going to be paying for things they don't actually need and will not need in the foreseeable future. It was also clear that we would be kinda vendor-locked as our flags grew, and these systems don’t make it easy to export flags (with all the configs) into a different one.

At this point, I was already thinking if we could build this in-house but before pitching it to the client, the only feature that was a question mark in my head was the percentage rollout. I did not have a clear idea on how to go about building it. 

For those of you who don't know, a feature can be turned on only for a subset of users before it's available to everyone, for example, say, only 70% of the user base. This is called percentage rollouts.
  - At any point in time, the percentage can be increased or decreased
  - It can be converted into a normal feature flag which can turn on for all users or none at all


### The Problem

When thinking about building this out, my first idea was,
- Store everything in the DB, say when `flag-1` is turned on for `70%` of users,
- Each flag has an association with every user whether it is `on` or `off` for that user

Sure, but this doesn't scale,
- Changing 70% → 30% requires scanning/updating large user sets in the DB
- New users added, demand backfills across all existing flags to maintain the target percentage

So, I quickly realised we needed a stateless solution since maintaining state is cumbersome in this case. However, with a stateless solution, we should ensure,

1) **Stickiness**: The same user should land on the same side of the threshold every time. If flag-1 is at, say, 70%, a user who’s “in” stays in across sessions and as new users join. The outcome shouldn’t flap between logins.
2) **Cheap to compute**: Which side of the threshold the user falls on should be easily computable (ideally O(1)); if it’s slow, that latency cascades to the endpoints behind the flag

So, how do we actually solve this?

### Solution

After seeing a discussion about how large hash-like numbers can be treated as uniformly distributed, the core idea emerged,

First thought was, can we convert the user email into these large pseudo-random number? This could serve as the basis for bucketing users into the rollout percentage

```python
user_hash = hashlib.sha1("abc@gmail.com".encode("utf-8")).hexdigest()
c0d0a32c405c68cb538e3891a3e3bce98887f012 # which will produce a hash like this
```

Cryptographic hashes (like SHA-1) are designed so that tiny input changes produce seemingly unrelated outputs (or you could also use a UUID associated with the user to produce a similar effect).

Now that we have a pseudo-random number, we can bucket it across the available percentage by taking a mod of 100, as shown below

```python
num_user_hash = int(user_hash, 16)
score = num_user_hash % 100
```

The reason this works because a cryptographic hash behaves like a gigantic fair dice roll, its 160-bit output is spread almost perfectly evenly across all possible values, so when we take that huge number mod 100, each of the 100 possible remainders shows up about 1 % of the time, meaning the first N remainders reliably give the flag to ~N % of users.

We can use this to determine whether the flag is on or off, based on whether the score is within the set percentage of the flag or not.
You can try it yourself with the code below—it prints how many users get the feature for a given rollout percentage.

```python
import hashlib

TOTAL_USERS = 1000000
ROLLOUT_PERCENTAGE = 30

# assuming list of users
users = {}
for number in range(TOTAL_USERS):
  users['{}@gmail.com'.format(number)] = True

def get_flag_value(key):
  if users[key]:
    user_hash = hashlib.sha1(key.encode("utf-8")).hexdigest() # produce the hash with the email
    num_user_hash = int(user_hash, 16) # convert it to a number
    score = num_user_hash % 100 # take modulo to see where the user falls
    return score < ROLLOUT_PERCENTAGE # return whether the flag should be on or off for the user

# tests
if __name__ == '__main__':
  total_true = 0
  for user in users:
    if get_flag_value(user) == True:
      total_true += 1
  print('true', total_true)
```

This way, we ensure,
1) **Stickiness**: Since same user is going to produce the same hash and fall within the same bucket
2) **Cheap to compute**: Relatively cheap to calculate during a user's request. Also increasing the percentage for a flag, simple adds more users while existing users are unchanged which is exactly what we want


There’s one catch: because the percentage is calculated from a fixed input (email here), all flags would select the same users at a given percentage. We would ideally want different set of users to participate in different experiments. So, we could add a salt that it's unique to a feature flag when calculating the hash in order to get different user sets per flag, like so,

```python
key = f"{flag_id}:{user_email}"
user_hash = hashlib.sha1(key.encode("utf-8")).hexdigest()
```

### Other Minor Improvements

- Instead of having flag_id as the salt, you could also have different unique column, so if there's a situation where we need same set of users for two or more flags, we could reuse the same salt so that users are grouped the same way
- Bucket to 10,000 instead of 100 for smoother ramps and fewer visible jumps on small inputs
- Prefer a UUID or any other hash of any other user-id, if emails change

The solution ended up being delivered at 1/5th of the cost of the commercial solutions in less than 6-7 weeks with respective SDKs without worry about vendor lock-in and with just the feature set they need.