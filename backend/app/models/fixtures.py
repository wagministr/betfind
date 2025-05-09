from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List, Dict, Any

class Team(BaseModel):
    """Team data model"""
    id: int
    name: str
    logo: Optional[str] = None
    
class League(BaseModel):
    """League data model"""
    id: int
    name: str
    country: Optional[str] = None
    logo: Optional[str] = None
    
class Venue(BaseModel):
    """Venue data model"""
    id: Optional[int] = None
    name: Optional[str] = None
    city: Optional[str] = None
    
class FixtureStatus(BaseModel):
    """Fixture status model"""
    long: str
    short: str
    elapsed: Optional[int] = None
    
class FixtureTime(BaseModel):
    """Fixture time model"""
    timestamp: int
    date: datetime
    timezone: Optional[str] = None

class Score(BaseModel):
    """Score data model"""
    home: Optional[int] = None
    away: Optional[int] = None
    
class Scores(BaseModel):
    """Scores for different periods"""
    halftime: Optional[Score] = None
    fulltime: Optional[Score] = None
    extratime: Optional[Score] = None
    penalty: Optional[Score] = None
    
class FixtureDetail(BaseModel):
    """API-Football fixture detail"""
    id: int
    referee: Optional[str] = None
    timezone: str
    date: datetime
    timestamp: int
    venue: Optional[Venue] = None
    status: FixtureStatus

class Fixture(BaseModel):
    """Complete fixture model from API-Football"""
    fixture: FixtureDetail
    league: League
    teams: Dict[str, Team]  # 'home' and 'away' keys
    goals: Optional[Score] = None
    score: Optional[Scores] = None
    
    @property
    def home_team(self) -> Team:
        return self.teams["home"]
        
    @property
    def away_team(self) -> Team:
        return self.teams["away"]
        
class FixtureDB(BaseModel):
    """Internal fixture model for database storage"""
    fixture_id: int = Field(..., primary_key=True)
    league_id: int
    home_id: int
    away_id: int
    home_name: str
    away_name: str
    league_name: str
    utc_kickoff: datetime
    status: str = "NS"  # Not Started by default
    score_home: Optional[int] = None
    score_away: Optional[int] = None
    venue: Optional[str] = None
    last_updated: datetime = Field(default_factory=datetime.utcnow)
    
class ValueBet(BaseModel):
    """Value bet model"""
    market: str
    odds: float
    confidence: float
    bookmaker: Optional[str] = None
    
class Prediction(BaseModel):
    """Prediction model"""
    fixture_id: int
    type: str = "pre-match"
    chain_of_thought: str
    final_prediction: str
    value_bets: List[ValueBet]
    model_version: str
    generated_at: datetime = Field(default_factory=datetime.utcnow)
    stale: bool = False 