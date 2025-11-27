from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class AutocompleteRequest(BaseModel):
    code: str
    cursorPosition: int
    language: str = "python"

class AutocompleteResponse(BaseModel):
    suggestion: str

@router.post("/autocomplete", response_model=AutocompleteResponse)
def autocomplete(req: AutocompleteRequest):
    """
    Very simple rule-based mocked autocomplete.
    """
    prefix = req.code[:req.cursorPosition]
    stripped = prefix.rstrip()

    suggestion = ""

    if stripped.endswith("def") or stripped.endswith("def "):
        suggestion = " func_name(params):\n    \"\"\"TODO: docstring\"\"\"\n    pass"
    elif stripped.endswith("."):
        # if user typed a dot, suggest a common method
        suggestion = "append(item)"
    elif stripped.endswith("for "):
        suggestion = "i in range(0):\n    pass"
    elif "print(" in stripped:
        suggestion = "'Hello')"
    else:
        # fallback short suggestion: print statement
        suggestion = "print('')"

    return {"suggestion": suggestion}
