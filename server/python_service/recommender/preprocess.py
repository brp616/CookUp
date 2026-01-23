def combine_features(row):
    # Combine fields from your Post.js schema
    # We use " " to separate words so the model doesn't get confused
    tags = " ".join(row.get("tags", [])) if isinstance(row.get("tags"), list) else ""
    category = row.get("cookbookCategory", "")
    title = row.get("recipeName", "")
    desc = row.get("description", "")
    
    # Weighting: We repeat tags/category to make them more important than description
    return f"{tags} {tags} {category} {category} {title} {desc}"