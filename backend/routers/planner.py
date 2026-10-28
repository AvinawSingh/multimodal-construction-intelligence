from fastapi import APIRouter
from schemas.models import (
    ProjectPlannerRequest, ProjectPlannerResponse,
    MaterialEstimates, CostBreakdown, PhaseItem
)
from services.image_gen_service import image_gen_service

router = APIRouter(prefix="/planner", tags=["Project Planner"])

# Location base price multipliers
CITY_MULTIPLIERS = {
    "mumbai": 1.25,
    "delhi": 1.18,
    "gurgaon": 1.18,
    "noida": 1.12,
    "bengaluru": 1.15,
    "bangalore": 1.15,
    "hyderabad": 1.10,
    "pune": 1.12,
    "chennai": 1.10,
    "kolkata": 1.05,
    "ahmedabad": 1.05
}

BASE_RATES_PER_SQFT = {
    "standard": 1850.0,
    "premium": 2450.0,
    "luxury": 3350.0
}

TYPE_MULTIPLIERS = {
    "residential": 1.0,
    "villa": 1.20,
    "commercial": 1.15,
    "industrial": 0.90
}

@router.post("/calculate", response_model=ProjectPlannerResponse)
def calculate_project_plan(request: ProjectPlannerRequest):
    # Determine built-up area
    plot_area = request.plot_length_ft * request.plot_width_ft
    if request.built_up_area_sqft and request.built_up_area_sqft > 0:
        total_built_up_sqft = float(request.built_up_area_sqft)
    else:
        # Standard footprint coverage: 70% of ground area per floor
        footprint_sqft = plot_area * 0.70
        total_built_up_sqft = round(footprint_sqft * request.number_of_floors, 2)

    # Base rate calculation
    grade_key = request.quality_grade.lower()
    base_rate = BASE_RATES_PER_SQFT.get(grade_key, 1850.0)

    type_key = request.construction_type.lower()
    type_mult = TYPE_MULTIPLIERS.get(type_key, 1.0)

    loc_key = request.location.lower().strip()
    loc_mult = 1.0
    for city, mult in CITY_MULTIPLIERS.items():
        if city in loc_key:
            loc_mult = mult
            break

    rate_per_sqft = round(base_rate * type_mult * loc_mult, 2)
    total_cost = round(total_built_up_sqft * rate_per_sqft, 2)

    # Material quantities estimation (Civil Engineering heuristics)
    cement_bags = int(round(total_built_up_sqft * 0.42))
    sand_tons = round(total_built_up_sqft * 0.082, 2)
    aggregate_tons = round(total_built_up_sqft * 0.105, 2)
    steel_tons = round(total_built_up_sqft * 0.0041, 3)  # ~4.1 kg per sq.ft
    bricks_count = int(round(total_built_up_sqft * 9.5))
    concrete_m3 = round(total_built_up_sqft * 0.038, 2)

    # Cost breakdown
    civil_materials = round(total_cost * 0.48, 2)
    labour_charges = round(total_cost * 0.24, 2)
    finishing_flooring = round(total_cost * 0.14, 2)
    mep_electrical_plumbing = round(total_cost * 0.08, 2)
    permits_supervision = round(total_cost * 0.03, 2)
    contingency = round(total_cost * 0.03, 2)

    # Duration calculation in months
    duration_months = round(3.5 + (request.number_of_floors * 1.5), 1)
    total_weeks = int(round(duration_months * 4.33))

    # Phase duration distributions
    phase_weeks_ratios = [0.18, 0.32, 0.20, 0.12, 0.12, 0.06]
    calculated_phase_weeks = [max(2, int(round(total_weeks * r))) for r in phase_weeks_ratios]

    phases = [
        PhaseItem(
            phase_number=1,
            name="Substructure & Foundation",
            duration_weeks=calculated_phase_weeks[0],
            key_tasks=[
                "Site clearing, boundary demarcation, and excavation",
                "Plain Cement Concrete (PCC) bed casting",
                "R.C.C. isolated/raft footings and plinth beam erection",
                "Soil backfilling and anti-termite subterranean treatment"
            ],
            critical_milestone="Plinth beam casting and damp-proof course (DPC) inspection sign-off"
        ),
        PhaseItem(
            phase_number=2,
            name="RCC Superstructure Framing",
            duration_weeks=calculated_phase_weeks[1],
            key_tasks=[
                f"Column reinforcement tying, shuttering, and pouring across {request.number_of_floors} floors",
                "Slab formwork propping, staging, and beam bottom rebar placement",
                "Electrical conduit conduit routing embedded in slab casting",
                "Mass slab concrete casting and systematic 14-day water ponding curing"
            ],
            critical_milestone="Top floor roof slab casting and de-shuttering cube strength test certification"
        ),
        PhaseItem(
            phase_number=3,
            name="Masonry Envelope & Plastering",
            duration_weeks=calculated_phase_weeks[2],
            key_tasks=[
                "Autoclaved Aerated Concrete (AAC) / clay brick masonry wall erection",
                "Door and window lintel casting with jamb reinforcements",
                "Internal double-coat cement-sand plastering with true plumb-bob alignment",
                "External rough sponge finish sand-faced water-repellent plastering"
            ],
            critical_milestone="Lock-in of weather-tight building envelope and window frame anchoring"
        ),
        PhaseItem(
            phase_number=4,
            name="MEP Infrastructure (Electrical & Plumbing)",
            duration_weeks=calculated_phase_weeks[3],
            key_tasks=[
                "Concealed copper electrical wire pulling, distribution board wiring",
                "CPVC fresh water and SWR sewage drainage pipe rough-ins",
                "Hydrostatic pressure testing of bathroom and balcony pipe loops",
                "HVAC copper line and ventilation shaft routing"
            ],
            critical_milestone="Hydrostatic leak pressure test approval at 10 bar for 24 hours"
        ),
        PhaseItem(
            phase_number=5,
            name="Finishes, Flooring & Joinery",
            duration_weeks=calculated_phase_weeks[4],
            key_tasks=[
                f"Laying of {request.quality_grade.lower()} vitrified/granite tile flooring with zero lippage",
                "Kitchen granite counter-top fabrication with undermount sink",
                "Two coats of acrylic wall putty followed by primer and premium emulsion paint",
                "Fixing of flush doors, glass balustrades, and sanitary ware fittings"
            ],
            critical_milestone="Completion of final paint coat and electrical fixture energized testing"
        ),
        PhaseItem(
            phase_number=6,
            name="Final Snagging, Testing & Handover",
            duration_weeks=calculated_phase_weeks[5],
            key_tasks=[
                "Comprehensive punch-list / snagging rectification across all rooms",
                "Deep post-construction acid wash and glass panel cleaning",
                "Electrical load balancing check and plumbing drainage gradient verification",
                "Final client walkthrough and As-Built drawings handover"
            ],
            critical_milestone="Issuance of formal Completion Certificate & occupancy key handover"
        )
    ]

    risks = [
        "Material price volatility: Rebar steel and cement prices may fluctuate ±8-12% over project life.",
        "Monsoon delay window: Heavy rain can impede substructure earthwork and external facade plastering.",
        "Municipal approvals: Local authority sanction delays can alter planned ground-breaking dates.",
        f"Assumption: Ground soil bearing capacity (SBC) assumed at standard 150-200 kN/m² (IS medium soil)."
    ]

    # Generate 3D render visualization URL if requested
    visualization_url = None
    if request.generate_render:
        visualization_url = image_gen_service.generate_architectural_render(
            construction_type=request.construction_type,
            floors=request.number_of_floors,
            quality_grade=request.quality_grade,
            location=request.location,
            built_up_sqft=total_built_up_sqft
        )

    methodology = (
        f"Calculations derived from empirical IS 456 & CPWD rate analysis benchmarks. "
        f"Assumes 70% ground coverage footprint per floor with {request.quality_grade} grade finishes "
        f"and regional market rate factor ({loc_mult:.2f}x for {request.location})."
    )

    return ProjectPlannerResponse(
        total_built_up_area_sqft=total_built_up_sqft,
        estimated_duration_months=duration_months,
        construction_type=request.construction_type,
        quality_grade=request.quality_grade,
        materials=MaterialEstimates(
            cement_bags=cement_bags,
            sand_tons=sand_tons,
            aggregate_tons=aggregate_tons,
            steel_tons=steel_tons,
            bricks_or_blocks_count=bricks_count,
            concrete_volume_m3=concrete_m3
        ),
        cost_breakdown=CostBreakdown(
            civil_materials_inr=civil_materials,
            labour_charges_inr=labour_charges,
            finishing_flooring_inr=finishing_flooring,
            mep_electrical_plumbing_inr=mep_electrical_plumbing,
            permits_supervision_inr=permits_supervision,
            contingency_buffer_inr=contingency,
            total_estimated_cost_inr=total_cost,
            cost_per_sqft_inr=rate_per_sqft
        ),
        schedule_phases=phases,
        key_risks_and_assumptions=risks,
        visualization_url=visualization_url,
        methodology=methodology
    )
