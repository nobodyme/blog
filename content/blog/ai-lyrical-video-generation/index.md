---
title: AI Lyrical Video Generation
date: "2025-11-21T10:05:00.000Z"
---

One evening, I was told, we have a client in line who wanted automatic lyrical video generation for a given song and to confirm the technical feasibility of it in **two days**. You were given the song itself in say, mp3 or wav and lyrics as a txt file. The goal was to produce a lyrical video where video is in the background and lyrics is in the foreground. There was one additional constraint, use everything in AWS or that can be hosted in AWS since this is going to be a AWS funded project.

Given the time constraint and goal being just ensuring feasibility, I decided to get the end to end flow working before thinking about improving quality of output. 

First things first, breaking this down into subproblems.
- How to generate the said lyric video?
- How to sync/align the lyrics to the song?
- Once video is generated, how to overlay/merge the lyric and audio in the video?

## How to generate the said lyric video?

Found a couple of models in AWS that's readily available and capable of generating videos from a text prompt via AWS Bedrock, Nova Reels and Luma AI. Given the time constraints, instead of breaking my head right now on what's better, I tested LumaAI, fair enough, it was able to follow instructions but it had it's limitations, for example, it was only able to generate video of 3 or 9 seconds. So, for generating a video for an entire song, one would have to split up into scenes and provide the model with instructions.

But how do we maintain scene cohesion?
How can one ensure adjacent scenes don't feel two unrelated videos stitched together?

Luckily, the model also allowed one to specify the start or end image of the generated video. I took advantage of this and made sure the adjacent scene always uses the last image from the last scene as the starting point.

At this point, I generated just a couple of scenes by prompting manually and observed it was able to produce cohesive outputs and moved on to the next puzzle.

## How to sync/align the lyrics to the song?

So, here I have the song and already have the lyrics. So, I don’t necessarily need to transcribe. Even transcribing speech isn't 100% perfect, so one can't expect that for a song with all the "Oooh and Ahhs". Quick googling showed what I needed was technically called **forced-alignment**, i.e, given a text/lyrics match with the audio get timestamps of the lyrics and ultimately produce a SRT file.

For this, explored various tools, like,
- Aeneas - (I couldn't get working on my mac)
- Whisper x - promised word level accuray, but transcribes by default and requires some additional work to only get it to do forced alignment
- [Torchaudio forced-alignment](https://docs.pytorch.org/audio/stable/tutorials/ctc_forced_alignment_api_tutorial.html) - This produced an output that was the closest so far with about 60% accuracy (just guessing the numbers here based on eyeballing)

None of these methods yielded good enough results. So, before discarding them, I tried isolating vocals from the song, hoping for better alignment. Used the following tools for this purpose,
- Vocal separation with HPSS technique - The results were not good enough and didn’t properly separate out the vocals
- [Demucs](https://pypi.org/project/demucs/) worked best - This produced near perfect isolation

<div style="display:flex;gap:1rem;flex-wrap:wrap;align-items:start;margin:1rem 0;">
	<figure style="flex:1;min-width:220px;margin:0;">
		<figcaption style="font-weight:600;margin-bottom:0.25rem;">Full song</figcaption>
		<audio controls preload="none" style="width:100%;">
			<!-- Prefer WAV if available, fall back to MP3 -->
			<source src="song.wav" type="audio/wav">
			Your browser does not support the audio element, try chrome.
		</audio>
	</figure>
	<figure style="flex:1;min-width:220px;margin:0;">
		<figcaption style="font-weight:600;margin-bottom:0.25rem;">Isolated vocals</figcaption>
		<audio controls preload="none" style="width:100%;">
			<source src="vocals.wav" type="audio/wav">
			Your browser does not support the audio element, try chrome.
		</audio>
	</figure>
</div>

So, first isolating the vocals using demucs followed by forced-alignment using torchaudio produced a SRT file that was pretty accurate.

## How to overlay/merge the lyrics along with audio in the video?

Ffmpeg was the easiest option to combine video, audio and add lyrics as subtitle.
But lyrical videos usually have lyrics overlayed on top of the video not just as a subtitle, plus I wanted a way to programatically style the lyrics depending upon the mood of song. That's when **Remotion** came into the picture, one can use Remotion to style lyrics using just css and seemed like a perfect fit.
For now, I looped over the couple of scenes generated from the first step to fill the entire audio length and combined it with SRT previously produced and merged everything with Remotion. The results were pretty promising, by this time I had already exhausted a day.

## Generating the full length video

Now, that we have a flow in place. I went back to generating a full length video. First idea was to split up the lyrics into 9s chunks and feed it into Claude to have it produce a prompt that can depict the meaning of the lyrics on screen, which can be fed into the video-gen model.

One thing this would lack would be the overaching meaning of the song, since Claude will only see the isolated portion of the lyrics. So, in addition to the lyrics I also generated the summary of the song at first, then along with lyrics, I also passed in the summary of the song for it to have contextual meaning.

For generating consecutive scenes, I also passed in the prompt produced by Claude for the previous scene, so it can cohesively continue the story/scene with the overall theme of the song (remember we also pass in last frame of last scene to Luma AI to maintain scene cohesion). Sample scene by scene video-gen prompts for a song below,

```
SONG_SUMMARY: # "In The End" - Linkin Park  The video tracks a journey through futile effort and inevitable loss, beginning with quiet resignation before building to emotional intensity and returning to acceptance. The energy rises from contemplative verses to powerful choruses, with a dramatic bridge that represents the final emotional breaking point. Visual motifs of clocks, pendulums, and things slipping away reinforce the central theme of wasted time and effort, while the nu-metal/rap-rock fusion reflects the early 2000s cultural moment when anger and vulnerability could coexist in mainstream music.

SCENE_ID: shot_001
It starts with one
A single raindrop falls in slow motion onto a still pond, creating concentric ripples that gradually transform into a spiraling clock face with sand-textured numerals. The camera pulls back smoothly to reveal a solitary figure standing at the water's edge, their reflection fragmenting as the ripples expand. Muted blue-gray palette with hints of amber, dramatic side lighting casting long shadows. Deliberate, measured camera movement matching the 105 BPM, creating tension before the energy builds.

SCENE_ID: shot_002
It starts with one One thing, I don't know why It doesn't even matter how hard you try Keep that in mind, I designed this rhyme to explain in due time
A solitary figure traces a single line in wet sand as time-lapse clouds race overhead. The line multiplies, branching into complex patterns that form a maze-like structure, only to be slowly erased by encroaching waves. Camera pulls back to reveal the elaborate design is futile against the tide. Muted blue-grays transition to deeper indigos as golden hour fades, with dramatic side lighting highlighting the figure's determined yet resigned posture. Steady tracking shot maintains the 105 BPM rhythm, creating visual tension between human effort and inevitable erasure.

SCENE_ID: shot_003
All I know time is a valuable thing Watch it fly by as the pendulum swings Watch it count down to the end of the day, the clock ticks life away
An antique hourglass sits on a weathered desk, sand particles cascading in hypnotic rhythm at 105 BPM. As the camera slowly orbits, shadows lengthen across the surface, revealing countless similar hourglasses stretching into darkness. Each contains something different—memories, opportunities, achievements—all draining away. The same figure from the beach reaches to flip one, but hesitates, fingers hovering as time continues its relentless flow. Muted blues and indigos dominate, with amber sand particles catching subtle golden light, creating ephemeral constellations before disappearing into the growing pile below.
```

This worked pretty well, at least enough for me to say, this is technically feasible.
The end to end flow below,

![](./lyric-video-generation-flow.png)

The generation aptly adapted to the mood the song, the colors and motion matched the theme of the song, on one instance when the lyric said "current in the ocean" the scene actually showed a current in the ocean with fishes in it etc. Surely, there was a lot of room for improvement but this gave me to confidence to say, we can tackle it.

## Looking ahead, what can be improved?

- The current set of videos although matched the mood and somewhat matched the lyrics, they weren't telling a story. So, first course of action would be to preare a storyboard for the song and scenes it it and make sure it collectively conveys a story.
- The cultural nuances, theme and other metadata of the song can be provided alongside the summary to produce a better meaningful video
- Include beats, tempo information of the song so that the video matches it
- Expressive words: animate specific words (“fall”, “rise”, “fade”) with matching motion presets
- Lyric-aware layout: break lines where the singer breathes to avoid widows/orphans

In the current, I already feel good about reusing the first and 
Also, researched some open source tools built for this purpose, that's when I found promising editors such as, [ComfyUI](https://github.com/comfyanonymous/ComfyUI) and [Gausian AI editor](https://github.com/gausian-AI/Gausian_native_editor) and passed on everything here to the team handling the next phase of the project. Excited to see what they are able to achieve.