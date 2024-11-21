type globalThrottleInterval =
	typeof import('../../../../../packages/durable-objects/src').globalThrottleInterval;
type counter =
	typeof import('../../../../../packages/durable-objects/src').counter;
type globalThrottleIntervalInput =
	import('../../../../../packages/durable-objects/src').input;
type statsCounter =
	typeof import('../../../../../packages/stats-counter/src').statsCounter;

export type {
	globalThrottleInterval,
	counter,
	globalThrottleIntervalInput,
	statsCounter
};
