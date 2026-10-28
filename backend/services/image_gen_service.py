import urllib.parse
from typing import Optional
from config import get_settings

class ImageGenService:
    def __init__(self):
        self.settings = get_settings()

    def generate_architectural_render(
        self,
        construction_type: str,
        floors: int,
        quality_grade: str,
        location: str,
        built_up_sqft: float
    ) -> Optional[str]:
        """
        Generates a conceptual 3D architectural visualization render URL using Flux / Pollinations.
        Returns a direct URL that renders the 3D exterior architectural perspective.
        """
        if not self.settings.ENABLE_IMAGE_GENERATION:
            return None

        prompt = (
            f"Professional architectural 3D exterior visualization of a modern {floors}-story {construction_type.lower()} building, "
            f"{quality_grade.lower()} specifications, modern concrete glass facade, landscaped surroundings, "
            f"photorealistic lighting, 8k architectural rendering, daylight, crisp shadows, octane render style"
        )
        
        encoded_prompt = urllib.parse.quote(prompt)
        # Using Pollinations Flux endpoint with high resolution
        image_url = f"https://image.pollinations.ai/prompt/{encoded_prompt}?width=1024&height=768&nologo=true&seed=42&model=flux"
        return image_url

image_gen_service = ImageGenService()
