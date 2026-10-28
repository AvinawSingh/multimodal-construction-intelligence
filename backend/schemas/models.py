from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

# Health Schemas
class HealthResponse(BaseModel):
    status: str
    timestamp: str
    environment: str
    ai_configured: bool
    weather_provider: str
    version: str = "1.0.0"

# Safety Schemas
class HazardItem(BaseModel):
    hazard: str
    category: str = "General Safety"  # PPE, Scaffolding, Fall Hazard, Electrical, Housekeeping, Machinery, etc.
    severity: str = "Medium"  # Low, Medium, High, Critical
    location_in_image: Optional[str] = "Visible in frame"
    observation: str
    recommendation: str

class SafetyAnalysisResponse(BaseModel):
    overall_risk_level: str  # Low, Medium, High, Critical
    safety_score: int = Field(ge=0, le=100)  # 0 to 100
    ppe_compliance_rate: Optional[str] = "Estimated 75%"
    detected_hazards: List[HazardItem] = []
    positive_observations: List[str] = []
    immediate_corrective_actions: List[str] = []
    recommended_precautions: List[str] = []
    confidence_score: float = Field(ge=0.0, le=1.0, default=0.85)
    uncertainty_notes: Optional[str] = None
    is_demo_mode: bool = False
    model_used: str = "Rule-based/Llama-vision"
    disclaimer: str = (
        "Notice: Automated visual safety screening is an advisory aid and does not replace "
        "certified safety officer inspection, OSHA compliance verification, or daily site supervision."
    )

# Crack Schemas
class CrackAnalysisResponse(BaseModel):
    crack_classification: str
    apparent_severity: str  # Minor, Moderate, Severe, Critical
    estimated_width_mm: Optional[str] = "1 - 3 mm"
    visible_characteristics: List[str] = []
    possible_causes: List[str] = []
    potential_risks: List[str] = []
    recommended_next_steps: List[str] = []
    professional_inspection_required: bool = True
    confidence_score: float = Field(ge=0.0, le=1.0, default=0.8)
    is_demo_mode: bool = False
    model_used: str = "Rule-based/Llama-vision"
    disclaimer: str = (
        "IMPORTANT: This image analysis is for preliminary screening only and does NOT prove "
        "structural integrity or provide a definitive engineering diagnosis. An on-site inspection by a "
        "licensed structural engineer is strongly advised before taking remediation actions."
    )

# Project Planner Schemas
class ProjectPlannerRequest(BaseModel):
    plot_length_ft: float = Field(gt=0, description="Plot length in feet")
    plot_width_ft: float = Field(gt=0, description="Plot width in feet")
    built_up_area_sqft: Optional[float] = Field(default=None, description="Optional override for total built up area")
    location: str = "Standard Urban Area"
    construction_type: str = "Residential"  # Residential, Commercial, Industrial, Villa
    number_of_floors: int = Field(ge=1, le=50, default=2)
    quality_grade: str = "Standard"  # Standard, Premium, Luxury
    generate_render: bool = False

class PhaseItem(BaseModel):
    phase_number: int
    name: str
    duration_weeks: int
    key_tasks: List[str]
    critical_milestone: str

class CostBreakdown(BaseModel):
    civil_materials_inr: float
    labour_charges_inr: float
    finishing_flooring_inr: float
    mep_electrical_plumbing_inr: float
    permits_supervision_inr: float
    contingency_buffer_inr: float
    total_estimated_cost_inr: float
    cost_per_sqft_inr: float

class MaterialEstimates(BaseModel):
    cement_bags: int
    sand_tons: float
    aggregate_tons: float
    steel_tons: float
    bricks_or_blocks_count: int
    concrete_volume_m3: float

class ProjectPlannerResponse(BaseModel):
    total_built_up_area_sqft: float
    estimated_duration_months: float
    construction_type: str
    quality_grade: str
    materials: MaterialEstimates
    cost_breakdown: CostBreakdown
    schedule_phases: List[PhaseItem]
    key_risks_and_assumptions: List[str]
    visualization_url: Optional[str] = None
    methodology: str
    disclaimer: str = (
        "Disclaimer: These calculations are preliminary conceptual estimates based on empirical construction heuristics. "
        "They do not replace an engineering Bill of Quantities (BOQ), structural drawings, or contractor firm bids."
    )

# Real Estate Valuation Schemas
class ValuationRequest(BaseModel):
    location: str
    city: str
    property_area_sqft: float = Field(gt=0)
    property_type: str = "Apartment"  # Apartment, Independent House, Villa, Commercial Office, Retail Shop
    building_age_years: int = Field(ge=0, le=100, default=2)
    condition: str = "Good / Well Maintained"  # Under Construction, Brand New, Good, Needs Renovation
    amenities: List[str] = []
    parking_spaces: int = Field(ge=0, default=1)

class ValuationResponse(BaseModel):
    estimated_market_value_min_inr: float
    estimated_market_value_max_inr: float
    estimated_market_value_avg_inr: float
    price_per_sqft_inr: float
    indicative_monthly_rent_inr: float
    gross_rental_yield_percent: float
    roi_5yr_appreciation_percent: float
    valuation_drivers: List[str]
    market_assumptions: List[str]
    disclaimer: str = (
        "Disclaimer: This valuation is an indicative estimate derived from standard locality benchmarks, "
        "property age depreciation, and market multiplier algorithms. It is not an accredited real estate appraisal."
    )

# Knowledge Assistant Schemas
class KnowledgeRequest(BaseModel):
    category: str = "Safety"  # Safety, Technique, Documentation, All
    question: str

class KnowledgeResponse(BaseModel):
    category: str
    question: str
    answer: str
    key_points: List[str]
    precautions: List[str]
    applicable_standards: List[str]
    limitations: str
    is_demo_mode: bool = False

# Chatbot Schemas
class ChatMessage(BaseModel):
    role: str  # user, assistant, system
    content: str

class ChatRequest(BaseModel):
    message: str
    history: List[ChatMessage] = []

class ChatResponse(BaseModel):
    reply: str
    sources_or_references: List[str] = []
    is_demo_mode: bool = False

# Daily Site Assistant Schemas
class DailySiteRequest(BaseModel):
    planned_activity: str
    workforce_count: int = Field(ge=1, default=10)
    site_condition: str = "Normal Dry Ground"
    weather_context: Optional[str] = None
    notes: Optional[str] = None

class RiskMitigationItem(BaseModel):
    risk: str
    mitigation: str

class DailySiteResponse(BaseModel):
    planned_activity: str
    daily_task_breakdown: List[str]
    required_materials_and_equipment: List[str]
    site_safety_checklist: List[str]
    potential_risks_and_mitigation: List[RiskMitigationItem]
    productivity_recommendations: List[str]
    is_demo_mode: bool = False

# Weather Advisor Schemas
class WeatherAdvisorRequest(BaseModel):
    location: str
    planned_activity: str

class WeatherData(BaseModel):
    temperature_c: float
    apparent_temp_c: float
    precipitation_prob_percent: int
    precipitation_mm: float
    wind_speed_kmh: float
    wind_gusts_kmh: float
    relative_humidity_percent: int
    condition_text: str
    uv_index: Optional[float] = None

class WeatherAdvisorResponse(BaseModel):
    location: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    planned_activity: str
    advisory_status: str  # "GO", "CAUTION", "NO-GO"
    decision_summary: str
    weather: WeatherData
    activity_specific_risks: List[str]
    recommended_precautions: List[str]
    hourly_trend_notes: str
    data_source: str
    is_real_forecast: bool
