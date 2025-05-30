from typing import Dict
import logging
from typing import Dict, Optional

def validate_criteria(hard_criteria: Dict[str, bool],
                     soft_criteria: Dict[str, float],
                     soft_weights: Dict[str, float]) -> Optional[str]:
    """
    Validates the input criteria and weights.
    
    Returns:
        Optional[str]: Error message if validation fails, None if validation passes
    """
    # Check if all soft criteria have corresponding weights
    missing_weights = set(soft_criteria.keys()) - set(soft_weights.keys())
    if missing_weights:
        return f"Missing weights for criteria: {missing_weights}"

    # Check if all weights have corresponding criteria
    unused_weights = set(soft_weights.keys()) - set(soft_criteria.keys())
    if unused_weights:
        return f"Weights specified for non-existent criteria: {unused_weights}"

    # Validate soft criteria values are between 0 and 1
    invalid_values = {k: v for k, v in soft_criteria.items() if not 0 <= v <= 1}
    if invalid_values:
        return f"Soft criteria values must be between 0 and 1: {invalid_values}"

    # Validate weights sum to approximately 1
    weight_sum = sum(soft_weights.values())
    if not 0.99 <= weight_sum <= 1.01:  # Allow small floating point imprecision
        return f"Weights must sum to 1.0 (current sum: {weight_sum:.2f})"

    return None

def evaluate_location(hard_criteria: Dict[str, bool],
                     soft_criteria: Dict[str, float],
                     soft_weights: Dict[str, float]) -> float:
    """
    Calculates the Environmental Suitability Index (ESI) for a given location.

    Args:
        hard_criteria (dict): Name -> True/False (False = exclusion criterion applies → ESI = 0)
        soft_criteria (dict): Name -> value normalized in range 0-1
        soft_weights (dict): Name -> criterion weight (e.g., 0.2, 0.5, ...)

    Returns:
        float: resulting ESI index (0-1)
    """
    # 1. Validate inputs
    validation_error = validate_criteria(hard_criteria, soft_criteria, soft_weights)
    if validation_error:
        logging.error(f"Validation failed: {validation_error}")
        return 0.0

    # 2. Check exclusion criteria
    for key, is_ok in hard_criteria.items():
        if not is_ok:
            logging.info(f"Location excluded due to hard criterion: {key}")
            return 0.0

    # 3. Sum weighted soft criteria
    score = 0.0
    for key, value in soft_criteria.items():
        weight = soft_weights[key]  # We can safely access this after validation
        score += weight * value

    return score


# 🧪 Example data for one location

hard_criteria = {
    "not_in_protected_area": True,
    "not_in_restricted_zone": True,
    "not_in_flood_zone_Q100": True
}

soft_criteria = {
    "distance_from_protected_area": 0.9,  # 0 = at boundary, 1 = very far
    "flood_zone_type": 0.6,              # 1 = outside flood zones, 0 = worst flood zone
    "forest_density": 0.3,               # 0 = dense forest, 1 = field
    "distance_from_residential": 0.7      # 0 = too close, 1 = optimal distance
}

soft_weights = {
    "distance_from_protected_area": 0.3,
    "flood_zone_type": 0.4,
    "forest_density": 0.2,
    "distance_from_residential": 0.1
}

esi = evaluate_location(hard_criteria, soft_criteria, soft_weights)
print(f"ESI index: {esi:.2f}")

# Example with validation error
invalid_weights = soft_weights.copy()
invalid_weights["distance_from_protected_area"] = 0.5  # This will make sum > 1.0

esi_invalid = evaluate_location(hard_criteria, soft_criteria, invalid_weights)
print(f"ESI index (with invalid weights): {esi_invalid:.2f}")
