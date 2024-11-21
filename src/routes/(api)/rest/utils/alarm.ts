import type { apiEnv } from '../[...paths]/+server';
import { DO_GEN } from './kv';
import type { Scheduler } from '../../../../../../../packages/https-cron-job/src/index';
import type { BookStatsScheduler } from '../../../../../../../packages/book-stats-scheduler/src/index';
export function getAlarmScheduleFnStub({
	name_arg,
	requestHandler
}: {
	name_arg: Parameters<typeof DO_GEN.HTTP_SCHEDULE_TASK>['0'];
	requestHandler: apiEnv['Variables']['requestHandler'];
}): DurableObjectStub<Scheduler> {
	const id = requestHandler.platform.env.do_httpsAlarmScheduler.idFromName(
		DO_GEN.HTTP_SCHEDULE_TASK(name_arg)
	);
	const stub: DurableObjectStub<Scheduler> =
		requestHandler.platform.env.do_httpsAlarmScheduler.get(id);
	if (!stub) {
		return {
			scheduledPublish: (args) => console.log('faking alarm ', args)
		};
	}
	return stub;
}
export function getBookAlarmScheduleFnStub({
	name_arg,
	requestHandler
}: {
	name_arg: Parameters<typeof DO_GEN.BOOK_HTTP_SCHEDULE_TASK>['0'];
	requestHandler: {
		platform: apiEnv['Variables']['requestHandler']['platform'];
	};
}): DurableObjectStub<BookStatsScheduler> {
	const id = requestHandler.platform.env.do_BookAlarm.idFromName(
		DO_GEN.BOOK_HTTP_SCHEDULE_TASK(name_arg)
	);
	console.log('getting book do id', id);
	const stub: DurableObjectStub<BookStatsScheduler> =
		requestHandler.platform.env.do_BookAlarm.get(id);
	console.log('getting book stub', stub);
	return stub;
}
