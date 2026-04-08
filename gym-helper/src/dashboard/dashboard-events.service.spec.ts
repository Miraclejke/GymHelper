import { firstValueFrom, take, timeout } from 'rxjs';
import { DashboardEventsService } from './dashboard-events.service';

describe('DashboardEventsService', () => {
  it('emits events only for the matching user', async () => {
    const service = new DashboardEventsService();
    const expectedPayload = {
      reason: 'rest_saved',
      message: 'Rest data was updated.',
    };

    const eventPromise = firstValueFrom(
      service.stream('user-1').pipe(take(1), timeout(1000)),
    );

    service.publish('user-2', {
      reason: 'ignored',
      message: 'This event belongs to another user.',
    });
    service.publish('user-1', expectedPayload);

    await expect(eventPromise).resolves.toEqual(expectedPayload);
  });
});
