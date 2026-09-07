import re
from typing import Dict, List, Tuple
from sqlalchemy import create_engine, inspect

# Simple in-memory cache
_schema_cache: Dict[str, List[Dict]] = {}


def _tokenize(text: str) -> set[str]:
    """Basic tokenizer: lowercases and extracts alphanumeric words."""
    words = re.findall(r'\b\w+\b', text.lower())
    # Exclude common SQL/English stop words to improve keyword matching
    stopwords = {"show", "me", "the", "all", "of", "and", "or", "in", "by", "for", "with", "from", "select", "where", "table", "tables"}
    return {w for w in words if w not in stopwords}


def _get_all_tables_info(connection_url: str) -> List[Dict]:
    """Extracts schema info for all tables and caches it."""
    if connection_url in _schema_cache:
        return _schema_cache[connection_url]

    engine = create_engine(connection_url)
    inspector = inspect(engine)
    table_names = inspector.get_table_names()

    tables_info = []
    for table_name in table_names:
        columns = inspector.get_columns(table_name)
        col_names = [col['name'] for col in columns]
        
        # Create a text representation for keyword matching
        text_repr = f"{table_name} " + " ".join(col_names)
        
        # Create the schema string for the prompt
        schema_lines = [f"Table: {table_name}"]
        for col in columns:
            schema_lines.append(f"  - {col['name']} ({col['type']})")
        schema_str = "\n".join(schema_lines)
        
        tables_info.append({
            "name": table_name,
            "text": text_repr,
            "tokens": _tokenize(text_repr),
            "schema_str": schema_str
        })
        
    _schema_cache[connection_url] = tables_info
    return tables_info


def get_relevant_tables(connection_url: str, question: str, top_n: int = 5) -> str:
    """
    Retrieves the top N relevant tables for a given question using 
    Jaccard similarity/keyword overlap, avoiding heavy vector DB dependencies.
    """
    tables_info = _get_all_tables_info(connection_url)
    
    # If small number of tables, just return all of them
    if len(tables_info) <= 10:
        return "\n\n".join(t["schema_str"] for t in tables_info)
        
    question_tokens = _tokenize(question)
    
    if not question_tokens:
        # Fallback if no keywords found: just return first N tables
        return "\n\n".join(t["schema_str"] for t in tables_info[:top_n])
        
    # Score tables based on token overlap (Jaccard-ish)
    scored_tables: List[Tuple[float, Dict]] = []
    
    for t in tables_info:
        intersection = question_tokens.intersection(t["tokens"])
        if not intersection:
            score = 0.0
        else:
            # Overlap coefficient: size of intersection divided by size of question tokens
            score = len(intersection) / len(question_tokens)
            
            # Boost score slightly if exact table name is mentioned
            if t["name"].lower() in question_tokens:
                score += 0.5
                
        scored_tables.append((score, t))
        
    # Sort by score descending
    scored_tables.sort(key=lambda x: x[0], reverse=True)
    
    # Get top N, but include any table with a score > 0 if there are ties
    top_tables = [t for score, t in scored_tables[:top_n]]
    
    return "\n\n".join(t["schema_str"] for t in top_tables)
