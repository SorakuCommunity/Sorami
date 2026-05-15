import { Injectable } from '@nestjs/common';

export type Season = 'WINTER' | 'SPRING' | 'SUMMER' | 'FALL';

export interface SeasonData {
  season: Season;
  year: number;
  startDate: Date;
  endDate: Date;
}

@Injectable()
export class SeasonalEngine {
  getCurrentSeason(): { season: Season; year: number } {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();

    if (month >= 2 && month <= 4) return { season: 'SPRING', year };
    if (month >= 5 && month <= 7) return { season: 'SUMMER', year };
    if (month >= 8 && month <= 10) return { season: 'FALL', year };
    return { season: 'WINTER', year: month === 11 ? year : year - 1 };
  }

  getSeasons(year?: number): SeasonData[] {
    const y = year ?? new Date().getFullYear();
    return [
      {
        season: 'WINTER',
        year: y,
        startDate: new Date(y, 0, 1),
        endDate: new Date(y, 2, 31),
      },
      {
        season: 'SPRING',
        year: y,
        startDate: new Date(y, 3, 1),
        endDate: new Date(y, 5, 30),
      },
      {
        season: 'SUMMER',
        year: y,
        startDate: new Date(y, 6, 1),
        endDate: new Date(y, 8, 30),
      },
      {
        season: 'FALL',
        year: y,
        startDate: new Date(y, 9, 1),
        endDate: new Date(y, 11, 31),
      },
    ];
  }

  getPreviousSeason(): SeasonData {
    const current = this.getCurrentSeason();
    const seasonOrder: Season[] = ['WINTER', 'SPRING', 'SUMMER', 'FALL'];
    const idx = seasonOrder.indexOf(current.season);

    if (idx === 0) {
      return {
        season: 'FALL',
        year: current.year - 1,
        startDate: new Date(current.year - 1, 9, 1),
        endDate: new Date(current.year - 1, 11, 31),
      };
    }

    const prevSeason = seasonOrder[idx - 1];
    const monthStart = (idx - 1) * 3;
    return {
      season: prevSeason,
      year: current.year,
      startDate: new Date(current.year, monthStart, 1),
      endDate: new Date(current.year, monthStart + 2, 30),
    };
  }

  getNextSeason(): SeasonData {
    const current = this.getCurrentSeason();
    const seasonOrder: Season[] = ['WINTER', 'SPRING', 'SUMMER', 'FALL'];
    const idx = seasonOrder.indexOf(current.season);

    if (idx === 3) {
      return {
        season: 'WINTER',
        year: current.year + 1,
        startDate: new Date(current.year + 1, 0, 1),
        endDate: new Date(current.year + 1, 2, 31),
      };
    }

    const nextSeason = seasonOrder[idx + 1];
    const monthStart = (idx + 1) * 3;
    return {
      season: nextSeason,
      year: current.year,
      startDate: new Date(current.year, monthStart, 1),
      endDate: new Date(current.year, monthStart + 2, 30),
    };
  }
}
