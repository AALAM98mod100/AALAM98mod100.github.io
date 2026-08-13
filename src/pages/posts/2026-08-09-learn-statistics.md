---
layout: ../../layouts/MarkdownPostLayout.astro
title: "Everyone should learn statistics"
description: "Your whole life is governed by the understanding, or misunderstanding of statistics"
pubDate: 2025-09-29
tags: ["statistics", "learning"]
topics: ["engineering"]
private: true
---
## AI disclaimer (snippet of text that is copied in all new posts)
###Theme -- what do I believe?
Recently a colleague mentioned the number of bugs reported by our users. They had grown quite a bit in the last year. I asked how much our userbase had grown in the same year.

We often decide bad metrics to track: the _number_ of bugs, the AWS bill, test coverage. If you notice a pattern, here's a brownie point. I have found it shocking that so many engineers fail to understand basic statistical patterns and themes and fall prey to the narratives as a result. It is important to realize that numbers can tell different stories. One can manipulate them at will. And numbers can decieve too, for its easy to fall into the trap of shaping numbers to one's will and not to picture the truth. Executives are quite guilty of that. But engineers can make the same mistakes. 

In the next few paragraphs, I will catalogue some examples into statistical fallacies in order to help understand the double-edged sword that is contextualized numbers. For that is all that statistics is. And no, I'm not asking everyone to be able to compute z-values and Poisson distributions on the fly. Just a basic understand will suffice in most cases.

###Why do I believe this? Talk about statistics being all around us

Some concrete examples
###    Survivorship bias
You will have come across this image [ADD IMAGE] often on the internet. It is perhaps the most famous example quoted when explaining "survivorship bias". The story goes that British WW2 engineers noticed that most of their warplanes would come home damanged in several common areas. So they decided to increase the strength of materials at those points. It did nothing. Someone pointed out that the planes that came back meant they could survive hits precisely in those areas and make it home. The ones that were hit in other places, did not come back. So they wasted efforts in armoring up their fighters precisely in the complement of points that actually needed the strength. And so the legend goes.

A software engineering analogue of survivorship bias is when people fixate on what their systems report. The important thing to realize about observability is that it needs to be comprehensive. Let's say there are ten out of a thousand users experiencing slowness. On the surface that may seem like only one percent of users are unsatisfied. But it turns out that for others, the system had been slower so much that they had been unable to get to the reporting screen at all. We take home the narrative that a few users experienced slowness, no big deal. But out there, hundreds were unhappy about the software and failed to report at all. The statistical mind here should also take into account the data that is _not_ there to help derive conclusions. This is precisely what drove a conversation with my manager once.
    
###    Self-fulfilling prophecy
        Writing good code but got one bug
I had recently learned about Clean Architecture. This was a time when our codebase was peak startup. It was slop before AI colonized the term. It was hard to test, debug, or trace the paths. Clean architecture signalled a promise, that it would fix all our problems and make the code easy to read and modify and most importantly test. We had advocated to use this approach in an upcoming feature. As is generally the case, the payoff in Clean Code is not in writing it, but modifying it or testing it. We took some time with the project, making sure all data paths were as they should be. We were able to, for the first time, deliver a feature that had above 70 percent test coverage. For context, our codebase overall was barely at 10 percent then. So overall, it was a pretty big deal that a well-tested (relatively) feature was being released.

And then came _a_ bug report. We were able to patch and add a regression test. Then several more bug reports came in. My manager was not too amused. He mentioned clean architecture taking time AND producing buggy code was a letdown in terms of this experiment. I had one thing to ask: do you know how many reports there would _have been_ if we had taken the alternate route?

The funny thing about self-fulfilling prophecies is that you're left with no defense unless you know this exact statistical fallacy. Governments across the world were criticized for their handling of COVID becasue millions of people succumbed to the disease. Yet nobody questioned the alternative. It would probably have been worse had the same measures not been taken.

A better way to understand this fallacy is in terms of its best case scenario: If we all do X, Y won't happen. People do X, Y does not happen. People say Y was never a problem and efforts in X were wasted energies. Replace X and Y with preventative measures and the thing being prevented and you'll see it everywhere around you. Speaking of code coverages...
    Weighted average
        Test coverage
    Normalization
    The metrics mentioned here each consist of a single _number_. The problem with this number is that there's no dynamism, its static. You're hopeless in the face of it. No sir, a single number will not do the trick. 

Just a few examples from my workplace, a basic understanding has enabled me to reply in these situations. But its found practically everywhere even outside of career. Hence, please learn

A way to start, with some basic topics outlined
    Sampling
    Distributions
    Correlation and Regression
    Improving s2n