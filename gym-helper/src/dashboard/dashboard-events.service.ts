import { Injectable } from '@nestjs/common';
import { filter, map, Observable, Subject } from 'rxjs';
import { DashboardEventResponse } from '../common/api.types';

type DashboardEvent = {
  userId: string;
  payload: DashboardEventResponse;
};

@Injectable()
export class DashboardEventsService {
  private readonly updates$ = new Subject<DashboardEvent>();

  publish(userId: string, payload: DashboardEventResponse) {
    this.updates$.next({ userId, payload });
  }

  stream(userId: string): Observable<DashboardEventResponse> {
    return this.updates$.asObservable().pipe(
      filter((event) => event.userId === userId),
      map((event) => event.payload),
    );
  }
}
