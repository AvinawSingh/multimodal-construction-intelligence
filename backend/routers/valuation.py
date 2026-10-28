from fastapi import APIRouter
from schemas.models import ValuationRequest, ValuationResponse

router = APIRouter(prefix="/valuation", tags=["Real Estate Valuation"])

CITY_BASE_BENCHMARKS = {
    "mumbai": 17500.0,
    "delhi": 11500.0,
    "gurgaon": 12000.0,
    "noida": 8500.0,
    "bengaluru": 9200.0,
    "bangalore": 9200.0,
    "hyderabad": 8200.0,
    "pune": 7800.0,
    "chennai": 7500.0,
    "kolkata": 6200.0,
    "ahmedabad": 5800.0
}

TYPE_FACTORS = {
    "apartment": 1.0,
    "independent house": 1.18,
    "villa": 1.35,
    "commercial office": 1.30,
    "retail shop": 1.65
}

CONDITION_FACTORS = {
    "under construction": 0.93,
    "brand new / recently built": 1.08,
    "good / well maintained": 1.0,
    "needs renovation / repair": 0.84
}

@router.post("/estimate", response_model=ValuationResponse)
def estimate_valuation(request: ValuationRequest):
    city_key = request.city.lower().strip()
    base_sqft = 5600.0  # National tier-2 baseline
    for c, rate in CITY_BASE_BENCHMARKS.items():
        if c in city_key or c in request.location.lower():
            base_sqft = rate
            break

    # Type factor
    type_factor = TYPE_FACTORS.get(request.property_type.lower(), 1.0)

    # Condition factor
    cond_factor = CONDITION_FACTORS.get(request.condition.lower(), 1.0)

    # Age depreciation: 1.0% per year, capped at 35%
    age_depreciation_pct = min(0.35, max(0.0, request.building_age_years * 0.010))

    # Amenities premium: +1.5% per selected amenity, max +15%
    amenity_count = len(request.amenities)
    amenity_premium_pct = min(0.15, amenity_count * 0.015)

    # Effective rate per sq ft
    effective_rate_per_sqft = base_sqft * type_factor * cond_factor * (1.0 - age_depreciation_pct) * (1.0 + amenity_premium_pct)
    effective_rate_per_sqft = round(effective_rate_per_sqft, 2)

    # Parking premium
    parking_premium_inr = max(0, request.parking_spaces - 1) * 250000.0

    # Total average valuation
    avg_value = round((effective_rate_per_sqft * request.property_area_sqft) + parking_premium_inr, 2)
    min_value = round(avg_value * 0.92, 2)
    max_value = round(avg_value * 1.08, 2)

    # Rental yields: Commercial ~7.0%, Residential ~3.2%
    is_commercial = "commercial" in request.property_type.lower() or "retail" in request.property_type.lower()
    annual_yield_rate = 0.070 if is_commercial else 0.032
    indicative_monthly_rent = round((avg_value * annual_yield_rate) / 12.0, 2)
    gross_yield_pct = round(annual_yield_rate * 100.0, 2)

    # 5-year capital appreciation projection (assuming conservative 7.2% CAGR)
    # Compound: (1 + 0.072)^5 - 1 ≈ 41.5%
    cagr = 0.072
    five_year_growth_pct = round((( (1.0 + cagr) ** 5 ) - 1.0) * 100.0, 1)

    drivers = [
        f"Micro-market locality index for {request.city} (base ₹{base_sqft:,.0f}/sq.ft)",
        f"Property typology factor for {request.property_type} ({type_factor:.2f}x weight)",
        f"Physical condition assessment: '{request.condition}' ({cond_factor:.2f}x)",
        f"Building age adjustment: {request.building_age_years} years ({age_depreciation_pct*100:.1f}% depreciation factor)",
        f"Amenities inclusion: {amenity_count} premium amenities accounted (+{amenity_premium_pct*100:.1f}%)"
    ]

    assumptions = [
        "Title deed is clear, freehold, and encumbrance-free with approved municipal sanction plans.",
        "Infrastructure development and transit connectivity in the sub-market remain stable.",
        f"Gross rental yield estimated at {gross_yield_pct}% per annum before property taxes and maintenance reserves.",
        f"Projected 5-year capital appreciation assumes moderate 7.2% annual compound growth."
    ]

    return ValuationResponse(
        estimated_market_value_min_inr=min_value,
        estimated_market_value_max_inr=max_value,
        estimated_market_value_avg_inr=avg_value,
        price_per_sqft_inr=effective_rate_per_sqft,
        indicative_monthly_rent_inr=indicative_monthly_rent,
        gross_rental_yield_percent=gross_yield_pct,
        roi_5yr_appreciation_percent=five_year_growth_pct,
        valuation_drivers=drivers,
        market_assumptions=assumptions
    )
