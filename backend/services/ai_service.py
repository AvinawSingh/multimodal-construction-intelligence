import base64
import json
import logging
from typing import List, Optional, Dict, Any
import httpx
from config import get_settings
from schemas.models import (
    SafetyAnalysisResponse, HazardItem,
    CrackAnalysisResponse,
    KnowledgeResponse,
    ChatResponse, ChatMessage,
    DailySiteResponse, RiskMitigationItem
)

logger = logging.getLogger("ai_service")

class AIService:
    def __init__(self):
        self.settings = get_settings()

    @property
    def has_api_key(self) -> bool:
        return bool(self.settings.LLAMA_API_KEY and self.settings.LLAMA_API_KEY.strip())

    async def _call_llama_api(
        self,
        messages: List[Dict[str, Any]],
        model: str,
        temperature: float = 0.2,
        json_mode: bool = True
    ) -> Optional[str]:
        """Calls the configured Meta LLaMA API endpoint."""
        if not self.has_api_key:
            return None

        headers = {
            "Authorization": f"Bearer {self.settings.LLAMA_API_KEY.strip()}",
            "Content-Type": "application/json"
        }

        payload: Dict[str, Any] = {
            "model": model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": 2048,
        }

        if json_mode:
            payload["response_format"] = {"type": "json_object"}

        url = f"{self.settings.LLAMA_API_BASE_URL.rstrip('/')}/chat/completions"

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(url, headers=headers, json=payload)
                if response.status_code == 200:
                    data = response.json()
                    choices = data.get("choices", [])
                    if choices:
                        return choices[0].get("message", {}).get("content", "")
                else:
                    logger.warning(f"LLaMA API returned status {response.status_code}: {response.text}")
        except Exception as e:
            logger.error(f"Error calling LLaMA API: {str(e)}")
            
        return None

    # -------------------------------------------------------------
    # 1. Safety Monitor Analysis
    # -------------------------------------------------------------
    async def analyze_safety_image(
        self,
        image_bytes: bytes,
        mime_type: str,
        site_observation: Optional[str] = None
    ) -> SafetyAnalysisResponse:
        """
        Analyzes construction site image for PPE compliance, fall hazards, scaffolding, housekeeping, etc.
        """
        system_prompt = (
            "You are a Senior Construction Safety Director and OSHA-certified inspector. "
            "Examine the construction site image in detail. Evaluate PPE compliance (helmets, vests, boots, harnesses), "
            "fall hazards, scaffolding safety, open edges, debris, machinery, and electrical risks. "
            "Return ONLY a valid JSON object with this exact structure:\n"
            "{\n"
            '  "overall_risk_level": "Low" | "Medium" | "High" | "Critical",\n'
            '  "safety_score": 0 to 100 integer,\n'
            '  "ppe_compliance_rate": "string description e.g. 80% (Hardhats detected, missing high-vis vest)",\n'
            '  "detected_hazards": [\n'
            '    {\n'
            '      "hazard": "Name of hazard",\n'
            '      "category": "PPE" | "Fall Hazard" | "Scaffolding" | "Housekeeping" | "Electrical" | "Machinery",\n'
            '      "severity": "Low" | "Medium" | "High" | "Critical",\n'
            '      "location_in_image": "e.g. upper right scaffolding tier",\n'
            '      "observation": "detailed observation",\n'
            '      "recommendation": "corrective instruction"\n'
            "    }\n"
            "  ],\n"
            '  "positive_observations": ["list of compliant safety behaviors visible"],\n'
            '  "immediate_corrective_actions": ["urgent priority actions required today"],\n'
            '  "recommended_precautions": ["longer term safety protocols"],\n'
            '  "confidence_score": 0.85,\n'
            '  "uncertainty_notes": "any blur, occlusion, or lighting limits"\n'
            "}"
        )

        user_text = f"Analyze this construction site photo. Additional supervisor notes: {site_observation or 'None provided'}."

        if self.has_api_key:
            b64_image = base64.b64encode(image_bytes).decode("utf-8")
            messages = [
                {"role": "system", "content": system_prompt},
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": user_text},
                        {
                            "type": "image_url",
                            "image_url": {"url": f"data:{mime_type};base64,{b64_image}"}
                        }
                    ]
                }
            ]
            raw_result = await self._call_llama_api(
                messages=messages,
                model=self.settings.LLAMA_VISION_MODEL,
                temperature=0.1
            )
            if raw_result:
                try:
                    parsed = json.loads(raw_result)
                    hazards = [
                        HazardItem(
                            hazard=h.get("hazard", "Safety Observation"),
                            category=h.get("category", "General Safety"),
                            severity=h.get("severity", "Medium"),
                            location_in_image=h.get("location_in_image", "Site area"),
                            observation=h.get("observation", "Observable variance"),
                            recommendation=h.get("recommendation", "Review site protocol")
                        )
                        for h in parsed.get("detected_hazards", [])
                    ]
                    return SafetyAnalysisResponse(
                        overall_risk_level=parsed.get("overall_risk_level", "Medium"),
                        safety_score=int(parsed.get("safety_score", 70)),
                        ppe_compliance_rate=parsed.get("ppe_compliance_rate", "Evaluated from image"),
                        detected_hazards=hazards,
                        positive_observations=parsed.get("positive_observations", ["Site activity under progress"]),
                        immediate_corrective_actions=parsed.get("immediate_corrective_actions", ["Conduct tool-box talk"]),
                        recommended_precautions=parsed.get("recommended_precautions", ["Reinforce daily inspections"]),
                        confidence_score=float(parsed.get("confidence_score", 0.88)),
                        uncertainty_notes=parsed.get("uncertainty_notes", None),
                        is_demo_mode=False,
                        model_used=self.settings.LLAMA_VISION_MODEL
                    )
                except Exception as e:
                    logger.error(f"Error parsing vision response: {e}")

        # Clearly labeled Demo / Fallback Mode when no API key is provided
        return self._generate_safety_demo_result(site_observation)

    def _generate_safety_demo_result(self, site_observation: Optional[str]) -> SafetyAnalysisResponse:
        """Returns structured demonstration analysis with clear indicators."""
        hazards = [
            HazardItem(
                hazard="Incomplete Scaffolding Guardrails & Missing Toe-boards",
                category="Scaffolding",
                severity="High",
                location_in_image="Elevated work platform / middle tier",
                observation="Working deck lacks intermediate guardrails and kickplates, increasing drop hazards for tools and materials.",
                recommendation="Install standard top rail (42 inches), mid rail (21 inches), and 4-inch toe-boards before work resumes."
            ),
            HazardItem(
                hazard="Inconsistent Worker PPE Compliance",
                category="PPE",
                severity="Medium",
                location_in_image="Ground level masonry zone",
                observation="Workers observed handling cementitious materials without eye protection and reflective vests.",
                recommendation="Mandate EN 166 safety goggles and Class 2 high-visibility safety apparel for all personnel."
            ),
            HazardItem(
                hazard="Site Housekeeping & Tripping Clutter",
                category="Housekeeping",
                severity="Low",
                location_in_image="Access passageway and stairway base",
                observation="Rebar offcuts and loose timber formwork obstructing primary pedestrian transit lane.",
                recommendation="Designate scrap sorting bins and conduct end-of-shift 30-minute housekeeping clearance."
            )
        ]

        actions = [
            "Issue immediate Stop-Work order on un-railed scaffold platform until safety crew retrofits guardrails.",
            "Replenish PPE storage locker and issue protective eye gear to rebar and masonry teams.",
            "Clear debris and timber pallets from designated emergency egress path."
        ]

        precautions = [
            "Conduct daily 10-minute Pre-Task Safety Briefing (Toolbox Talk) focusing on working at height.",
            "Establish 100% tie-off policy with double-lanyard harnesses above 1.8 meters (6 feet).",
            "Perform weekly certified scaffold inspection and tag with Green/Red status cards."
        ]

        notes = (
            "Demonstration Mode: No Meta LLaMA API key configured. "
            "Showing standard multi-point construction safety audit simulation. "
            "To activate live multimodal vision AI, add LLAMA_API_KEY in backend/.env."
        )

        return SafetyAnalysisResponse(
            overall_risk_level="Medium",
            safety_score=68,
            ppe_compliance_rate="72% (Helmets worn; high-vis vests and safety glasses partially missing)",
            detected_hazards=hazards,
            positive_observations=[
                "Hard hats observed on majority of active personnel",
                "Perimeter safety barricade present around foundation pit"
            ],
            immediate_corrective_actions=actions,
            recommended_precautions=precautions,
            confidence_score=0.82,
            uncertainty_notes=notes,
            is_demo_mode=True,
            model_used="SkillWallet Safety Heuristic Engine (Demo Mode)"
        )

    # -------------------------------------------------------------
    # 2. Structural Crack Detection
    # -------------------------------------------------------------
    async def analyze_crack_image(
        self,
        image_bytes: bytes,
        mime_type: str,
        user_notes: Optional[str] = None
    ) -> CrackAnalysisResponse:
        """
        Analyzes concrete/masonry crack pattern, orientation, estimated severity, and potential risks.
        """
        system_prompt = (
            "You are an expert Structural Engineering Consultant specializing in building forensics. "
            "Examine the crack in the uploaded photo. Evaluate crack orientation (diagonal, horizontal, vertical, map-cracking), "
            "apparent width, surface material (RCC beam, slab, brick masonry, plaster), potential structural hazards, "
            "possible causes (drying shrinkage, foundation settlement, shear stress, rebar corrosion), and actionable recommendations. "
            "Return ONLY a valid JSON object with this exact structure:\n"
            "{\n"
            '  "crack_classification": "e.g. Diagonal Structural Shear Crack / Plastic Shrinkage / Thermal Expansion",\n'
            '  "apparent_severity": "Minor" | "Moderate" | "Severe" | "Critical",\n'
            '  "estimated_width_mm": "e.g. 1.5 - 2.5 mm",\n'
            '  "visible_characteristics": ["list of observable patterns"],\n'
            '  "possible_causes": ["list of structural/environmental causes"],\n'
            '  "potential_risks": ["possible safety and structural consequences"],\n'
            '  "recommended_next_steps": ["step by step remediation or testing guidelines"],\n'
            '  "professional_inspection_required": true,\n'
            '  "confidence_score": 0.85\n'
            "}"
        )

        user_text = f"Analyze this crack image. Description/Notes: {user_notes or 'None provided'}."

        if self.has_api_key:
            b64_image = base64.b64encode(image_bytes).decode("utf-8")
            messages = [
                {"role": "system", "content": system_prompt},
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": user_text},
                        {
                            "type": "image_url",
                            "image_url": {"url": f"data:{mime_type};base64,{b64_image}"}
                        }
                    ]
                }
            ]
            raw_result = await self._call_llama_api(
                messages=messages,
                model=self.settings.LLAMA_VISION_MODEL,
                temperature=0.1
            )
            if raw_result:
                try:
                    parsed = json.loads(raw_result)
                    return CrackAnalysisResponse(
                        crack_classification=parsed.get("crack_classification", "Structural Crack"),
                        apparent_severity=parsed.get("apparent_severity", "Moderate"),
                        estimated_width_mm=parsed.get("estimated_width_mm", "1 - 3 mm"),
                        visible_characteristics=parsed.get("visible_characteristics", ["Continuous fracture pattern"]),
                        possible_causes=parsed.get("possible_causes", ["Differential settlement or thermal strain"]),
                        potential_risks=parsed.get("potential_risks", ["Moisture ingress and concrete carbonation"]),
                        recommended_next_steps=parsed.get("recommended_next_steps", ["Install tell-tale crack gauge"]),
                        professional_inspection_required=parsed.get("professional_inspection_required", True),
                        confidence_score=float(parsed.get("confidence_score", 0.82)),
                        is_demo_mode=False,
                        model_used=self.settings.LLAMA_VISION_MODEL
                    )
                except Exception as e:
                    logger.error(f"Error parsing crack analysis response: {e}")

        return self._generate_crack_demo_result(user_notes)

    def _generate_crack_demo_result(self, user_notes: Optional[str]) -> CrackAnalysisResponse:
        return CrackAnalysisResponse(
            crack_classification="Diagonal Shear / Differential Settlement Crack",
            apparent_severity="Moderate",
            estimated_width_mm="1.5 - 2.8 mm",
            visible_characteristics=[
                "Stepped diagonal fracture tracing mortar joints and concrete boundary",
                "Slight edge spalling and micro-fragmentation along the fissure edge",
                "Visible crack propagation path extending across load-bearing masonry wall",
                "Minor moisture stain indicating atmospheric permeability"
            ],
            possible_causes=[
                "Differential foundation settlement under uneven ground bearing pressure",
                "Thermal cyclic contraction and expansion without adequate relief joints",
                "Shear stress concentration near structural beam-column junction",
                "Concrete drying shrinkage exacerbated by rapid curing evaporation"
            ],
            potential_risks=[
                "Progressive widening if ground subsidence continues active movement",
                "Water seepage causing rebar corrosion, rust expansion, and concrete spalling",
                "Degradation of acoustic and thermal insulation performance",
                "Potential reduction in masonry shear capacity during seismic vibrations"
            ],
            recommended_next_steps=[
                "Mount an Avongard calibrated acrylic tell-tale crack monitor to verify if the crack is active or dormant.",
                "Engage a licensed structural engineer (Chartered / PE) to conduct rebound hammer and ultrasonic pulse testing.",
                "If dormant: V-groove rout the crack, vacuum clean, and inject non-shrink polyurethane or epoxy resin.",
                "If active: Conduct geotechnical soil testing and underpin the affected foundation footing.",
                "Avoid cosmetic plastering over the crack until structural movement verification is completed."
            ],
            professional_inspection_required=True,
            confidence_score=0.84,
            is_demo_mode=True,
            model_used="SkillWallet Structural Heuristics Engine (Demo Mode)"
        )

    # -------------------------------------------------------------
    # 3. Knowledge Assistant
    # -------------------------------------------------------------
    async def ask_knowledge(self, category: str, question: str) -> KnowledgeResponse:
        system_prompt = (
            "You are a Senior Construction Engineering Specialist and Standards Consultant. "
            "Provide accurate, authoritative, practical construction knowledge adhering to international standards (OSHA, IS, BS, ACI). "
            "Return ONLY a valid JSON object matching this structure:\n"
            "{\n"
            '  "category": "Safety" | "Technique" | "Documentation",\n'
            '  "answer": "Clear, comprehensive expert answer",\n'
            '  "key_points": ["bulleted key technical takeaways"],\n'
            '  "precautions": ["critical safety/quality precautions"],\n'
            '  "applicable_standards": ["relevant codes like IS 456, ACI 318, OSHA 1926"],\n'
            '  "limitations": "crucial project-specific boundaries and disclaimers"\n'
            "}"
        )

        user_content = f"Category: {category}\nQuestion: {question}"

        if self.has_api_key:
            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_content}
            ]
            raw_result = await self._call_llama_api(
                messages=messages,
                model=self.settings.LLAMA_TEXT_MODEL,
                temperature=0.2
            )
            if raw_result:
                try:
                    parsed = json.loads(raw_result)
                    return KnowledgeResponse(
                        category=parsed.get("category", category),
                        question=question,
                        answer=parsed.get("answer", ""),
                        key_points=parsed.get("key_points", []),
                        precautions=parsed.get("precautions", []),
                        applicable_standards=parsed.get("applicable_standards", []),
                        limitations=parsed.get("limitations", "Consult local building codes and site structural drawings."),
                        is_demo_mode=False
                    )
                except Exception as e:
                    logger.error(f"Error parsing knowledge response: {e}")

        # Deterministic Knowledge Base for Demo Mode
        return self._generate_knowledge_demo_result(category, question)

    def _generate_knowledge_demo_result(self, category: str, question: str) -> KnowledgeResponse:
        q_lower = question.lower()
        
        if "curing" in q_lower or "concrete" in q_lower:
            answer = (
                "Concrete curing is the process of maintaining satisfactory moisture content and temperature in concrete during "
                "its early stages so that desired compressive strength, durability, and volume stability can develop. "
                "For Ordinary Portland Cement (OPC), minimum wet curing duration is 7 to 10 days, while for blended cements (PPC/PSC) "
                "or hot weather conditions, a minimum of 14 days is strictly recommended."
            )
            key_points = [
                "Hydration of cement requires continuous moisture; dry concrete ceases strength gain prematurely.",
                "Ponding method is ideal for flat horizontal slabs; wet hessian burlap wrapping works best for columns and beams.",
                "Membrane-forming curing compounds are suitable when water is scarce, applied immediately after surface sheen disappears.",
                "Concrete reaches approximately 65-70% of 28-day characteristic strength within 7 days of moist curing."
            ]
            precautions = [
                "Never allow concrete surface to dry out between wetting cycles, as alternating wet-dry cycles induce thermal cracking.",
                "Water used for curing must be potable and free from deleterious amounts of salts, oils, or acids (pH >= 6).",
                "In cold weather (< 5°C), protect green concrete from freezing using thermal insulating blankets."
            ]
            standards = ["IS 456:2000 (Plain and Reinforced Concrete)", "ACI 308R (Guide to Curing Concrete)", "BS 8110"]
        elif "scaffold" in q_lower or "height" in q_lower or "fall" in q_lower:
            answer = (
                "Working at height is the single largest cause of fatal construction accidents. Any work performed where a person "
                "could fall 1.8 meters (6 feet) or more requires compliant passive fall arrest systems (guardrails) or active personal fall "
                "arrest systems (full-body harness with shock-absorbing lanyard tied off to an engineered anchorage point)."
            )
            key_points = [
                "Three-tier guardrail system: Top rail at 42 inches (±3 in), mid rail at 21 inches, and toe-boards at least 4 inches high.",
                "Scaffold footing must rest on rigid, level mud sills; never use hollow blocks or unstable packing.",
                "Scaffold towers must be securely anchored and braced to the permanent structure every 4 times the minimum base dimension.",
                "Daily pre-shift inspection by a designated competent person and green tag certification is mandatory."
            ]
            precautions = [
                "Inspect safety harness webbing, D-rings, and snaphooks before every single use.",
                "Maintain 100% tie-off discipline using twin-tailed lanyards during transit between anchor points.",
                "Never exceed scaffold maximum intended working load capacity (Light Duty: 120 kg/m², Heavy Duty: 240 kg/m²)."
            ]
            standards = ["OSHA 29 CFR 1926.451 (Scaffolds)", "IS 4014 (Code of Practice for Steel Tubular Scaffolding)", "EN 12810"]
        else:
            answer = (
                f"Construction guidance for '{question}': Standard civil engineering practice requires strict adherence to project "
                f"specifications, structural blueprints, material quality control testing, and proactive health and safety risk assessments."
            )
            key_points = [
                "Always verify contractor shop drawings against stamped structural architectural design sheets.",
                "Maintain batch testing records: slump cone test for workability, cube compressive tests at 7 and 28 days.",
                "Implement a formal Request for Inspection (RFI) workflow before pouring any structural member.",
                "Ensure proper storage of cement bags on raised timber pallets in moisture-proof sheds."
            ]
            precautions = [
                "Never permit water addition to ready-mix concrete on site without structural approval.",
                "Enforce mandatory PPE zones across all active construction sectors.",
                "Report any deviation from structural reinforcement cover clearances immediately."
            ]
            standards = ["IS 456:2000", "NBC 2016 (National Building Code)", "OSHA 1926 Construction Standards"]

        return KnowledgeResponse(
            category=category,
            question=question,
            answer=answer,
            key_points=key_points,
            precautions=precautions,
            applicable_standards=standards,
            limitations=(
                "Demonstration Mode: Generic expert reference data displayed. "
                "Always verify site-specific conditions against stamped engineering documentation and local bylaws."
            ),
            is_demo_mode=True
        )

    # -------------------------------------------------------------
    # 4. Construction Chatbot
    # -------------------------------------------------------------
    async def chat_completion(self, message: str, history: List[ChatMessage]) -> ChatResponse:
        system_prompt = (
            "You are SkillWallet AI, an authoritative, experienced Construction Management and Civil Engineering Advisor. "
            "You assist site engineers, project managers, contractors, and builders with concrete mix designs, "
            "material estimation, safety protocols, structural integrity, scaffolding, building codes, schedule tracking, "
            "and cost optimization. Be concise, technically precise, practical, and safety-conscious. "
            "Always include important safety cautions when giving structural or elevated work advice."
        )

        if self.has_api_key:
            messages = [{"role": "system", "content": system_prompt}]
            for msg in history[-8:]:  # keep last 8 messages for context
                messages.append({"role": msg.role, "content": msg.content})
            messages.append({"role": "user", "content": message})

            raw_result = await self._call_llama_api(
                messages=messages,
                model=self.settings.LLAMA_TEXT_MODEL,
                temperature=0.3,
                json_mode=False
            )
            if raw_result:
                return ChatResponse(
                    reply=raw_result.strip(),
                    sources_or_references=["Meta LLaMA Civil Engineering Model", "Standard Building Specifications"],
                    is_demo_mode=False
                )

        # Demo conversational assistant response
        return self._generate_chat_demo_result(message)

    def _generate_chat_demo_result(self, message: str) -> ChatResponse:
        msg = message.lower()
        if "mix" in msg or "concrete" in msg or "ratio" in msg:
            reply = (
                "**Standard Nominal Concrete Mix Ratios (IS 456 / ACI Standards):**\n\n"
                "- **M15 (1 : 2 : 4)** — 1 part Cement, 2 parts Sand, 4 parts Aggregate (~15 MPa / 2175 psi). Suitable for non-structural plain concrete (PCC), bedding, and pathways.\n"
                "- **M20 (1 : 1.5 : 3)** — 1 part Cement, 1.5 parts Sand, 3 parts Aggregate (~20 MPa / 2900 psi). Standard minimum grade for general RCC slabs, beams, and columns in low-rise residential construction.\n"
                "- **M25 (1 : 1 : 2)** — 1 part Cement, 1 part Sand, 2 parts Aggregate (~25 MPa / 3625 psi). Recommended for heavy structural elements, water tanks, footings, and multi-story frames.\n\n"
                "*Key Tip:* Maintain water-cement ratio between 0.45 and 0.50. Adding excess water weakens concrete compressive strength and promotes surface shrinkage cracks."
            )
        elif "steel" in msg or "rebar" in msg:
            reply = (
                "**Reinforcement Steel (TMT Rebar) Heuristics:**\n\n"
                "Approximate structural steel thumb rules per unit built-up volume:\n"
                "- **Slabs:** ~70 - 90 kg/m³ (~3.5 - 4.5 kg/sq.ft of slab area)\n"
                "- **Beams:** ~120 - 160 kg/m³\n"
                "- **Columns:** ~160 - 200 kg/m³\n"
                "- **Footings / Foundations:** ~80 - 110 kg/m³\n\n"
                "**Overall Residential Building Heuristic:** 3.5 to 4.5 kg of Fe 500D / Fe 550D TMT steel per square foot of total built-up area.\n\n"
                "*Safety Note:* Always ensure minimum clear concrete cover: 20mm for slabs, 25mm for beams, 40mm for columns, and 50mm for foundations in contact with soil."
            )
        elif "waterproof" in msg or "leak" in msg or "damp" in msg:
            reply = (
                "**Structural Waterproofing Best Practices:**\n\n"
                "1. **Surface Preparation:** Mechanically clean substrate, hack loose laitance, and rout out honeycombed concrete.\n"
                "2. **Coving / Fillets:** Form 45-degree angle polymer-modified mortar fillets at all floor-to-wall junctions to prevent shear stress tear in the membrane.\n"
                "3. **Two-Coat Elastomeric Membrane:** Apply acrylic polymer or polyurethane cementitious waterproof coating crosswise (second coat perpendicular to first).\n"
                "4. **Ponding Test:** Fill with 50mm water for a minimum of 48 to 72 hours before laying protective screed or tiles to verify complete impermeability."
            )
        else:
            reply = (
                f"Thank you for your construction query: **'{message}'**.\n\n"
                "On active jobsites, standard project workflow requires:\n"
                "1. Verifying material test certificates (MTC) for steel heat batches and 53-grade OPC cement.\n"
                "2. Checking ambient temperature and weather advisories prior to mass concreting or exterior coatings.\n"
                "3. Enforcing mandatory 5-point PPE (Helmet, High-Vis Vest, Steel-Toe Boots, Eye Protection, Gloves).\n"
                "4. Logging all daily workforce tallies, equipment hours, and weather downtime in the official Site Clerk Log.\n\n"
                "*(Note: Running in SkillWallet Construction Assistant Demo Mode. To enable full generative LLaMA model inference, set `LLAMA_API_KEY` in backend/.env)*"
            )

        return ChatResponse(
            reply=reply,
            sources_or_references=["Civil Engineering Practice Handbook", "IS 456:2000 Guidelines", "OSHA 1926"],
            is_demo_mode=True
        )

    # -------------------------------------------------------------
    # 5. Daily Site Assistant
    # -------------------------------------------------------------
    async def plan_daily_site(
        self,
        planned_activity: str,
        workforce_count: int,
        site_condition: str,
        weather_context: Optional[str] = None,
        notes: Optional[str] = None
    ) -> DailySiteResponse:
        system_prompt = (
            "You are a Senior Construction Site Superintendent. Generate an actionable, structured daily shift plan. "
            "Return ONLY a valid JSON object matching this structure:\n"
            "{\n"
            '  "daily_task_breakdown": ["step 1", "step 2", "step 3", "step 4", "step 5"],\n'
            '  "required_materials_and_equipment": ["materials and plant equipment needed"],\n'
            '  "site_safety_checklist": ["mandatory pre-shift safety checks"],\n'
            '  "potential_risks_and_mitigation": [{"risk": "description", "mitigation": "action"}],\n'
            '  "productivity_recommendations": ["tips to maximize shift throughput"]\n'
            "}"
        )

        user_content = (
            f"Planned Activity: {planned_activity}\n"
            f"Available Workforce: {workforce_count} workers\n"
            f"Site Condition: {site_condition}\n"
            f"Weather Context: {weather_context or 'Normal'}\n"
            f"Special Notes: {notes or 'None'}"
        )

        if self.has_api_key:
            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_content}
            ]
            raw_result = await self._call_llama_api(
                messages=messages,
                model=self.settings.LLAMA_TEXT_MODEL,
                temperature=0.2
            )
            if raw_result:
                try:
                    parsed = json.loads(raw_result)
                    risks = [
                        RiskMitigationItem(risk=r.get("risk", "Site Risk"), mitigation=r.get("mitigation", "Follow protocol"))
                        for r in parsed.get("potential_risks_and_mitigation", [])
                    ]
                    return DailySiteResponse(
                        planned_activity=planned_activity,
                        daily_task_breakdown=parsed.get("daily_task_breakdown", []),
                        required_materials_and_equipment=parsed.get("required_materials_and_equipment", []),
                        site_safety_checklist=parsed.get("site_safety_checklist", []),
                        potential_risks_and_mitigation=risks,
                        productivity_recommendations=parsed.get("productivity_recommendations", []),
                        is_demo_mode=False
                    )
                except Exception as e:
                    logger.error(f"Error parsing daily site plan: {e}")

        # Deterministic Daily Site Plan for Demo Mode
        return self._generate_daily_site_demo(planned_activity, workforce_count, site_condition, weather_context)

    def _generate_daily_site_demo(
        self,
        activity: str,
        workforce: int,
        condition: str,
        weather: Optional[str]
    ) -> DailySiteResponse:
        tasks = [
            f"08:00 - 08:30: Muster roll, assign {workforce} workers into 3 crews, conduct pre-shift safety briefing.",
            "08:30 - 11:30: Mobilize equipment, verify material staging and clear work zone.",
            f"11:30 - 13:30: Primary execution phase for '{activity}' under direct foreman supervision.",
            "14:15 - 16:30: Secondary processing, quality inspection checkpoints, and joint alignment.",
            "16:30 - 17:00: End-of-shift site clean-up, tool inventory count, and daily log sign-off."
        ]

        materials = [
            f"Primary activity materials scaled for crew of {workforce} personnel",
            "Personal Protective Equipment (Hard hats, steel-toe boots, hi-vis vests, work gloves)",
            "Precision measuring tools (auto-level / laser meter, steel tape, chalk lines)",
            "Safety barriers, hazard tape, and portable fire extinguishers staged at work area",
            "Heavy equipment & power tools appropriate for the task (inspected & tagged)"
        ]

        checklist = [
            "Verify all workers have attended safety induction and are wearing required PPE.",
            f"Inspect ground and scaffold stability under current condition: '{condition}'.",
            "Check that power tools and extension cords are grounded with functional GFCI / ELCB breakers.",
            "Confirm emergency first aid kit and site drinking water stations are fully stocked.",
            "Verify clear emergency access route for ambulances or utility vehicles."
        ]

        risks = [
            RiskMitigationItem(
                risk="Worker fatigue, hydration loss, or heat stress during prolonged shift",
                mitigation="Mandate scheduled 15-minute shaded water breaks every 2 hours and monitor worker alertness."
            ),
            RiskMitigationItem(
                risk="Material handling strains and pinch point injuries",
                mitigation="Enforce two-person lift rule for items > 25 kg and inspect heavy duty rigging slings."
            ),
            RiskMitigationItem(
                risk="Weather fluctuation or environmental changes impacting site condition",
                mitigation="Keep waterproof poly-sheets on standby and monitor live weather alerts."
            )
        ]

        tips = [
            f"Organize your {workforce} workers into specialized task cells: 40% on main task, 30% material staging, 30% finishing & QC.",
            "Stage materials within 10 meters of active work zone to cut transit downtime by up to 25%.",
            "Take high-resolution progress photos at 10:00, 14:00, and 17:00 for the daily client progress dossier."
        ]

        return DailySiteResponse(
            planned_activity=activity,
            daily_task_breakdown=tasks,
            required_materials_and_equipment=materials,
            site_safety_checklist=checklist,
            potential_risks_and_mitigation=risks,
            productivity_recommendations=tips,
            is_demo_mode=True
        )

ai_service = AIService()
