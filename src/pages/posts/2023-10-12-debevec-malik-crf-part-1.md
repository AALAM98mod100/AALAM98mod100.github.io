---
layout: ../../layouts/MarkdownPostLayout.astro
title: "A deep dive into recovering the camera response function using Paul Debevec's method"
description: "Understanding the method for recovering camera response functions in computational photography"
pubDate: 2023-10-12
topics: ["engineering"]
image: "/assets/img/crf.png"
tags: [article, computational-photography, software, hdr, hdri, crf, multi-part, series]
private: true
---

## AVSI*
HDRI, or high-dynamic-range imaging, is a well-known but still, a budding area that brings many different fields such as computer vision, computer graphics, display electronics, and optics together. My personal favorite is the part where we __capture__ an HDR i.e. the **I** in HDRI. 

HDRI is a set of techniques used to capture images that more closely mimic the scene's dynamic range. The dynamic range of a scene is the ratio of the brightest to the darkest pixel in the image. The dynamic part comes from the fact that the ratio is not fixed and depends on the scene. More on that will come in another post hopefully. For now, I'll assume the reader knows about the standard image processing pipeline, gamma function, non-linearity of the human vision system, and the like.

## The problem
The problem of capturing an HDR image is a classic example of going beyond what your hardware and provide and augmenting it using the power of computer. We all have heard about the implementation I'm going to talk about in smartphones in the past decade. The general idea is that the phone/user/camera captures multiple images of a scene at different exposures and somehow combines them to form a single image that has a higher dynamic range than any of the individual images.

This implementation is called the Debevec-Malik method and has formed the basis of much research done in this area of Computer Vision.

<!-- Assume that the reader has read the paper and we proceed to explain the equations from the starting point -->
<!-- Stop at the part where were have recovered the CRF -->

#### Terms
- **HDR**: High-dynamic-range
- **HDRI**: High-dynamic-range imaging
- **CRF**: Camera response function
- **AVSI**: A very short introduction 