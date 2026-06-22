# Tradeoffs

## Live GPS Tracking

Not implemented because it requires device location permissions, streaming infrastructure, and privacy controls. For the prototype, static route coordinates are enough to demonstrate matching quality.

## Real-Time Chat

Not implemented because booking state and contact coordination can be handled later. Chat would add WebSocket infrastructure and moderation concerns without improving the core recommendation score.

## Dynamic Pricing

Not implemented because the assignment focuses on commute discovery and shared mobility. Pricing introduces policy, fairness, and payment complexity that would distract from matching and booking.

## Machine-Learning Recommendations

Not implemented because there is no historical dataset yet. The rule-based engine is more transparent for a prototype and easier to explain during evaluation.
