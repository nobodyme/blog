---
title: AI Lyrical Video Generation
date: "2025-11-21T10:05:00.000Z"
---

One evening, I was told we had a client who wanted automatic lyrical video generation for a given song. It was required to confirm its technical feasibility in **two days**. The input being the song itself in, say, MP3 or WAV and the lyrics as a .txt file. The goal was to produce a lyrical video with lyrics in the foreground and video in the background. There was one additional constraint: use only services/models in AWS or that can be hosted on AWS, since this was going to be an AWS-funded project.

Given the time constraint and the goal of just ensuring feasibility, I decided to get the end-to-end flow working before thinking about improving the quality of the output.

First things first, I broke this down into subproblems:
- How to generate the lyric video?
- How to sync/align the lyrics to the song?
- Once the video is generated, how do we overlay/merge the lyrics and audio in the video?

## How to generate the lyric video?

I found a couple of models in AWS that were readily available and capable of generating videos from a text prompt, Nova Reels, and Luma AI. Given the time constraints, instead of breaking my head over which was better, I tested Luma AI first. It was able to follow instructions, but it had its limitations—for example, it could only generate 3 or 9 second clips. So, for generating a video for an entire song, one would have to split it up into scenes and provide the model with instructions.

But how do we maintain scene cohesion?
How can one ensure adjacent scenes don't feel like two unrelated videos stitched together?

Luckily, the model also allowed you to specify the start or end image of the generated video. I took advantage of this and made sure the adjacent scene always used the last image from the previous scene as the starting point.

At this point, I manually prompted and generated a couple of scenes and saw that the model was able to produce cohesive outputs, then moved on to the next puzzle.

## How to sync/align the lyrics to the song?

So, I already had the song and the lyrics, which meant I didn’t necessarily need to transcribe anything. Even transcribing speech isn't 100% perfect, so one can't expect that for a song with all the "oohs" and "aahs". A quick Google search showed what I needed was technically called forced alignment i.e. given the lyrics, match the lyric to the audio and get timestamps for (each line of) the lyrics and ultimately produce a subtitle file that can be easily merged with the video.

For this, explored various tools, such as:
- Aeneas - (I couldn't get working on my Mac)
- Whisper X – promised word-level accuracy, but it transcribes by default and requires some additional work to only do forced alignment
- [Torchaudio forced-alignment](https://docs.pytorch.org/audio/stable/tutorials/ctc_forced_alignment_api_tutorial.html) - This produced outputs that was the closest so far, with about 60% accuracy (just a rough eyeball estimate)

As you can see, none of these methods yielded good-enough results. Before entirely discarding them, I tried isolating the vocals from the song, hoping for better alignment using the following tools:
- Vocal separation with HPSS technique - The results were not good enough and didn’t properly separate out the vocals
- [Demucs](https://pypi.org/project/demucs/) worked best - This produced near-perfect isolation

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

So, I was able to obtain pretty accurate results by first isolating the vocals using Demucs followed by forced alignment using torchaudio.

## How to overlay/merge the lyrics along with audio in the video?

FFmpeg was the easiest option to combine video and audio and add lyrics as subtitles.
But lyric videos usually have lyrics overlaid on top of the video, not just as a subtitle, and I wanted a way to programmatically style the lyrics depending on the mood of the song. That's when **Remotion** came into the picture, you can use Remotion to style lyrics using just CSS, and it seemed like a perfect fit.
For now, I looped the couple of scenes generated in the first step to fill the entire audio length, combined them with the SRT file I had previously produced, and merged everything with Remotion. The results were pretty promising, and by this time I had already exhausted a day.

## Generating the full-length video

Now that we had a flow in place, I went back to generating a full-length video. My first idea was to split up the lyrics into 9-second chunks and feed them into Claude to have it produce prompts that could depict the meaning of the lyrics on screen, which could then be fed into the video-gen model.

One thing this would lack is the overarching meaning of the song, since Claude would only see isolated portions of the lyrics. So, in addition to the lyrics, I first generated a summary of the song, then passed both the lyrics and the summary so the model had more context.

For generating consecutive scenes, I also passed in the prompt produced by Claude for the previous scene so it could cohesively continue the story with the overall theme of the song (remember we also pass the last frame of the previous scene to Luma AI to maintain scene cohesion). Sample scene-by-scene video-gen prompts for a song below:

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

This worked pretty well, at least enough for me to say this is technically feasible.
The end-to-end flow below,

![](./lyric-video-generation-flow.png)

The generation adapted well to the mood of the song: the colors and motion matched the theme, quoting one instance, when the lyric said "current in the ocean" the scene actually showed a current in the ocean with fish swimming in it. Surely, there was a lot of room for improvement, but the overall result gave me the confidence to say we can tackle it.

## Looking ahead, what can be improved?

Moving into the next phase, I would happily reuse the lyric-alignment portion of this feasibility test, look for more performant alternatives to Remotion that provide the same flexibility, and spend the bulk of my time on video generation—learning storytelling, crafting prompts, and fine-tuning that workflow. A few things that particularly can be improved:

- The current set of generated videos, although they match the mood and the lyrics to an extent, weren't really telling a story. So, the first course of action would be to prepare a storyboard for the song and scenes and make sure it collectively conveys a coherent narrative and provide flexibility to the users to refine individual scenes.
- Even integrate [Wan2.2 Animate](https://humanaigc.github.io/wan-animate/) for the end users to enact as a chosen character for a particular scene, if they desire so
- The cultural nuances, theme, and other metadata of the song can be provided alongside the summary to produce a more meaningful video
- Include beat and tempo information from the song so that the video matches it better
- Expressive words: animate specific words (“fall”, “rise”, “fade”) with matching motion presets
- Lyric-aware layout: break lines where the singer breathes to avoid widows/orphans

Also, researched some open source tools built for this purpose; that's when I found promising editors such as, [ComfyUI](https://github.com/comfyanonymous/ComfyUI) and [Gausian AI editor](https://github.com/gausian-AI/Gausian_native_editor) (also keeping an eye on this [AI movie hacakthon results](https://chromaawards.devpost.com/project-gallery) to see what we can learn from the participants), passed all of this on to the team handling the next phase of the project. I'm excited to see what they are able to achieve.