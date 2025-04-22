/**
 * API client for API-Football (api-sports.io)
 * Documentation: https://www.api-football.com/documentation-v3
 */

type ApiFootballResponse<T> = {
  get: string;
  parameters: Record<string, string>;
  errors: Record<string, string>;
  results: number;
  paging: {
    current: number;
    total: number;
  };
  response: T;
};

export type Fixture = {
  fixture: {
    id: number;
    referee: string | null;
    timezone: string;
    date: string;
    timestamp: number;
    status: {
      long: string;
      short: string;
      elapsed: number | null;
    };
  };
  league: {
    id: number;
    name: string;
    country: string;
    logo: string;
    flag: string;
    season: number;
    round: string;
  };
  teams: {
    home: {
      id: number;
      name: string;
      logo: string;
      winner: boolean | null;
    };
    away: {
      id: number;
      name: string;
      logo: string;
      winner: boolean | null;
    };
  };
  goals: {
    home: number | null;
    away: number | null;
  };
  score: {
    halftime: {
      home: number | null;
      away: number | null;
    };
    fulltime: {
      home: number | null;
      away: number | null;
    };
    extratime: {
      home: number | null;
      away: number | null;
    };
    penalty: {
      home: number | null;
      away: number | null;
    };
  };
};

export type OddsResponse = {
  league: {
    id: number;
    name: string;
    country: string;
    logo: string;
    flag: string;
    season: number;
  };
  fixture: {
    id: number;
    timezone: string;
    date: string;
    timestamp: number;
  };
  bookmakers: {
    id: number;
    name: string;
    bets: {
      id: number;
      name: string;
      values: {
        value: string;
        odd: string;
      }[];
    }[];
  }[];
};

export type PredictionResponse = {
  predictions: {
    winner: {
      id: number | null;
      name: string | null;
      comment: string | null;
    };
    win_or_draw: boolean | null;
    under_over: string | null;
    goals: {
      home: string | null;
      away: string | null;
    };
    advice: string | null;
    percent: {
      home: string;
      draw: string;
      away: string;
    };
  };
  league: {
    id: number;
    name: string;
    country: string;
    logo: string;
    flag: string;
    season: number;
  };
  teams: {
    home: {
      id: number;
      name: string;
      logo: string;
      last_5: {
        form: string;
        att: string;
        def: string;
        goals: {
          for: {
            total: number;
            average: string;
          };
          against: {
            total: number;
            average: string;
          };
        };
      };
      league: {
        form: string;
        fixtures: {
          played: {
            home: number;
            away: number;
            total: number;
          };
          wins: {
            home: number;
            away: number;
            total: number;
          };
          draws: {
            home: number;
            away: number;
            total: number;
          };
          loses: {
            home: number;
            away: number;
            total: number;
          };
        };
        goals: {
          for: {
            total: {
              home: number;
              away: number;
              total: number;
            };
            average: {
              home: string;
              away: string;
              total: string;
            };
          };
          against: {
            total: {
              home: number;
              away: number;
              total: number;
            };
            average: {
              home: string;
              away: string;
              total: string;
            };
          };
        };
      };
    };
    away: {
      id: number;
      name: string;
      logo: string;
      last_5: {
        form: string;
        att: string;
        def: string;
        goals: {
          for: {
            total: number;
            average: string;
          };
          against: {
            total: number;
            average: string;
          };
        };
      };
      league: {
        form: string;
        fixtures: {
          played: {
            home: number;
            away: number;
            total: number;
          };
          wins: {
            home: number;
            away: number;
            total: number;
          };
          draws: {
            home: number;
            away: number;
            total: number;
          };
          loses: {
            home: number;
            away: number;
            total: number;
          };
        };
        goals: {
          for: {
            total: {
              home: number;
              away: number;
              total: number;
            };
            average: {
              home: string;
              away: string;
              total: string;
            };
          };
          against: {
            total: {
              home: number;
              away: number;
              total: number;
            };
            average: {
              home: string;
              away: string;
              total: string;
            };
          };
        };
      };
    };
  };
  comparison: {
    form: {
      home: string;
      away: string;
    };
    att: {
      home: string;
      away: string;
    };
    def: {
      home: string;
      away: string;
    };
    poisson_distribution: {
      home: string;
      away: string;
    };
    h2h: {
      home: string;
      away: string;
    };
    goals: {
      home: string;
      away: string;
    };
    total: {
      home: string;
      away: string;
    };
  };
  h2h: Fixture[];
};

/**
 * Send a GET request to the API-Football service
 * @param endpoint API endpoint (without base URL)
 * @param params Query parameters
 * @returns API response data
 */
export async function apiFootballGet<T>(
  endpoint: string,
  params?: Record<string, string>
): Promise<T> {
  const API_KEY = 'fb3ebae08530ce50babdb2f4ea36adea';
  const BASE_URL = 'https://v3.football.api-sports.io';
  
  // Build URL with query parameters
  const url = new URL(`${BASE_URL}/${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }

  try {
    // Add timeout using AbortController
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'x-apisports-key': API_KEY,
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`API returned ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json() as ApiFootballResponse<T>;
    
    // Check for API-specific errors
    if (Object.keys(data.errors).length > 0) {
      const errorMessage = Object.values(data.errors).join(', ');
      throw new Error(`API Error: ${errorMessage}`);
    }
    
    return data.response;
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    throw error;
  }
}

/**
 * Get upcoming fixtures for specified leagues
 * @param leagueIds Array of league IDs to fetch fixtures for
 * @param daysAhead Number of days ahead to fetch fixtures for (default: 2)
 * @returns Array of fixtures
 */
export async function getUpcomingFixtures(
  leagueIds: number[],
  daysAhead: number = 2
): Promise<Fixture[]> {
  // Calculate date range
  const today = new Date();
  const endDate = new Date();
  endDate.setDate(today.getDate() + daysAhead);
  
  // Format dates as YYYY-MM-DD
  const fromDate = today.toISOString().split('T')[0];
  const toDate = endDate.toISOString().split('T')[0];
  
  // Get current season (most leagues use the year when the season starts)
  const currentYear = today.getFullYear();
  const season = today.getMonth() > 6 ? currentYear : currentYear - 1;
  
  // Make a separate request for each league to avoid API limitations
  const allFixtures: Fixture[] = [];
  
  for (const leagueId of leagueIds) {
    try {
      const fixtures = await apiFootballGet<Fixture[]>('fixtures', {
        league: leagueId.toString(),
        season: season.toString(),
        from: fromDate,
        to: toDate,
        timezone: 'Europe/London', // Can be made configurable
      });
      
      allFixtures.push(...fixtures);
    } catch (error) {
      console.error(`Error fetching fixtures for league ${leagueId}:`, error);
      // Continue with other leagues instead of failing completely
    }
  }
  
  return allFixtures;
}

/**
 * Get currently live fixtures
 * @returns Array of live fixtures
 */
export async function getLiveFixtures(): Promise<Fixture[]> {
  return await apiFootballGet<Fixture[]>('fixtures', {
    live: 'all',
  });
}

/**
 * Get odds for a specific fixture
 * @param fixtureId Fixture ID
 * @returns Odds for the fixture
 */
export async function getOddsForFixture(fixtureId: number): Promise<OddsResponse[]> {
  return await apiFootballGet<OddsResponse[]>('odds', {
    fixture: fixtureId.toString(),
  });
}

/**
 * Get predictions for a specific fixture
 * @param fixtureId Fixture ID
 * @returns Prediction for the fixture
 */
export async function getPredictionsForFixture(fixtureId: number): Promise<PredictionResponse[]> {
  return await apiFootballGet<PredictionResponse[]>('predictions', {
    fixture: fixtureId.toString(),
  });
} 