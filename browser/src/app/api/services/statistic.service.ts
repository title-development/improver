import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Statistic } from '../models/Statistic';

@Injectable()
export class StatisticService {
  private readonly API_URL: string = 'api/statistics';

  constructor(private http: HttpClient) {

  }

  usersInSystem(): Observable<Array<Statistic>> {

    return this.http.get<Array<Statistic>>(`${this.API_URL}/users`);
  }

  usersRegistration(period: Statistic.Period = Statistic.Period.HALF_YEAR): Observable<Array<Statistic>> {
    const params = new HttpParams()
      .append('period', period);

    return this.http.get<Array<Statistic>>(`${this.API_URL}/users/registration`, {params});
  }

  moneyStatistic(period: Statistic.Period = Statistic.Period.HALF_YEAR): Observable<Array<Statistic>> {
    const params = new HttpParams()
      .append('period', period);

    return this.http.get<Array<Statistic>>(`${this.API_URL}/credits`, {params});
  }

  financesStatistic(period: Statistic.Period = Statistic.Period.HALF_YEAR): Observable<Array<Statistic>> {
    const params = new HttpParams()
      .append('period', period);

    return this.http.get<Array<Statistic>>(`${this.API_URL}/finances`, {params});
  }

  ticketsStatistic(period: Statistic.Period = Statistic.Period.HALF_YEAR): Observable<Array<Statistic>> {
    const params = new HttpParams()
      .append('period', period);

    return this.http.get<Array<Statistic>>(`${this.API_URL}/tickets`, {params});
  }

  leadsStatistics(period: Statistic.Period = Statistic.Period.HALF_YEAR): Observable<Array<Statistic>> {
    const params = new HttpParams()
      .append('period', period);

    return this.http.get<Array<Statistic>>(`${this.API_URL}/leads`, {params});
  }

  topServices(period: Statistic.Period = Statistic.Period.HALF_YEAR): Observable<Array<Statistic>> {
    const params = new HttpParams()
      .append('period', period);

    return this.http.get<Array<Statistic>>(`${this.API_URL}/top/services`, {params});
  }

  topServicesByProjectSold(period: Statistic.Period = Statistic.Period.HALF_YEAR): Observable<Array<Statistic>> {
    const params = new HttpParams()
      .append('period', period);

    return this.http.get<Array<Statistic>>(`${this.API_URL}/top/services/project-sold`, {params});
  }

  contractorRatingStatistic(period: Statistic.Period = Statistic.Period.HALF_YEAR): Observable<Array<Statistic>> {
    const params = new HttpParams()
      .append('period', period);

    return this.http.get<Array<Statistic>>(`${this.API_URL}/top/contractors/rating`, {params});
  }

  contractorProfitStatistic(period: Statistic.Period = Statistic.Period.HALF_YEAR): Observable<Array<Statistic>> {
    const params = new HttpParams()
      .append('period', period);

    return this.http.get<Array<Statistic>>(`${this.API_URL}/top/contractors/profit`, {params});
  }


}
