---
title: Building percentage rollout in feature flags
date: "2025-07-31T07:08:32.169Z"
---

A few years back, a client of mine wanted a feature flagging solution and me and my team were asked to interview and pick a suitable vendor. We set up a call with a few vendors and quickly realised that the client wanted only a subset of features that these enterprise solutions were offering and going with these solutions meant they were unnecessarily going to be paying for things they don't actually need and will not need in the foreseeable future. It was also clear that we would be kinda vendor-locked as our flags grew, and these systems don’t make it easy to export flags (with all the configs) into a different one.

At this point, I was already thinking if we could build this in-house but before pitching it to the client, the only feature that was a question mark in my head was the percentage rollout. I did not have a clear idea on how to go about building it. 

For those of you who don't know, a feature can be turned on only for a subset of users before it's available to everyone, for example, say, only 70% of the user base
  - At any point in time, the percentage can be increased or decreased
  - It can be converted into a normal feature flag which can turn on for all users or none at all


### The problem

First thought was: can we store all of this in the DB, say when `flag-1` is turned on for `70%` of users? Each flag has an association with every user whether it is `on` or `off`?

Sure, but what happens when we now want to, 
- Decrease it to `30%` for the same flag?
  Go through the entire list and update each user row so that it reflects the new change?

- Even worse, what happens when new users get added?
  Go through all your feature flags and the users list associated with each of them and update each value?

So, I quickly realised we needed a stateless solution since maintaining state is cumbersome in this case. However, with a stateless solution, we should ensure,

1) **Stickiness**: The same user should land on the same side of the threshold every time. If flag-1 is at, say, 70%, a user who’s “in” stays in across sessions and as new users join. The outcome shouldn’t flap between logins.
2) **Cheap to compute**: Which side of the threshold the user falls on should be easily computable (ideally O(1)); if it’s slow, that latency cascades to the endpoints behind the flag

So, how do we actually solve this?

First thought was, can we convert the user email into a large pseudo-random number?

```python
user_hash = hashlib.sha1("abc@gmail.com".encode("utf-8")).hexdigest()
c0d0a32c405c68cb538e3891a3e3bce98887f012 # which will produce something like this
```

Cryptographic hashes (like SHA-1) are designed so that tiny input changes produce seemingly unrelated outputs. That makes the 160-bit digest look random across its full range, or you could also use a UUID associated with the user to produce a similar effect.

Now that we have a pseudo-random number that’s unique to the user and changes drastically with minor input changes, we can bucket it across the available percentage by taking a mod of 100, as shown below

```python
num_user_hash = int(user_hash, 16)
score = num_user_hash % 100
```

We can use this to determine whether the flag is on or off, based on whether the score is within the set percentage of the flag or not. You can try it yourself with the code below—it prints how many users get the feature for a given rollout percentage.

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
    user_hash = hashlib.sha1(key.encode("utf-8")).hexdigest()
    num_user_hash = int(user_hash, 16)
    score = num_user_hash % 100
    return score < ROLLOUT_PERCENTAGE

# tests
if __name__ == '__main__':
  total_true = 0
  for user in users:
    if get_flag_value(user) == True:
      total_true += 1
  print('true', total_true)
```


There’s one catch: because the percentage is calculated from a fixed input (email here), all flags would select the same users at a given percentage. So, we could add a salt that it's unique to a feature flag when calculating the hash in order to get different user sets per flag, like so

```python
key = f"{flag_id}:{user_email}"
user_hash = hashlib.sha1(key.encode("utf-8")).hexdigest()
```

The solution ended up being delivered at 1/5th of the cost of the commercial solutions in less than 6-7 weeks with respective SDKs without worry about vendor lock-in and with just the feature set they need.