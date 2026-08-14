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

Recently a colleague mentioned the number of bugs reported by our users. They had grown quite a bit in the last year. I asked how much our user base had grown in the same year.

We often decide bad metrics to track: the _number_ of bugs, the AWS bill, test coverage. If you notice a pattern, here's a brownie point. I have found it shocking that so many engineers fail to understand basic statistical patterns and themes and fall prey to the narratives as a result. It is important to realize that numbers can tell different stories. One can manipulate them at will. And numbers can deceive too, for it's easy to fall into the trap of shaping numbers to one's will and not to picture the truth. Executives are quite guilty of that. But engineers can make the same mistakes. 

In the next few paragraphs, I will catalogue some examples of statistical fallacies that will help in understanding the numbers. For that is all that statistics is. And no, I'm not asking everyone to be able to compute z-values and Poisson distributions. Some basic understanding will suffice in most cases.

As a software engineer, you will come across many metrics. It is important to be able to reason about the efficacy of those metrics. If you're a manager, your metrics should mirror the goals for the team. If you're an IC, you should be able understand if the metrics make sense and be able to push back. Because, discussions on your performance will base off of those very metrics.

#### Survivorship Bias
You will have seen this image [ADD IMAGE] often on the internet. It is the most famous example quoted when explaining "survivorship bias". The story goes that British WW2 engineers noticed that most of their warplanes would come home damaged in several common areas. So they decided to increase the strength of materials at those points. It did nothing. Someone pointed out that the planes that came back meant they could survive hits in those areas and make it home. The ones that were hit in other places, did not come back. So they redirected efforts in armoring the points that actually needed the strength.

A software engineering analogue of survivorship bias is when people fixate on what their systems report. The important thing to realize about observability is that it needs to be comprehensive. Let's say there are ten out of a thousand users experiencing slowness. On the surface that may seem like only one percent of users are unsatisfied. But it turns out that for others, the system had been slower so much that they had been unable to get to the reporting screen at all. We take home the narrative that a few users experienced slowness, no big deal. But out there, hundreds were unhappy about the software and failed to report at all. The statistical mind here should also take into account the data that is _not_ there to help derive conclusions.
 
#### Self-Fulfilling Prophecy
I had recently learned about Clean Architecture. This was a time when our codebase was peak startup. It was slop before AI colonized the term. It was hard to test, debug, or trace the paths. Clean architecture signalled a promise, that it would fix all our problems and make the code easy to read, change, and test. We had advocated to use this approach in an upcoming feature. As is generally the case, the payoff in Clean Code is not in writing it, but modifying it or testing it. We took some time with setting up the project having no experience of this before. In a couple of months, we were able to, for the first time, deliver a feature that had above 70 percent test coverage. For context, our codebase overall was barely at 10 percent then. So overall, it was a pretty big deal that a well-tested (relatively) feature was being released. And then came _a_ bug report. We were able to patch and add a regression test. Then several more bug reports came in. My manager was not too amused. He mentioned clean architecture taking time AND producing buggy code was a letdown in terms of this experiment. I had one thing to ask: do you know how many reports there would _have been_ if we had taken the alternate route?

The funny thing about self-fulfilling prophecies is that you're left with no defense unless you know this exact fallacy. Governments across the world were criticized for their handling of COVID because millions of people succumbed to the disease. Yet nobody questioned the alternative. It would have been worse had the extreme measures _not_ been taken.

#### Normalization
The "bad" metrics mentioned at the start of this text have one thing in common. They eac consist of a single _number_. The problem with _a_ number is that there's no dynamism, its static. You're hopeless in the face of it. No sir, a single number will not do the trick. A simple move here is to find a good denominator that will give some context. Let's put this idea into play.

Consider the scenario where the AWS bill rose by 20 percent in a quarter. It points to a decrease in efficiency of the software. Engineers will be asked to write better code. Programming paradigms in the company might shift. But, what if in the same quarter, the number of users rose by 30 percent. Suddenly, the picture changes. The resources were actually more efficient in their usage. To come to this conclusion, we simply tweaked our metric and added a denominator $n_users$. This denominator adds context to our original metric. Now instead of tracking the AWS bill, we track the $ per user as a metric.

Another example to drive this home. A company decides to set the number of bugs as a quality goal. At the same time it's gaining more users by the day and pushing more features. Assuming nothing changes in code quality, the number of bugs will go up naturally because of the added features and more users reporting issues. But if we tweak the metric oh so slightly, we add a denominator called Lines of Code, our new metric becomes bugs/LoC. This metric is now scale agnostic and will reinforce the idea that newer code has to be of higher quality than existing code for the metric to be met. The denominator _is_ the context and we can tweak it to our liking. If we, let's say, change it to $n_users$, we get bugs/user as a metric. This metric now expresses how often a user encounters a bug and may help in tracking one or more of the following: the number of users facing issues (on an average), or quality of reporting system that users _were able to_ report issues. You see how the numbers can weave different narratives based on the normalization axis? This is an important one to understand.

#### Conclusion
I experienced some of the examples first-hand. But its found everywhere even outside of career. Part of the skill is in being aware and part of awareness comes from being able to analyze the information, especially numbers, flying at us. 