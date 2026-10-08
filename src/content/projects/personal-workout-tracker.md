---
title: Personal Workout Tracker
summary: A workout planner where an AI trainer builds around your goals, history and the equipment you actually own.
tech: [TypeScript, Next.js, Claude API, Prisma, SQLite]
repo: https://github.com/Supaju/PersonalWorkoutTracker
order: 1
---
## Overview
Most plans assume a full gym and a clean injury history. This one starts from your goals, body type, injury history, limitations and the equipment you have access to, and uses an AI trainer to build a plan you can realistically follow.

## How the AI works
Claude designs each session using progressive overload from your training history, cycling through a 4-day upper/lower split. Before accepting a plan you can chat with the trainer to revise it. The training philosophy, nutrition targets and AI behavior live in one config file, and the split structure lives in templates, so the trainer's behavior can change without editing prompt strings.

## What else it does
- Logs sets, reps and weight during workouts
- Charts volume, weight and reps per exercise over time
- Generates daily meal plans with macro tracking
- Keeps a catalog of your equipment to drive exercise choices

## Status
In active development, and usable by me today. The source is public on GitHub.
